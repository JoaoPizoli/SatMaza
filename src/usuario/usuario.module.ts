import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuarioEntity } from "./entity/usuario.entity";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { RepreAtendenteEntity } from "./entity/repre_atendente.entity";
import { ErpModule } from "src/shared/erp/erp.module";

@Module({
    imports: [TypeOrmModule.forFeature([UsuarioEntity, RepreAtendenteEntity]), ErpModule],
    controllers: [UsuarioController],
    providers: [UsuarioService],
    exports: [UsuarioService],
})
export class UsuarioModule { }