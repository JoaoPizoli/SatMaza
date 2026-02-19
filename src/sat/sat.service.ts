import { BadRequestException, Injectable, Inject, forwardRef, Logger } from "@nestjs/common";
import { SatEntity } from "./entity/sat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSatDto } from "./dto/create-sat.dto";
import { AvtService } from "src/avt/avt.service";
import { CreateAvtDto } from "src/avt/dto/create-avt.dto";
import { AvtEntity } from "src/avt/entity/avt.entity";
import { UpdateAvtDto } from "src/avt/dto/update-avt.dto";
import { StatusAvtEnum } from "src/avt/enum/status-avt.enum";
import { StatusSatEnum } from "./enum/status-sat.enum";
import { LaboratorioSatEnum } from "./enum/laboratorio-sat.enum";
import { UsuarioService } from "src/usuario/usuario.service";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { UpdateSatDto } from "./dto/update-sat.dto";
import { SatNotificationService } from "src/mail/sat-notification.service";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

const SAT_DESTINO_LABELS = {
    [LaboratorioSatEnum.BASE_AGUA]: 'Base Água',
    [LaboratorioSatEnum.BASE_SOLVENTE]: 'Base Solvente',
};

@Injectable()
export class SatService {
    private readonly logger = new Logger(SatService.name);

    constructor(
        @InjectRepository(SatEntity)
        private satRepository: Repository<SatEntity>,
        private usuarioService: UsuarioService,
        private avtService: AvtService,
        @Inject(forwardRef(() => SatNotificationService))
        private readonly satNotificationService: SatNotificationService,
    ) { }

    async createSat(dadosSat: CreateSatDto): Promise<SatEntity | null> {
        const usuario = await this.usuarioService.findOne(dadosSat.representante_id);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        // Os lotes vêm no DTO como array de objetos {lote, validade}.
        // O TypeORM com cascade: true na relação deve lidar com a criação dos SatLoteEntity
        const sat = this.satRepository.create(dadosSat);

        // Gerar código temporário para satisfazer constraint NOT NULL
        sat.codigo = 'TEMP';
        const saved = await this.satRepository.save(sat);

        // Gerar código definitivo a partir do seq auto-incrementado
        saved.codigo = `SAT-${String(saved.seq).padStart(6, '0')}`;
        return await this.satRepository.save(saved);
    }

    async createAvt(id: string, dadosAvt: CreateAvtDto, usuario_id: number): Promise<AvtEntity> {
        return await this.avtService.create(id, dadosAvt, usuario_id)
    }

    async updateAvt(id: string, dadosAvt: UpdateAvtDto): Promise<AvtEntity> {
        return await this.avtService.update(id, dadosAvt)
    }

    async changeStatusAvt(id: string, statusAvt: StatusAvtEnum): Promise<AvtEntity> {
        return await this.avtService.changeStatus(id, statusAvt)
    }

    async update(id: string, dadosSat: UpdateSatDto): Promise<SatEntity | null> {
        await this.satRepository.update(id, dadosSat);
        return await this.findOne(id)
    }

    async delete(id: string): Promise<void> {
        await this.satRepository.delete(id)
    }

    private readonly defaultRelations = ['representante', 'evidencias', 'avt', 'avt.laudo', 'lotes'] as const;

    async findOne(id: string): Promise<SatEntity | null> {
        return await this.satRepository.findOne({ where: { id }, relations: [...this.defaultRelations] })
    }

