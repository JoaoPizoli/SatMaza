import { IsEnum, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, Matches } from "class-validator";
import { StatusSatEnum } from "../enum/status-sat.enum";
import { LaboratorioSatEnum } from "../enum/laboratorio-sat.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class CreateSatDto {

    @ApiProperty({ description: 'Nome do cliente', example: 'Empresa ABC Ltda' })
    @IsString()
    cliente: string;

    @ApiProperty({ description: 'Cidade do cliente', example: 'São Paulo' })
    @IsString()
    cidade: string;

    @ApiProperty({ description: 'Produto relacionado à SAT (1 produto por SAT)', example: 'Tinta Acrílica Premium' })
    @IsString()
    produtos: string;

    @ApiProperty({ description: 'Quantidade do produto', example: 10 })
    @IsNumber()
    quantidade: number;

    @ApiProperty({ description: 'Lista de lotes no formato 000000-000', type: [String], example: ['241001-001', '241001-002'] })
    @IsArray()
    @ArrayMinSize(1, { message: 'Pelo menos um lote é obrigatório' })
    @IsString({ each: true })
    @Matches(/^\d{6}-\d{3}$/, { each: true, message: 'Formato do lote deve ser 000000-000' })
    lotes: string[];

    @ApiProperty({ description: 'Data de validade do produto', example: '2026-12-31' })
    @IsString()
    validade: string;

    @ApiProperty({ description: 'Nome do contato', example: 'João Silva' })
    @IsString()
    contato: string;

    @ApiProperty({ description: 'ID do representante responsável', example: 12345 })
    @IsNumber()
    representante_id: number;

    @ApiProperty({ description: 'Telefone de contato', example: '(11) 99999-9999' })
    @IsString()
    telefone: string;

    @ApiProperty({ description: 'Descrição da reclamação', example: 'Produto apresentou defeito na aplicação' })
    @IsString()
    reclamacao: string;

    @ApiPropertyOptional({ description: 'Laboratório de destino (definido pelo orquestrador)', enum: LaboratorioSatEnum })
    @IsOptional()
    @IsEnum(LaboratorioSatEnum)
    destino?: LaboratorioSatEnum;
}