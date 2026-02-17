import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from "class-validator"
import { Type } from "class-transformer"
import { StatusAvtEnum } from "../enum/status-avt.enum"
import { ApiProperty } from "@nestjs/swagger"

export class CreateAvtDto {

    @ApiProperty({ description: 'ID da mídia/laudo associado', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', required: false })
    @IsOptional()
    @IsString()
    media_id?: string | null;

    @ApiProperty({ description: 'Descrição da averiguação técnica', example: 'Produto analisado em laboratório' })
    @IsString()
    averigucao_tecnica: string;

    @ApiProperty({ description: 'Possíveis causas identificadas', example: 'Armazenamento inadequado' })
    @IsString()
    possiveis_causas: string;

    @ApiProperty({ description: 'Lote analisado', example: '241001-001' })
    @IsString()
    lote: string;

    @ApiProperty({ description: 'Indica se a reclamação é procedente', example: true })
    @IsBoolean()
    reclamacao_procedente: boolean

    @ApiProperty({ description: 'Indica se será realizada troca', example: false })
    @IsBoolean()
    troca: boolean;

    @ApiProperty({ description: 'Indica se será realizado recolhimento do lote', example: false })
    @IsBoolean()
    recolhimento_lote: boolean;

    @ApiProperty({ description: 'Solução proposta', example: 'Troca do produto e orientação ao cliente' })
    @IsString()
    solucao: string;

    @ApiProperty({ description: 'Data da averiguação', example: '2026-01-15T00:00:00.000Z', type: Date })
    @Type(() => Date)
    @IsDate()
    data: Date;

    @ApiProperty({ description: 'Status da AVT', enum: StatusAvtEnum, example: StatusAvtEnum.PENDENTE })
    @IsEnum(StatusAvtEnum)
    status: StatusAvtEnum;

}