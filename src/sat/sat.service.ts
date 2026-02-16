import { BadRequestException, Injectable } from "@nestjs/common";
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


@Injectable()
export class SatService {
    constructor(
        @InjectRepository(SatEntity)
        private satRepository: Repository<SatEntity>,
        private usuarioService: UsuarioService,
        private avtService: AvtService,
    ) { }

    async createSat(dadosSat: CreateSatDto): Promise<SatEntity | null> {
        const usuario = await this.usuarioService.findOne(dadosSat.representante_id);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        const sat = this.satRepository.create(dadosSat);
        // Gerar código temporário para satisfazer constraint NOT NULL
        sat.codigo = 'TEMP';
        const saved = await this.satRepository.save(sat);

        // Gerar código definitivo a partir do seq auto-incrementado
        saved.codigo = `SAT-${String(saved.seq).padStart(6, '0')}`;
        return await this.satRepository.save(saved);
    }

    async createAvt(id: string, dadosAvt: CreateAvtDto): Promise<AvtEntity> {
        return await this.avtService.create(id, dadosAvt)
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

    private readonly defaultRelations = ['representante', 'evidencias', 'avt', 'avt.laudo'] as const;

    async findOne(id: string): Promise<SatEntity | null> {
        return await this.satRepository.findOne({ where: { id }, relations: [...this.defaultRelations] })
    }

    async findAll(): Promise<SatEntity[] | null> {
        return await this.satRepository.find({ relations: [...this.defaultRelations] })
    }

    async findSatsByLab(laboratorio: LaboratorioSatEnum): Promise<SatEntity[]> {
        return await this.satRepository.find({ where: { destino: laboratorio }, relations: [...this.defaultRelations] })
    }

    async findSatsByRepresentante(representanteId: number): Promise<SatEntity[]> {
        const usuario = await this.usuarioService.findOne(representanteId);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        return await this.satRepository.find({ where: { representante_id: representanteId }, relations: [...this.defaultRelations] });
    }

    async findSatsByStatus(statusSat: StatusSatEnum): Promise<SatEntity[]> {
        return await this.satRepository.find({ where: { status: statusSat }, relations: [...this.defaultRelations] })
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
}