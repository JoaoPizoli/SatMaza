import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { UsuarioService } from "src/usuario/usuario.service";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";
import { LoginDto } from "./dto/login.dto";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { TokenBlacklistService } from "./token-blacklist.service";
import { RefreshTokenEntity } from "./entity/refresh-token.entity";

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
        @InjectRepository(RefreshTokenEntity)
        private refreshTokenRepository: Repository<RefreshTokenEntity>,
    ) { }

    async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string; pending_setup: boolean }> {
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
            throw new UnauthorizedException("Credenciais inválidas");
        }

        const { access_token, refresh_token } = await this.generateTokenPair(usuario);

        const pending_setup = usuario.tipo === TipoUsuarioEnum.REPRESENTANTE &&
            (!usuario.nome || !usuario.email || !usuario.password_changed);

        return {
            access_token,
            refresh_token,
            pending_setup,
        };
    }

    async refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        const stored = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, revoked: false },
        });

        if (!stored || stored.expiresAt < new Date()) {
            throw new UnauthorizedException("Refresh token inválido ou expirado");
        }

        // Revogar token antigo (rotação — impede reutilização)
        stored.revoked = true;
        await this.refreshTokenRepository.save(stored);

        const usuario = await this.usuarioService.findOne(stored.usuario_id);
        if (!usuario) {
            throw new UnauthorizedException("Usuário não encontrado");
        }

        return this.generateTokenPair(usuario);
    }

    private async generateTokenPair(usuario: UsuarioEntity): Promise<{ access_token: string; refresh_token: string }> {
        const payload: JwtPayload = {
            sub: usuario.id,
            email: usuario.email ?? null,
            tipo: usuario.tipo,
            usuario: usuario.usuario,
        };

        const access_token = this.jwtService.sign(payload);

        // Gerar refresh token aleatório (UUID v4)
        const rawRefreshToken = crypto.randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 15); // válido por 15 dias

        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: rawRefreshToken,
            usuario_id: usuario.id,
            expiresAt,
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        return { access_token, refresh_token: rawRefreshToken };
    }

    async logout(accessToken: string, refreshToken?: string): Promise<{ message: string }> {
        await this.tokenBlacklistService.blacklist(accessToken);

        if (refreshToken) {
            await this.refreshTokenRepository.update(
                { token: refreshToken, revoked: false },
                { revoked: true },
            );
        }

        return { message: "Logout realizado com sucesso" };
    }
}
