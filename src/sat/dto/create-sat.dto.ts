import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { StatusSatEnum } from "../enum/status-sat.enum";


export class CreateSatDto {

    @IsString()
    cliente: string;  // Inserido pela logica do sistema

    @IsString()
    cidade: string;  // Inserido pela logica do sistema

    @IsString()
    produtos: string;  // Inserido pela logica do sistema

    @IsNumber()
    quantidade: number;

    @IsString()
    @IsOptional()
    lote: string;

    @IsString()
    validade: string;

    @IsString()
    contato: string;

    @IsNumber()
    representante_id: number;

    @IsString()
    telefone: string;

    @IsString()
    reclamacao: string;
}