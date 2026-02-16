import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { BlacklistedTokenEntity } from "./entity/blacklisted-token.entity";

@Injectable()
export class TokenBlacklistService {
    private cleanupInterval: NodeJS.Timeout;

    constructor(
        @InjectRepository(BlacklistedTokenEntity)
        private blacklistRepository: Repository<BlacklistedTokenEntity>,
        private jwtService: JwtService,
    ) {
        // Limpa tokens expirados a cada 15 minutos
        this.cleanupInterval = setInterval(
            () => this.removeExpiredTokens(),
            15 * 60 * 1000,
        );
    }

    /**
     * Adiciona um token à blacklist.
     * O token ficará na blacklist até expirar naturalmente.
     */
    async blacklist(token: string): Promise<void> {
        try {
            const decoded = this.jwtService.decode(token) as { exp?: number };
            const expiresAt = decoded?.exp
                ? new Date(decoded.exp * 1000)
                : new Date();

            const entry = this.blacklistRepository.create({ token, expiresAt });
            await this.blacklistRepository.save(entry);
        } catch {
            // Token inválido — adiciona com expiração imediata
            const entry = this.blacklistRepository.create({ token, expiresAt: new Date() });
            await this.blacklistRepository.save(entry);
        }
    }

    /**
     * Verifica se um token está na blacklist.
     */
    async isBlacklisted(token: string): Promise<boolean> {
        const count = await this.blacklistRepository.countBy({ token });
        return count > 0;
    }

    /**
     * Remove tokens já expirados para liberar espaço no banco.
     */
    private async removeExpiredTokens(): Promise<void> {
        await this.blacklistRepository.delete({ expiresAt: LessThan(new Date()) });
    }

    onModuleDestroy() {
        clearInterval(this.cleanupInterval);
    }
}
