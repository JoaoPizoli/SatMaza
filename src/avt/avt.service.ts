import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAvtDto } from "./dto/create-avt.dto";
import { UpdateAvtDto } from "./dto/update-avt.dto";
import { AvtEntity } from "./entity/avt.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StatusAvtEnum } from "./enum/status-avt.enum";


@Injectable()
export class AvtService {
    constructor(
        @InjectRepository(AvtEntity)
        private avtRepository: Repository<AvtEntity>
    ) {}

    
    async create(sat_id: string, dadosAvt: CreateAvtDto): Promise<AvtEntity>{
        const entity = this.avtRepository.create({
            ...dadosAvt,
            sat_id: sat_id,
        })
        return await this.avtRepository.save(entity)
    }


    async update(sat_id: string, dadosAvt: UpdateAvtDto): Promise<AvtEntity>{
        const avt = await this.findOne(sat_id)
        await this.avtRepository.update(avt.sat_id, dadosAvt)
        return await this.findOne(sat_id)
    }


    async findOne(sat_id: string): Promise<AvtEntity>{
        const avt = await this.avtRepository.findOneBy({ sat_id: sat_id })
        if(!avt){
            throw new NotFoundException(`AVT por sat_id: '${sat_id}' não encontrado`) 
        }
        return avt
    }


    async changeStatus(sat_id: string, status: StatusAvtEnum): Promise<AvtEntity>{
        const avt = await this.findOne(sat_id)
        await this.avtRepository.update(avt.sat_id, { status: status })
        return await this.findOne(sat_id)
    }
}