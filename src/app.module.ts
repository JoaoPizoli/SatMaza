import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './config/ormconfig'
import { ConfigModule } from '@nestjs/config';
import erpOrmConfig from './config/ormconfig-erp';
import { SatModule } from './sat/sat.module';
import { UsuarioModule } from './usuario/usuario.module';
import { MediaAttachmentModule } from './mediaAttachment/mediaAttachment.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    TypeOrmModule.forRoot(erpOrmConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    SatModule,
    UsuarioModule,
    MediaAttachmentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
