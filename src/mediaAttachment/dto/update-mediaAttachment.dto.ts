import { PartialType } from "@nestjs/swagger";
import { CreateMediaAttachmentDto } from "./create-mediaAttachment.dto";

export class UpdateMediaAttachmentDto extends PartialType(CreateMediaAttachmentDto) {}

