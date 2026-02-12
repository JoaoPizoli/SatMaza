import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SatService } from "./sat.service";
import { CreateSatDto } from "./dto/create-sat.dto";
import { UpdateSatDto } from "./dto/update-sat.dto";
import { CreateAvtDto } from "src/avt/dto/create-avt.dto";
import { UpdateAvtDto } from "src/avt/dto/update-avt.dto";
import { StatusAvtEnum } from "src/avt/enum/status-avt.enum";
import { LaboratorioSatEnum } from "./enum/laboratorio-sat.enum";


@Controller('sat')
export class SatController {
    constructor(
        private satService: SatService
    ){}

    @Post()
    async createSat(@Body() dadosSat: CreateSatDto) {
        return await this.satService.createSat(dadosSat);
    }

    @Patch(':id')
    async updateSat(@Param('id') id: string, @Body() dadosSat: UpdateSatDto) {
        return await this.satService.update(id, dadosSat);
    }

    @Delete(':id')
    async deleteSat(@Param('id') id: string) {
        return await this.satService.delete(id);
    }

    @Get(':id')
    async findOneSat(@Param('id') id: string) {
        return await this.satService.findOne(id);
    }

    @Get()
    async findAllSat() {
        return await this.satService.findAll();
    }

    @Get('laboratorio/:laboratorio')
    async findSatsByLab(@Param('laboratorio') laboratorio: LaboratorioSatEnum) {
        return await this.satService.findSatsByLab(laboratorio);
    }

    @Get('representante/:representanteId')
    async findSatsByRepresentante(@Param('representanteId') representanteId: number) {
        return await this.satService.findSatsByRepresentante(representanteId);
    }

    @Post(':id/avt')
    async createAvt(@Param('id') id: string, @Body() dadosAvt: CreateAvtDto) {
        return await this.satService.createAvt(id, dadosAvt);
    }

    @Patch('avt/:id')
    async updateAvt(@Param('id') id: string, @Body() dadosAvt: UpdateAvtDto) {
        return await this.satService.updateAvt(id, dadosAvt);
    }

    @Patch('avt/:id/status')
    async changeStatusAvt(@Param('id') id: string, @Body('status') status: StatusAvtEnum) {
        return await this.satService.changeStatusAvt(id, status);
    }

}