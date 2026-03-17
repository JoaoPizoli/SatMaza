import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { UsuarioService } from "src/usuario/usuario.service";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";
import { RepreAtendenteEntity } from "src/usuario/entity/repre_atendente.entity";
import { LoginDto } from "./dto/login.dto";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { TokenBlacklistService } from "./token-blacklist.service";
import { RefreshTokenEntity } from "./entity/refresh-token.entity";

export interface JwtPayload {
    sub: number;
    email: string | null;
    tipo: string;
    usuario: string;
    entity_type?: 'usuario' | 'repre_atendente';
}

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
        private tokenBlacklistService: TokenBlacklistService,
        @InjectRepository(RefreshTokenEntity)
        private refreshTokenRepository: Repository<RefreshTokenEntity>,
        @InjectRepository(RepreAtendenteEntity)
        private repreAtendenteRepository: Repository<RepreAtendenteEntity>,
    ) { }

    async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string; pending_setup: boolean }> {
        let usuario: UsuarioEntity | null = null;

        if (dto.email) {
            usuario = await this.usuarioService.findByEmail(dto.email);

            if (usuario && [TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.BAGUA, TipoUsuarioEnum.BSOLVENTE, TipoUsuarioEnum.ORQUESTRADOR].includes(usuario.tipo)) {
                // Login como UsuarioEntity (fluxo existente)
                const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
                if (!senhaValida) {
                    throw new UnauthorizedException("Credenciais inválidas");
                }

                const { access_token, refresh_token } = await this.generateTokenPair(usuario);
                const pending_setup = usuario.tipo === TipoUsuarioEnum.REPRESENTANTE &&
                    (!usuario.nome || !usuario.email || !usuario.password_changed);

                return { access_token, refresh_token, pending_setup };
            }

            // Não encontrou UsuarioEntity válido — tentar RepreAtendente
            const repre = await this.repreAtendenteRepository
                .createQueryBuilder('ra')
                .addSelect('ra.senha')
                .where('ra.email_representante_comercial = :email', { email: dto.email })
                .getOne();

            if (!repre || !repre.senha) {
                throw new UnauthorizedException("Credenciais inválidas");
            }

            const senhaValida = await bcrypt.compare(dto.senha, repre.senha);
            if (!senhaValida) {
                throw new UnauthorizedException("Credenciais inválidas");
            }

            const { access_token, refresh_token } = await this.generateTokenPairForRepreAtendente(repre);
            return { access_token, refresh_token, pending_setup: false };
        } else if (dto.usuario) {
            usuario = await this.usuarioService.findByUsuario(dto.usuario);

            if (!usuario) {
                throw new UnauthorizedException("Credenciais inválidas");
            }

            const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
            if (!senhaValida) {
                throw new UnauthorizedException("Credenciais inválidas");
            }

            const { access_token, refresh_token } = await this.generateTokenPair(usuario);
            const pending_setup = usuario.tipo === TipoUsuarioEnum.REPRESENTANTE &&
                (!usuario.nome || !usuario.email || !usuario.password_changed);

            return { access_token, refresh_token, pending_setup };
        } else {
            throw new UnauthorizedException("Informe email ou usuario");
        }
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

        if (stored.entity_type === 'repre_atendente') {
            const repre = await this.repreAtendenteRepository.findOneBy({ id: stored.usuario_id });
            if (!repre) {
                throw new UnauthorizedException("Usuário não encontrado");
            }
            return this.generateTokenPairForRepreAtendente(repre);
        }

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
            entity_type: 'usuario',
        };

        const access_token = this.jwtService.sign(payload);

        // Gerar refresh token aleatório (UUID v4)
        const rawRefreshToken = crypto.randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 15); // válido por 15 dias

        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: rawRefreshToken,
            usuario_id: usuario.id,
            entity_type: 'usuario',
            expiresAt,
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        return { access_token, refresh_token: rawRefreshToken };
    }

    private async generateTokenPairForRepreAtendente(repre: RepreAtendenteEntity): Promise<{ access_token: string; refresh_token: string }> {
        const payload: JwtPayload = {
            sub: repre.id,
            email: repre.email_representante_comercial,
            tipo: TipoUsuarioEnum.REPRE_ATENDENTE,
            usuario: repre.email_representante_comercial,
            entity_type: 'repre_atendente',
        };

        const access_token = this.jwtService.sign(payload);

        const rawRefreshToken = crypto.randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 15);

        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: rawRefreshToken,
            usuario_id: repre.id,
            entity_type: 'repre_atendente',
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
