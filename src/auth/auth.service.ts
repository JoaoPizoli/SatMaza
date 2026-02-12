import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsuarioService } from "src/usuario/usuario.service";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";
import { LoginDto } from "./dto/login.dto";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";

export interface JwtPayload {
    sub: number;
    email: string | null;
    tipo: string;
}

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
    ) {}

    async login(dto: LoginDto): Promise<{ access_token: string }> {
        let usuario: UsuarioEntity | null = null;

        if (dto.email) {
            usuario = await this.usuarioService.findByEmail(dto.email);

            if (!usuario || usuario.tipo !== TipoUsuarioEnum.ADMIN) {
                throw new UnauthorizedException("Credenciais inválidas");
            }
        } else if (dto.usuario) {
            usuario = await this.usuarioService.findByUsuario(dto.usuario);

            if (!usuario || usuario.tipo === TipoUsuarioEnum.ADMIN) {
                throw new UnauthorizedException("Credenciais inválidas");
            }
        } else {
            throw new UnauthorizedException("Informe email ou usuario");
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);

        if (!senhaValida) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        const payload: JwtPayload = {
            sub: usuario.id,
            email: usuario.email ?? null,
            tipo: usuario.tipo,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
