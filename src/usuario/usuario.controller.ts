import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "./usuario.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { UsuarioEntity } from "./entity/usuario.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Public } from "src/auth/decorators/public.decorator";
import { TipoUsuarioEnum } from "./enum/tipo-usuario.enum";
import { CompleteRegistrationDto } from "./dto/complete-registration.dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import type { UserFromToken } from "src/auth/decorators/current-user.decorator";

@ApiTags('Usuário')
@ApiBearerAuth('access-token')
@Controller('usuario')
export class UsuarioController {
    constructor(
        private usuarioService: UsuarioService
    ) { }

    @Post()
    @Public() // TODO: Remover após criar usuário admin
    // @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Criar usuário', description: 'Cria um novo usuário no sistema' })
    @ApiBody({ type: CreateUsuarioDto })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: UsuarioEntity })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async create(@Body() dadosUsuario: CreateUsuarioDto) {
        return await this.usuarioService.create(dadosUsuario);
    }

    @Patch(':id')
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Atualizar usuário', description: 'Atualiza os dados de um usuário existente' })
    @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
    @ApiBody({ type: UpdateUsuarioDto })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso', type: UsuarioEntity })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async update(@Param('id') id: number, @Body() dadosUsuario: UpdateUsuarioDto) {
        return await this.usuarioService.update(id, dadosUsuario);
    }

    @Delete(':id')
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Excluir usuário', description: 'Remove um usuário do sistema' })
    @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
    @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async delete(@Param('id') id: number) {
        return await this.usuarioService.delete(id);
    }

    @Get()
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Listar usuários', description: 'Retorna todos os usuários cadastrados' })
    @ApiResponse({ status: 200, description: 'Lista de usuários', type: [UsuarioEntity] })
    async findAll() {
        return await this.usuarioService.findAll();
    }

    @Get('representantes')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'Listar representantes', description: 'Retorna todos os representantes cadastrados' })
    @ApiResponse({ status: 200, description: 'Lista de representantes', type: [UsuarioEntity] })
    async findRepresentantes() {
        return await this.usuarioService.findRepresentantes();
    }

    @Get(':id')
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Buscar usuário por ID', description: 'Retorna um usuário específico pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
    @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UsuarioEntity })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async findOne(@Param('id') id: number) {
        return await this.usuarioService.findOne(id);
    }

    @Get('email/:email')
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Buscar usuário por e-mail', description: 'Retorna um usuário específico pelo e-mail' })
    @ApiParam({ name: 'email', description: 'E-mail do usuário', example: 'usuario@satmaza.com' })
    @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UsuarioEntity })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async findByEmail(@Param('email') email: string) {
        return await this.usuarioService.findByEmail(email);
    }

    @Get('codigo/:usuario')
    @Roles(TipoUsuarioEnum.ADMIN)
    @ApiOperation({ summary: 'Buscar usuário por código', description: 'Retorna um usuário específico pelo código' })
    @ApiParam({ name: 'usuario', description: 'Código do usuário', example: "003" })
    @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UsuarioEntity })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async findByUsuario(@Param('usuario') usuario: string) {
        return await this.usuarioService.findByUsuario(usuario);
    }

    @Post('complete-registration')
    @ApiOperation({ summary: 'Completar cadastro', description: 'Permite que o usuário complete seu cadastro (nome, email, senha)' })
    @ApiBody({ type: CompleteRegistrationDto })
    @ApiResponse({ status: 200, description: 'Cadastro completado com sucesso', type: UsuarioEntity })
    async completeRegistration(@Body() dados: CompleteRegistrationDto, @CurrentUser() user: UserFromToken) {
        return await this.usuarioService.completeRegistration(user.id, dados);
    }
} 