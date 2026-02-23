import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { TokenBlacklistService } from "./token-blacklist.service";
import { BlacklistedTokenEntity } from "./entity/blacklisted-token.entity";
import { RefreshTokenEntity } from "./entity/refresh-token.entity";
import { UsuarioModule } from "src/usuario/usuario.module";

@Module({
    imports: [
        UsuarioModule,
        PassportModule,
        TypeOrmModule.forFeature([BlacklistedTokenEntity, RefreshTokenEntity]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>("JWT_SECRET"),
                signOptions: { expiresIn: "15m" },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, TokenBlacklistService],
    exports: [AuthService, JwtModule, TokenBlacklistService],
})
export class AuthModule {}
