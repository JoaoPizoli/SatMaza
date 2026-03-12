import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsNumber, IsBooleanString } from "class-validator";

export class DashboardFilterDto {
    @ApiProperty({ description: 'Data inicial para filtro (YYYY-MM-DD)', required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ description: 'Data final para filtro (YYYY-MM-DD)', required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ description: 'ID do representante para filtro', required: false })
    @IsOptional()
    representanteId?: number;

    @ApiProperty({ description: 'Nome do produto para filtro parcial', required: false })
    @IsOptional()
    @IsString()
    representanteCodigo?: string;

    @IsOptional()
    @IsString()
    produto?: string;

    @ApiProperty({ description: 'Filtrar por reclamação procedente (true/false)', required: false })
    @IsOptional()
    @IsBooleanString()
    procedente?: string;
}
