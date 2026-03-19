import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SatEntity } from "./entity/sat.entity";
import { RepreAtendenteEntity } from "src/usuario/entity/repre_atendente.entity";
import { SatController } from "./sat.controller";
import { SatService } from "./sat.service";
import { AvtModule } from "src/avt/avt.module";
import { UsuarioModule } from "src/usuario/usuario.module";
import { MailModule } from "src/mail/mail.module";
import { MediaAttachmentEntity } from "src/mediaAttachment/entity/mediaAttachment.entity";
import { MediaAttachmentService } from "src/mediaAttachment/mediaAttachment.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([SatEntity, RepreAtendenteEntity, MediaAttachmentEntity]),
        AvtModule,
        UsuarioModule,
        MailModule,
    ],
    controllers: [SatController],
    providers: [SatService, MediaAttachmentService],
    exports: [SatService],
})
export class SatModule { }