import { Expose } from "class-transformer";
import { StatusAvtEnum } from "../enum/status-avt.enum";
import { ApiProperty } from "@nestjs/swagger";


export class ResponseAvtDto {
    @ApiProperty({ description: 'ID da AVT', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'ID da SAT associada', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
    @Expose()
    sat_id: string;

    @ApiProperty({ description: 'ID da mídia/laudo associado', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
    @Expose()
    media_id: string; 

    @ApiProperty({ description: 'Descrição da averiguação técnica' })
    @Expose()
    averigucao_tecnica: string;

    @ApiProperty({ description: 'Possíveis causas identificadas' })
    @Expose()
    possiveis_causas: string;

    @ApiProperty({ description: 'Lote analisado', example: '241001-001' })
    @Expose()
    lote: string;

    @ApiProperty({ description: 'Indica se a reclamação é procedente' })
    @Expose()
    reclamacao_procedente: boolean

    @ApiProperty({ description: 'Indica se será realizada troca' })
    @Expose()
    troca: boolean;

    @ApiProperty({ description: 'Indica se será realizado recolhimento do lote' })
    @Expose()
    recolhimento_lote: boolean;

    @ApiProperty({ description: 'Solução proposta' })
    @Expose()
    solucao: string;

    @ApiProperty({ description: 'Data da averiguação', type: Date })
    @Expose()
    data: Date;

    @ApiProperty({ description: 'Status da AVT', enum: StatusAvtEnum })
    @Expose()
    status: StatusAvtEnum;
}