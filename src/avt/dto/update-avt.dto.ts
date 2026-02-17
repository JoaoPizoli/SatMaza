import { PartialType } from "@nestjs/swagger";
import { CreateAvtDto } from "./create-avt.dto";
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { StatusAvtEnum } from "../enum/status-avt.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateAvtDto {
    @ApiProperty({ description: 'ID da mídia/laudo associado', required: false })
    @IsOptional()
    @IsString()
    media_id?: string | null;

    @ApiProperty({ description: 'Descrição da averiguação técnica', required: false })
    @IsOptional()
    @IsString()
    averigucao_tecnica?: string;

    @ApiProperty({ description: 'Possíveis causas identificadas', required: false })
    @IsOptional()
    @IsString()
    possiveis_causas?: string;

    @ApiProperty({ description: 'Lote analisado', required: false })
    @IsOptional()
    @IsString()
    lote?: string;

    @ApiProperty({ description: 'Indica se a reclamação é procedente', required: false })
    @IsOptional()
    @IsBoolean()
    reclamacao_procedente?: boolean

    @ApiProperty({ description: 'Indica se será realizada troca', required: false })
    @IsOptional()
    @IsBoolean()
    troca?: boolean;

    @ApiProperty({ description: 'Indica se será realizado recolhimento do lote', required: false })
    @IsOptional()
    @IsBoolean()
    recolhimento_lote?: boolean;

    @ApiProperty({ description: 'Solução proposta', required: false })
    @IsOptional()
    @IsString()
    solucao?: string;

    @ApiProperty({ description: 'Data da averiguação', required: false, type: Date })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    data?: Date;

    @ApiProperty({ description: 'Status da AVT', enum: StatusAvtEnum, required: false })
    @IsOptional()
    @IsEnum(StatusAvtEnum)
    status?: StatusAvtEnum;
}