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

    async generateSasUrl(dto: CreateMediaAttachmentDto): Promise<{ sasUrl: string; mediaId: string }> {
        const mediaId = uuidv4();
        const extension = dto.originalName?.split(".").pop() || "bin";
        const blobName = `sat/${dto.satId}/${mediaId}.${extension}`;

        const media = this.mediaRepository.create({
            id: mediaId,
            sat_id: dto.satId,
            blobName,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
            originalName: dto.originalName,
            status: StatusMediaEnum.PENDING,
        });
        await this.mediaRepository.save(media);

        const sasToken = this.generateSasToken(blobName, dto.mimeType);
        const sasUrl = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;

        return { sasUrl, mediaId };
    }

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

    async findOne(id: string): Promise<MediaAttachmentEntity | null> {
        return await this.mediaRepository.findOneBy({ id });
    }

    async findBySat(satId: string): Promise<MediaAttachmentEntity[]> {
        return await this.mediaRepository.findBy({ sat_id: satId });
    }

    async delete(id: string): Promise<void> {
        const media = await this.mediaRepository.findOneBy({ id });

        if (media) {
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const blobClient = containerClient.getBlobClient(media.blobName);
            await blobClient.deleteIfExists();
            await this.mediaRepository.delete(id);
        }
    }

    private generateSasToken(blobName: string, contentType: string): string {
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
}