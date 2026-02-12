import { IsBoolean, IsDate, IsEnum, IsString } from "class-validator"
import { StatusAvtEnum } from "../enum/status-avt.enum"

export class CreateAvtDto {

    @IsString()
    media_id: string; 

    @IsString()
    averigucao_tecnica: string;

    @IsString()
    possiveis_causas: string;

    @IsString()
    lote: string;

    @IsBoolean()
    reclamacao_procedente: boolean

    @IsBoolean()
    troca: boolean;

    @IsBoolean()
    recolhimento_lote: boolean;

    @IsString()
    solucao: string;

    @IsDate()
    data: Date;

    @IsEnum(StatusAvtEnum)
    status: StatusAvtEnum;

}