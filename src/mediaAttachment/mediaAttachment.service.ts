import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
    SASProtocol,
} from "@azure/storage-blob";
import { MediaAttachmentEntity } from "./entity/mediaAttachment.entity";
import { CreateMediaAttachmentDto } from "./dto/create-mediaAttachment.dto";
import { StatusMediaEnum } from "./enum/status-media.enum";
import { v4 as uuidv4 } from "uuid";

// ── Constantes de validação ──────────────────────────────────────────────────

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_SAT_EVIDENCE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/mpeg',
    'video/3gpp',
];

const ALLOWED_AVT_LAUDO_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
];

@Injectable()
export class MediaAttachmentService {
    private blobServiceClient: BlobServiceClient;
    private containerName: string;
    private accountName: string;
    private accountKey: string;

    constructor(
        @InjectRepository(MediaAttachmentEntity)
        private mediaRepository: Repository<MediaAttachmentEntity>,
        private configService: ConfigService,
    ) {
        this.accountName = this.configService.getOrThrow<string>("AZURE_STORAGE_ACCOUNT_NAME");
        this.accountKey = this.configService.getOrThrow<string>("AZURE_STORAGE_ACCOUNT_KEY");
        this.containerName = this.configService.getOrThrow<string>("AZURE_STORAGE_CONTAINER_NAME");

        const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
        this.blobServiceClient = new BlobServiceClient(
            `https://${this.accountName}.blob.core.windows.net`,
            sharedKeyCredential,
        );
    }

    // ── Upload SAS (write) ───────────────────────────────────────────────────

    async generateSasUrl(dto: CreateMediaAttachmentDto): Promise<{ sasUrl: string; mediaId: string }> {
        // Validação de tamanho
        if (dto.sizeBytes > MAX_FILE_SIZE) {
            throw new BadRequestException(`O arquivo excede o tamanho máximo de 50 MB.`);
        }

        // Validação de tipo MIME por contexto
        const allowedMimes = dto.context === 'sat_evidencia'
            ? ALLOWED_SAT_EVIDENCE_MIMES
            : ALLOWED_AVT_LAUDO_MIMES;

        if (!allowedMimes.includes(dto.mimeType.toLowerCase())) {
            const tiposPermitidos = dto.context === 'sat_evidencia'
                ? 'imagens (JPEG, PNG, GIF, WebP, BMP, SVG) e vídeos (MP4, WebM, MOV, AVI, WMV, MPEG, 3GP)'
                : 'PDF, Word (.doc, .docx), texto (.txt) e imagens (JPEG, PNG, GIF, WebP, BMP)';
            throw new BadRequestException(`Tipo de arquivo não permitido. Formatos aceitos: ${tiposPermitidos}.`);
        }

        const mediaId = uuidv4();
        const extension = dto.originalName?.split(".").pop() || "bin";

        // Caminho diferente baseado no contexto
        const folder = dto.context === 'avt_laudo' ? 'avt' : 'sat';
        const blobName = `${folder}/${dto.satId}/${mediaId}.${extension}`;

        const media = this.mediaRepository.create({
            id: mediaId,
            sat_id: dto.satId,
            blobName,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
            originalName: dto.originalName,
            status: StatusMediaEnum.PENDING,
            context: dto.context,
        });
        await this.mediaRepository.save(media);

        const sasToken = this.generateWriteSasToken(blobName, dto.mimeType);
        const sasUrl = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;

        return { sasUrl, mediaId };
    }

    // ── Confirmar upload ─────────────────────────────────────────────────────

    async confirmUpload(id: string): Promise<MediaAttachmentEntity> {
        const media = await this.mediaRepository.findOneBy({ id });

        if (!media) {
            throw new BadRequestException("Media attachment não encontrado");
        }

        if (media.status !== StatusMediaEnum.PENDING) {
            throw new BadRequestException("Upload já foi confirmado ou falhou");
        }

        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobClient = containerClient.getBlobClient(media.blobName);
        const exists = await blobClient.exists();

        if (!exists) {
            media.status = StatusMediaEnum.FAILED;
            await this.mediaRepository.save(media);
            throw new BadRequestException("Blob não encontrado no Azure Storage. Upload falhou.");
        }

        media.status = StatusMediaEnum.READY;
        return await this.mediaRepository.save(media);
    }

    // ── Read SAS (visualizar/download) ───────────────────────────────────────

    async generateReadSasUrl(id: string): Promise<{ viewUrl: string }> {
        const media = await this.mediaRepository.findOneBy({ id });

        if (!media) {
            throw new BadRequestException("Media attachment não encontrado");
        }

        if (media.status !== StatusMediaEnum.READY) {
            throw new BadRequestException("O arquivo ainda não foi confirmado ou o upload falhou.");
        }

        const sasToken = this.generateReadSasToken(media.blobName);
        const viewUrl = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${media.blobName}?${sasToken}`;

        return { viewUrl };
    }

    // ── Consultas ────────────────────────────────────────────────────────────

    async findOne(id: string): Promise<MediaAttachmentEntity | null> {
        return await this.mediaRepository.findOneBy({ id });
    }

    async findBySat(satId: string, context?: 'sat_evidencia' | 'avt_laudo'): Promise<MediaAttachmentEntity[]> {
        const where: any = { sat_id: satId };
        if (context) {
            where.context = context;
        }
        return await this.mediaRepository.findBy(where);
    }

    // ── Exclusão ─────────────────────────────────────────────────────────────

    async delete(id: string): Promise<void> {
        const media = await this.mediaRepository.findOneBy({ id });

        if (media) {
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const blobClient = containerClient.getBlobClient(media.blobName);
            await blobClient.deleteIfExists();
            await this.mediaRepository.delete(id);
        }
    }

    // ── Geração de SAS tokens ────────────────────────────────────────────────

    private generateWriteSasToken(blobName: string, contentType: string): string {
        const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

        const startsOn = new Date();
        startsOn.setMinutes(startsOn.getMinutes() - 5);

        const expiresOn = new Date();
        expiresOn.setMinutes(expiresOn.getMinutes() + 30);

        const sasParams = generateBlobSASQueryParameters(
            {
                containerName: this.containerName,
                blobName,
                permissions: BlobSASPermissions.parse("cw"),
                startsOn,
                expiresOn,
                protocol: SASProtocol.Https,
                contentType,
            },
            sharedKeyCredential,
        );

        return sasParams.toString();
    }

    private generateReadSasToken(blobName: string): string {
        const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

        const startsOn = new Date();
        startsOn.setMinutes(startsOn.getMinutes() - 5);

        const expiresOn = new Date();
        expiresOn.setHours(expiresOn.getHours() + 1); // Read token válido por 1 hora

        const sasParams = generateBlobSASQueryParameters(
            {
                containerName: this.containerName,
                blobName,
                permissions: BlobSASPermissions.parse("r"),
                startsOn,
                expiresOn,
                protocol: SASProtocol.Https,
            },
            sharedKeyCredential,
        );

        return sasParams.toString();
    }
}