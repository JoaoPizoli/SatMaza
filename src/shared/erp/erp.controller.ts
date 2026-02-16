import { Controller, Get, Query } from "@nestjs/common";
import { ErpService } from "./erp.service";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import type { UserFromToken } from "src/auth/decorators/current-user.decorator";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";


@ApiTags('ERP')
@ApiBearerAuth('access-token')
@Controller('erp')
export class ErpController {
    constructor(
        private readonly erpService: ErpService
    ) { }

    @Get('clientes')
    @ApiOperation({ summary: 'Listar clientes do ERP', description: 'Retorna a lista de clientes do ERP vinculados ao representante autenticado' })
    @ApiQuery({ name: 'busca', required: false, description: 'Termo de busca para filtrar clientes', example: 'Empresa' })
    @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
    @ApiResponse({ status: 401, description: 'NÃ£o autenticado' })
    async listarClientes(@CurrentUser() user: UserFromToken, @Query('busca') busca?: string) {
        const repreId = user.usuario
        return await this.erpService.listarClientes(repreId, busca);
    }


    @Get('produtos')
    @ApiOperation({ summary: 'Listar Produtos', description: 'Retorna a lista de produtos ativos do ERP' })
    @ApiQuery({ name: 'busca', required: false, description: 'Termo de busca para filtrar produtos', example: 'TINNER' })
    @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async buscarProdutos(@Query('busca') busca?: string) {
        return await this.erpService.buscarProdutos(busca);
    }

    @Get('representante')
    @ApiOperation({ summary: 'Buscar dados do representante', description: 'Retorna o código e nome do representante autenticado a partir do ERP' })
    @ApiResponse({ status: 200, description: 'Dados do representante retornados com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async buscarRepresentante(@CurrentUser() user: UserFromToken) {
        const repreId = user.usuario;
        return await this.erpService.buscarRepresentante(repreId);
    }


}
