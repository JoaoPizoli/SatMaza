import { Expose } from "class-transformer";
import { StatusAvtEnum } from "../enum/status-avt.enum";


export class ResponseAvtDto {
    @Expose()
    id: string;

    @Expose()
    sat_id: string;

    @Expose()
    media_id: string; 

    @Expose()
    averigucao_tecnica: string;

    @Expose()
    possiveis_causas: string;

    @Expose()
    lote: string;

    @Expose()
    reclamacao_procedente: boolean

    @Expose()
    troca: boolean;

    @Expose()
    recolhimento_lote: boolean;

    @Expose()
    solucao: string;

    @Expose()
    data: Date;

    @Expose()
    status: StatusAvtEnum;
}