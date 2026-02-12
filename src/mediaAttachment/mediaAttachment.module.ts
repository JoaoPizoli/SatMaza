import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaAttachmentEntity } from "./entity/mediaAttachment.entity";
import { MediaAttachmentService } from "./mediaAttachment.service";
import { MediaAttachmentController } from "./mediaAttachment.controller";

@Module({
    imports: [TypeOrmModule.forFeature([MediaAttachmentEntity])],
    controllers: [MediaAttachmentController],
    providers: [MediaAttachmentService],
    exports: [MediaAttachmentService],
})
export class MediaAttachmentModule {}