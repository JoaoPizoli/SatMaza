import { Injectable, Logger, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { CreateAvtDto } from "./dto/create-avt.dto";
import { UpdateAvtDto } from "./dto/update-avt.dto";
import { AvtEntity } from "./entity/avt.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StatusAvtEnum } from "./enum/status-avt.enum";
import { SatNotificationService } from "../mail/sat-notification.service";


@Injectable()
export class AvtService {
    private readonly logger = new Logger(AvtService.name);

    constructor(
        @InjectRepository(AvtEntity)
        private avtRepository: Repository<AvtEntity>,
        @Inject(forwardRef(() => SatNotificationService))
        private readonly satNotificationService: SatNotificationService,
    ) { }


    async create(sat_id: string, dadosAvt: CreateAvtDto, usuario_id: number): Promise<AvtEntity> {
        // Verificar se já existe AVT para esta SAT (tentativas anteriores)
        const existing = await this.avtRepository.findOneBy({ sat_id });
        if (existing) {
            await this.avtRepository.update(existing.id, {
                ...dadosAvt,
                usuario_id: usuario_id,
            });
            return await this.findOne(existing.id);
        }

        const entity = this.avtRepository.create({
            ...dadosAvt,
            sat_id: sat_id,
            usuario_id: usuario_id,
        })
        const saved = await this.avtRepository.save(entity)
        return await this.findOne(saved.id)
    }


    async update(id: string, dadosAvt: UpdateAvtDto): Promise<AvtEntity> {
        this.logger.debug(`Atualizando AVT ID: ${id} — dados: ${JSON.stringify(dadosAvt)}`);
        const avt = await this.findOne(id)
        await this.avtRepository.update(id, dadosAvt)
        return await this.findOne(id)
    }

    // Busca por ID da AVT
    async findOne(id: string): Promise<AvtEntity> {
        const avt = await this.avtRepository.findOne({ where: { id: id }, relations: ['laudo'] })
        if (!avt) {
            throw new NotFoundException(`AVT com id: '${id}' não encontrada`)
        }
        return avt
    }

    // Busca por SAT ID
    async findBySatId(sat_id: string): Promise<AvtEntity> {
        const avt = await this.avtRepository.findOne({ where: { sat_id: sat_id }, relations: ['laudo'] })
        if (!avt) {
            throw new NotFoundException(`AVT por sat_id: '${sat_id}' não encontrada`)
        }
        return avt
    }


    async changeStatus(id: string, status: StatusAvtEnum): Promise<AvtEntity> {
        const avt = await this.findOne(id)
        await this.avtRepository.update(id, { status: status })

        // Quando a AVT é concluída, dispara notificação por email (fire-and-forget)
        if (status === StatusAvtEnum.CONCLUIDO) {
            this.logger.log(`AVT ${id} concluída — disparando notificação para SAT ${avt.sat_id}`);
            this.satNotificationService
                .notifyFinalization(avt.sat_id)
                .catch((err) =>
                    this.logger.error(`Falha na notificação da SAT ${avt.sat_id}: ${err.message}`, err.stack),
                );
        }

        return await this.findOne(id)
    }
}