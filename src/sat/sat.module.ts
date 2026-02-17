import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SatEntity } from "./entity/sat.entity";
import { SatController } from "./sat.controller";
import { SatService } from "./sat.service";
import { AvtModule } from "src/avt/avt.module";
import { UsuarioModule } from "src/usuario/usuario.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([SatEntity]),
        AvtModule,
        UsuarioModule,
    ],
    controllers: [SatController],
    providers: [SatService],
    exports: [SatService],
})
export class SatModule { }