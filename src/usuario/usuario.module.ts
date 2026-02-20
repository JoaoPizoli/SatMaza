import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuarioEntity } from "./entity/usuario.entity";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { RepreAtendenteEntity } from "./entity/repre_atendente.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UsuarioEntity, RepreAtendenteEntity])],
    controllers: [UsuarioController],
    providers: [UsuarioService],
    exports: [UsuarioService],
})
export class UsuarioModule { }