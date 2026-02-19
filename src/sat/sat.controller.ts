import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import type { UserFromToken } from "src/auth/decorators/current-user.decorator";
import { SatService } from "./sat.service";
import { CreateSatDto } from "./dto/create-sat.dto";
import { UpdateSatDto } from "./dto/update-sat.dto";
import { CreateAvtDto } from "src/avt/dto/create-avt.dto";
import { UpdateAvtDto } from "src/avt/dto/update-avt.dto";
import { StatusAvtEnum } from "src/avt/enum/status-avt.enum";
import { StatusSatEnum } from "./enum/status-sat.enum";
import { LaboratorioSatEnum } from "./enum/laboratorio-sat.enum";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SatEntity } from "./entity/sat.entity";
import { AvtEntity } from "src/avt/entity/avt.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('SAT')
@ApiBearerAuth('access-token')
@Controller('sat')
export class SatController {
    constructor(
        private satService: SatService
    ) { }

    @Post()
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR, TipoUsuarioEnum.REPRESENTANTE)
    @ApiOperation({ summary: 'Criar SAT', description: 'Cria uma nova Solicitação de Assistência Técnica' })
    @ApiBody({ type: CreateSatDto })
    @ApiResponse({ status: 201, description: 'SAT criada com sucesso', type: SatEntity })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async createSat(@Body() dadosSat: CreateSatDto) {
        return await this.satService.createSat(dadosSat);
    }

    @Patch(':id')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'Atualizar SAT', description: 'Atualiza os dados de uma SAT existente' })
    @ApiParam({ name: 'id', description: 'UUID da SAT', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @ApiBody({ type: UpdateSatDto })
    @ApiResponse({ status: 200, description: 'SAT atualizada com sucesso', type: SatEntity })
    @ApiResponse({ status: 404, description: 'SAT não encontrada' })
    async updateSat(@Param('id') id: string, @Body() dadosSat: UpdateSatDto) {
        return await this.satService.update(id, dadosSat);
    }

    @Delete(':id')
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Excluir SAT', description: 'Remove uma SAT do sistema' })
    @ApiParam({ name: 'id', description: 'UUID da SAT' })
    @ApiResponse({ status: 200, description: 'SAT removida com sucesso' })
    @ApiResponse({ status: 404, description: 'SAT não encontrada' })
    async deleteSat(@Param('id') id: string) {
        return await this.satService.delete(id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as SATs', description: 'Retorna SATs paginadas. Use ?page=1&limit=20 para navegar.' })
    @ApiResponse({ status: 200, description: 'Lista de SATs paginada' })
    async findAllSat(@Query() pagination: PaginationDto) {
        return await this.satService.findAll(pagination);
    }

    @Get('dashboard/sector')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'SATs por Setor', description: 'Retorna estatísticas de SATs por setor' })
    @ApiResponse({ status: 200, description: 'Estatísticas recuperadas' })
    async getSatsBySector(@Query() filter: DashboardFilterDto) {
        return await this.satService.getSatsBySector(filter);
    }

    @Get('dashboard/representative')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'SATs por Representante', description: 'Retorna estatísticas de SATs por representante' })
    @ApiResponse({ status: 200, description: 'Estatísticas recuperadas' })
    async getSatsByRepresentative(@Query() filter: DashboardFilterDto) {
        return await this.satService.getSatsByRepresentative(filter);
    }

    @Get('dashboard/products')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'Top Produtos', description: 'Retorna os produtos com mais SATs' })
    @ApiResponse({ status: 200, description: 'Estatísticas recuperadas' })
    async getTopProducts(@Query() filter: DashboardFilterDto) {
        return await this.satService.getTopProducts(filter);
    }

    @Get('dashboard/status')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'SATs por Status', description: 'Retorna estatísticas de SATs por status' })
    @ApiResponse({ status: 200, description: 'Estatísticas recuperadas' })
    async getSatsByStatus(@Query() filter: DashboardFilterDto) {
        return await this.satService.getSatsByStatus(filter);
    }

    @Get('laboratorio/:laboratorio')
    @ApiOperation({ summary: 'Buscar SATs por laboratório', description: 'Retorna as SATs destinadas a um laboratório específico, paginadas.' })
    @ApiParam({ name: 'laboratorio', description: 'Laboratório de destino', enum: LaboratorioSatEnum })
    @ApiResponse({ status: 200, description: 'Lista de SATs do laboratório paginada' })
    async findSatsByLab(@Param('laboratorio') laboratorio: LaboratorioSatEnum, @Query() pagination: PaginationDto) {
        return await this.satService.findSatsByLab(laboratorio, pagination);
    }

    @Get('representante/:representanteId')
    @ApiOperation({ summary: 'Buscar SATs por representante', description: 'Retorna as SATs associadas a um representante, paginadas.' })
    @ApiParam({ name: 'representanteId', description: 'ID do representante', example: 12345 })
    @ApiResponse({ status: 200, description: 'Lista de SATs do representante paginada' })
    async findSatsByRepresentante(@Param('representanteId') representanteId: number, @Query() pagination: PaginationDto) {
        return await this.satService.findSatsByRepresentante(representanteId, pagination);
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Buscar SATs por status', description: 'Retorna as SATs com um status específico, paginadas.' })
    @ApiParam({ name: 'status', description: 'Status da SAT', enum: StatusSatEnum })
    @ApiResponse({ status: 200, description: 'Lista de SATs com o status informado paginada' })
    async findSatsByStatus(@Param('status') status: StatusSatEnum, @Query() pagination: PaginationDto) {
        return await this.satService.findSatsByStatus(status, pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar SAT por ID', description: 'Retorna os dados de uma SAT específica' })
    @ApiParam({ name: 'id', description: 'UUID da SAT' })
    @ApiResponse({ status: 200, description: 'SAT encontrada', type: SatEntity })
    @ApiResponse({ status: 404, description: 'SAT não encontrada' })
    async findOneSat(@Param('id') id: string) {
        return await this.satService.findOne(id);
    }

    @Patch(':id/status')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE)
    @ApiOperation({ summary: 'Alterar status da SAT', description: 'Altera o status de uma SAT' })
    @ApiParam({ name: 'id', description: 'UUID da SAT' })
    @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(StatusSatEnum), description: 'Novo status da SAT' } }, required: ['status'] } })
    @ApiResponse({ status: 200, description: 'Status alterado com sucesso', type: SatEntity })
    @ApiResponse({ status: 404, description: 'SAT não encontrada' })
    async changeStatusSat(@Param('id') id: string, @Body('status') status: StatusSatEnum) {
        return await this.satService.changeStatus(id, status);
    }

    @Patch(':id/redirecionar')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE)
    @ApiOperation({ summary: 'Redirecionar SAT', description: 'Redireciona a SAT para o outro laboratório' })
    @ApiParam({ name: 'id', description: 'UUID da SAT' })
    @ApiResponse({ status: 200, description: 'SAT redirecionada com sucesso', type: SatEntity })
    @ApiResponse({ status: 400, description: 'Erro ao redirecionar' })
    async redirecionarSat(@Param('id') id: string) {
        const sat = await this.satService.redirecionar(id);
        return sat;
    }

    @Post(':id/avt')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE)
    @ApiOperation({ summary: 'Criar AVT para uma SAT', description: 'Cria uma Averiguação Técnica vinculada a uma SAT' })
    @ApiParam({ name: 'id', description: 'UUID da SAT' })
    @ApiBody({ type: CreateAvtDto })
    @ApiResponse({ status: 201, description: 'AVT criada com sucesso', type: AvtEntity })
    @ApiResponse({ status: 404, description: 'SAT não encontrada' })
    async createAvt(@Param('id') id: string, @Body() dadosAvt: CreateAvtDto, @CurrentUser() user: UserFromToken) {
        return await this.satService.createAvt(id, dadosAvt, user.id);
    }

    @Patch('avt/:id')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE)
    @ApiOperation({ summary: 'Atualizar AVT', description: 'Atualiza os dados de uma AVT existente' })
    @ApiParam({ name: 'id', description: 'UUID da AVT' })
    @ApiBody({ type: UpdateAvtDto })
    @ApiResponse({ status: 200, description: 'AVT atualizada com sucesso', type: AvtEntity })
    @ApiResponse({ status: 404, description: 'AVT não encontrada' })
    async updateAvt(@Param('id') id: string, @Body() dadosAvt: UpdateAvtDto) {
        return await this.satService.updateAvt(id, dadosAvt);
    }

    @Patch('avt/:id/status')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE)
    @ApiOperation({ summary: 'Alterar status da AVT', description: 'Altera o status de uma AVT' })
    @ApiParam({ name: 'id', description: 'UUID da AVT' })
    @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(StatusAvtEnum), description: 'Novo status da AVT' } }, required: ['status'] } })
    @ApiResponse({ status: 200, description: 'Status alterado com sucesso', type: AvtEntity })
    @ApiResponse({ status: 404, description: 'AVT não encontrada' })
    async changeStatusAvt(@Param('id') id: string, @Body('status') status: StatusAvtEnum) {
        return await this.satService.changeStatusAvt(id, status);
    }

}