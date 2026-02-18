
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SatEntity } from "./sat.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'sat_lote' })
export class SatLoteEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Número do lote', example: '241001-001' })
    @Column()
    lote: string;

    @ApiProperty({ description: 'Data de validade', example: '2026-12-31' })
    @Column()
    validade: string; // Manter como string yyyy-mm-dd por enquanto, consistente com o anterior

    @ManyToOne(() => SatEntity, (sat) => sat.lotes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sat_id' })
    sat: SatEntity;

    @Column()
    sat_id: string;
}
