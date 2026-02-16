import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { UserFromToken } from "./decorators/current-user.decorator";
import { UsuarioService } from "src/usuario/usuario.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginResponseDto } from "./dto/login-response.dto";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usuarioService: UsuarioService,
    ) {}

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login', description: 'Autentica o usuário e retorna o token JWT' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: LoginResponseDto })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }

    @Get('me')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dados do usuário autenticado', description: 'Retorna os dados do usuário logado a partir do token JWT' })
    @ApiResponse({ status: 200, description: 'Dados do usuário', type: UsuarioEntity })
    @ApiResponse({ status: 401, description: 'Token inválido ou não fornecido' })
    async me(@CurrentUser() user: UserFromToken) {
        return await this.usuarioService.findOne(user.id);
    }

    @Post('logout')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Logout', description: 'Invalida o token JWT atual' })
    @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Token inválido ou não fornecido' })
    logout(@Req() req: Request) {
        const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
        return this.authService.logout(token);
    }
}
