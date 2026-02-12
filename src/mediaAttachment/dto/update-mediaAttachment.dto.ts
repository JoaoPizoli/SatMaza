import { PartialType } from "@nestjs/mapped-types";
import { CreateMediaAttachmentDto } from "./create-mediaAttachment.dto";

export class UpdateMediaAttachmentDto extends PartialType(CreateMediaAttachmentDto) {}

