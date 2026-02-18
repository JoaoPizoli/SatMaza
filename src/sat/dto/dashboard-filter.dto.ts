import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsNumber } from "class-validator";

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
    // O valor pode vir como string da query, então transformamos ou deixamos flexível se o pipe não tratar
    representanteId?: number;

    @ApiProperty({ description: 'Nome do produto para filtro parcial', required: false })
    @IsOptional()
    @IsString()
    produto?: string;
}
