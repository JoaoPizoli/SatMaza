import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMediaAttachmentDto {
    @ApiProperty({ description: 'UUID da SAT associada', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @IsUUID()
    satId: string;

    @ApiProperty({ description: 'Tipo MIME do arquivo', example: 'image/jpeg' })
    @IsString()
    mimeType: string;

    @ApiProperty({ description: 'Tamanho do arquivo em bytes', example: 1048576 })
    @IsNumber()
    sizeBytes: number;

    @ApiPropertyOptional({ description: 'Nome original do arquivo', example: 'foto_evidencia.jpg' })
    @IsString()
    @IsOptional()
    originalName?: string;
}