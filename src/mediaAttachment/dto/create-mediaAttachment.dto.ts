import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMediaAttachmentDto {
    @IsUUID()
    satId: string;

    @IsString()
    mimeType: string;

    @IsNumber()
    sizeBytes: number;

    @IsString()
    @IsOptional()
    originalName?: string;
}