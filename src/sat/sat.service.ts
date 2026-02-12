import { BadRequestException, Injectable } from "@nestjs/common";
import { SatEntity } from "./entity/sat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSatDto } from "./dto/create-sat.dto";
import { MediaAttachmentService } from "src/mediaAttachment/mediaAttachment.service";
import { AvtService } from "src/avt/avt.service";
import { CreateAvtDto } from "src/avt/dto/create-avt.dto";
import { AvtEntity } from "src/avt/entity/avt.entity";
import { UpdateAvtDto } from "src/avt/dto/update-avt.dto";
import { StatusAvtEnum } from "src/avt/enum/status-avt.enum";
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
        private mediaService: MediaAttachmentService,
    ){}

    async createSat(dadosSat: CreateSatDto): Promise<SatEntity | null>{
        const usuario = await this.usuarioService.findOne(dadosSat.representante_id);
        
        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }
        
        const sat = this.satRepository.create(dadosSat);
        return await this.satRepository.save(sat);
    }

    async createAvt(id: string, dadosAvt: CreateAvtDto): Promise<AvtEntity>{
        return await this.avtService.create(id, dadosAvt)
    }

    async updateAvt(id: string, dadosAvt: UpdateAvtDto): Promise<AvtEntity>{
        return await this.avtService.update(id, dadosAvt)
    }

    async changeStatusAvt(id: string, statusAvt: StatusAvtEnum): Promise<AvtEntity>{
        return await this.avtService.changeStatus(id, statusAvt)
    }

    async update(id: string, dadosSat: UpdateSatDto): Promise<SatEntity | null>{
        await this.satRepository.update(id, dadosSat);
        return await this.findOne(id)
    }

    async delete(id: string): Promise<void>{
        await this.satRepository.delete(id)
    }

    async findOne(id: string): Promise<SatEntity | null>{
        return await this.satRepository.findOneBy({ id: id })
    }

    async findAll(): Promise<SatEntity[] | null>{
        return await this.satRepository.find()
    }

    async findSatsByLab(laboratorio: LaboratorioSatEnum): Promise<SatEntity[]>{
        return await this.satRepository.findBy({ destino: laboratorio }) 
    }

    async findSatsByRepresentante(representanteId: number): Promise<SatEntity[]>{
        const usuario = await this.usuarioService.findOne(representanteId);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        return await this.satRepository.findBy({ representante_id: representanteId });
    }
}