    async findAll(pagination?: PaginationDto): Promise<PaginatedResult<SatEntity>> {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;

        const [data, total] = await this.satRepository.findAndCount({
            relations: [...this.defaultRelations],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findSatsByLab(laboratorio: LaboratorioSatEnum, pagination?: PaginationDto): Promise<PaginatedResult<SatEntity>> {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;

        const [data, total] = await this.satRepository.findAndCount({
            where: { destino: laboratorio },
            relations: [...this.defaultRelations],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findSatsByRepresentante(representanteId: number, pagination?: PaginationDto): Promise<PaginatedResult<SatEntity>> {
        const usuario = await this.usuarioService.findOne(representanteId);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;

        const [data, total] = await this.satRepository.findAndCount({
            where: { representante_id: representanteId },
            relations: [...this.defaultRelations],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findSatsByStatus(statusSat: StatusSatEnum, pagination?: PaginationDto): Promise<PaginatedResult<SatEntity>> {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;

        const [data, total] = await this.satRepository.findAndCount({
            where: { status: statusSat },
            relations: [...this.defaultRelations],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async changeStatus(id: string, status: StatusSatEnum): Promise<SatEntity | null> {
        const sat = await this.findOne(id);
        if (!sat) {
            throw new BadRequestException('SAT não encontrada');
        }
        sat.status = status;
        await this.satRepository.save(sat);
        return await this.findOne(id);
    }

    async redirecionar(id: string): Promise<SatEntity> {
        const sat = await this.findOne(id);
        if (!sat) {
            throw new BadRequestException('SAT não encontrada');
        }

        if (!sat.destino) {
            throw new BadRequestException('SAT não possui destino definido para redirecionar');
        }

        // Inverte o destino
        const novoDestino = sat.destino === LaboratorioSatEnum.BASE_AGUA
            ? LaboratorioSatEnum.BASE_SOLVENTE
            : LaboratorioSatEnum.BASE_AGUA;

        // Atualiza status
        const novoStatus = novoDestino === LaboratorioSatEnum.BASE_AGUA
            ? StatusSatEnum.ENVIADO_BAGUA
            : StatusSatEnum.ENVIADO_BSOLVENTE;

        sat.destino = novoDestino;
        sat.status = novoStatus;

        await this.satRepository.save(sat);

        // Enviar email notificando redirecionamento (fire-and-forget com log de falha)
        this.satNotificationService.notifyRedirection(sat).catch((err) =>
            this.logger.error(
                `Falha na notificação de redirecionamento para SAT ${sat.codigo}: ${err.message}`,
                err.stack,
            ),
        );

        return sat;
    }

    async getSatsBySector(filter: DashboardFilterDto) {
        const qb = this.satRepository.createQueryBuilder('sat');
        this.applyFilters(qb, filter);

        qb.select('sat.destino', 'name')
            .andWhere('sat.destino IS NOT NULL')
            .addSelect('COUNT(sat.id)', 'value')
            .groupBy('sat.destino');

        const result = await qb.getRawMany();

        return result.map(item => ({
            name: SAT_DESTINO_LABELS[item.name] || 'Não Definido',
            value: Number(item.value)
        }));
    }

    async getSatsByRepresentative(filter: DashboardFilterDto) {
        const qb = this.satRepository.createQueryBuilder('sat');
        qb.leftJoin('sat.representante', 'representante');
        this.applyFilters(qb, filter);

        qb.select('representante.usuario', 'usuario')
            .addSelect('representante.nome', 'nome')
            .addSelect('COUNT(sat.id)', 'value')
            .groupBy('representante.usuario')
            .addGroupBy('representante.nome')
            .orderBy('value', 'DESC');

        const result = await qb.getRawMany();
        return result.map(item => ({
            name: item.nome ? `${item.usuario} - ${item.nome}` : item.usuario || 'Desconhecido',
            value: Number(item.value)
        }));
    }

    async getTopProducts(filter: DashboardFilterDto) {
        const qb = this.satRepository.createQueryBuilder('sat');
        this.applyFilters(qb, filter);

        qb.select('sat.produtos', 'name')
            .addSelect('COUNT(sat.id)', 'value')
            .groupBy('sat.produtos')
            .orderBy('value', 'DESC')
            .limit(10); // Top 10

        const result = await qb.getRawMany();
        return result.map(item => ({
            name: item.name,
            value: Number(item.value)
        }));
    }

    async getSatsByStatus(filter: DashboardFilterDto) {
        const qb = this.satRepository.createQueryBuilder('sat');
        this.applyFilters(qb, filter);

        qb.select('sat.status', 'name')
            .addSelect('COUNT(sat.id)', 'value')
            .groupBy('sat.status');

        const result = await qb.getRawMany();
        return result.map(item => ({
            name: item.name,
            value: Number(item.value)
        }));
    }

    private applyFilters(qb: any, filter: DashboardFilterDto) {
        if (filter.startDate) {
            qb.andWhere('sat.createdAt >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
            // Ajuste para incluir o final do dia
            qb.andWhere('sat.createdAt <= :endDate', { endDate: `${filter.endDate} 23:59:59` });
        }
        if (filter.representanteId) {
            qb.andWhere('sat.representante_id = :representanteId', { representanteId: filter.representanteId });
        }
        if (filter.representanteCodigo) {
            // Precisamos garantir que o join foi feito se não tiver sido feito ainda
            // Para simplificar, assumimos que 'representante' é o alias para a relação sat.representante
            // Como applyFilters é usado em contextos onde o join pode ou não existir, idealmente verifica-se.
            // Mas como getSatsBySector não faz join, vamos fazer subquery ou left join condicional?
            // Melhor: adicionar o join se não existir no main query builder, mas applyFilters recebe qb.

            // Check if alias 'representante' is already used, if not, join.
            const alias = qb.expressionMap.aliases.find((a: any) => a.name === 'representante');
            if (!alias) {
                qb.leftJoin('sat.representante', 'representante');
            }

            qb.andWhere('representante.usuario = :codRep', { codRep: filter.representanteCodigo });
        }
        if (filter.produto) {
            qb.andWhere('sat.produtos ILIKE :produto', { produto: `%${filter.produto}%` });
        }
    }
}