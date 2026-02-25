import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SatModule } from './sat/sat.module';
import { UsuarioModule } from './usuario/usuario.module';
import { MediaAttachmentModule } from './mediaAttachment/mediaAttachment.module';
import { AuthModule } from './auth/auth.module';
import { ErpModule } from './shared/erp/erp.module';
import { HealthModule } from './health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'erp_mysql',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('ERP_HOST'),
        port: configService.get<number>('ERP_PORT'),
        username: configService.get('ERP_USER'),
        password: configService.get('ERP_PASS'),
        database: configService.get('ERP_DB'),
        synchronize: false,

        // Retry automático do TypeORM para falhas transitórias
        retryAttempts: 5,
        retryDelay: 3000,

        // Timeout do driver mysql2
        connectTimeout: 30000,

        // Pool de conexões
        extra: {
          connectionLimit: 5,
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 30000,
        },
      }),
    }),
    SatModule,
    UsuarioModule,
    MediaAttachmentModule,
    AuthModule,
    ErpModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
