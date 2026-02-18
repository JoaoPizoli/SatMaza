import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, Matches } from "class-validator";
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
    @IsNotEmpty({ message: 'O produto é obrigatório' })
    produtos: string;

    @ApiProperty({ description: 'Quantidade do produto', example: 10 })
    @IsNumber()
    quantidade: number;

    @ApiProperty({
        description: 'Lista de lotes e suas respectivas validades',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                lote: { type: 'string', example: '241001-001' },
                validade: { type: 'string', example: '2026-12-31' }
            }
        },
        example: [{ lote: '241001-001', validade: '2026-12-31' }]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Pelo menos um lote é obrigatório' })
    lotes: { lote: string, validade: string }[];

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