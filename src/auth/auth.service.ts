import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsuarioService } from "src/usuario/usuario.service";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";
import { LoginDto } from "./dto/login.dto";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { TokenBlacklistService } from "./token-blacklist.service";

export interface JwtPayload {
    sub: number;
    email: string | null;
    tipo: string;
    usuario: string;
}

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
        private tokenBlacklistService: TokenBlacklistService,
    ) { }

    async login(dto: LoginDto): Promise<{ access_token: string; pending_setup: boolean }> {
        let usuario: UsuarioEntity | null = null;

        if (dto.email) {
            usuario = await this.usuarioService.findByEmail(dto.email);

            if (!usuario || ![TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE, TipoUsuarioEnum.ORQUESTRADOR].includes(usuario.tipo)) {
                throw new UnauthorizedException("Credenciais inválidas");
            }
        } else if (dto.usuario) {
            usuario = await this.usuarioService.findByUsuario(dto.usuario);

            if (!usuario) {
                throw new UnauthorizedException("Credenciais inválidas");
            }
        } else {
            throw new UnauthorizedException("Informe email ou usuario");
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);

        if (!senhaValida) {
            throw new UnauthorizedException("Credenciais invÃ¡lidas");
        }

        const payload: JwtPayload = {
            sub: usuario.id,
            email: usuario.email ?? null,
            tipo: usuario.tipo,
            usuario: usuario.usuario
        };

        const pending_setup = usuario.tipo === TipoUsuarioEnum.REPRESENTANTE &&
            (!usuario.nome || !usuario.email || !usuario.password_changed);

        return {
            access_token: this.jwtService.sign(payload),
            pending_setup,
        };
    }

    async logout(token: string): Promise<{ message: string }> {
        await this.tokenBlacklistService.blacklist(token);
        return { message: "Logout realizado com sucesso" };
    }
}
