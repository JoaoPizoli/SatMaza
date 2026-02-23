import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaAttachmentEntity } from "./entity/mediaAttachment.entity";
import { MediaAttachmentService } from "./mediaAttachment.service";
import { MediaAttachmentController } from "./mediaAttachment.controller";
import { SatModule } from "src/sat/sat.module";

@Module({
    imports: [TypeOrmModule.forFeature([MediaAttachmentEntity]), SatModule],
    controllers: [MediaAttachmentController],
    providers: [MediaAttachmentService],
    exports: [MediaAttachmentService],
})
export class MediaAttachmentModule {}