import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { StatusMediaEnum } from "../enum/status-media.enum";
import { SatEntity } from "../../sat/entity/sat.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity({ name: 'midia_attachment'})
export class MediaAttachmentEntity {
    @ApiProperty({ description: 'ID da mídia (UUID)', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
    @PrimaryColumn('uuid')
    id: string;

    @ApiProperty({ description: 'SAT associada', type: () => SatEntity })
    @ManyToOne(() => SatEntity, (sat) => sat.evidencias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sat_id' })
    sat: SatEntity;

    @ApiProperty({ description: 'ID da SAT associada', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @Column({ type: 'uuid' })
    sat_id: string;

    @ApiProperty({ description: 'Nome do blob no Azure Storage', example: 'evidencias/abc123.jpg' })
    @Column({ type: 'varchar', length: 255 })
    blobName: string;

    @ApiProperty({ description: 'Tipo MIME do arquivo', example: 'image/jpeg' })
    @Column({ type: 'varchar', length: 100 })
    mimeType: string;

    @ApiProperty({ description: 'Tamanho do arquivo em bytes', example: 1048576 })
    @Column({ type: 'bigint' })
    sizeBytes: number;

    @ApiProperty({ description: 'Nome original do arquivo', example: 'foto_evidencia.jpg', nullable: true })
    @Column({ type: 'varchar', length: 255, nullable: true })
    originalName?: string;

    @ApiProperty({ description: 'Status do upload da mídia', enum: StatusMediaEnum, example: StatusMediaEnum.PENDING })
    @Column({
        type: 'enum',
        enum: StatusMediaEnum,
        default: StatusMediaEnum.PENDING,
    })
    status: StatusMediaEnum;

    @ApiProperty({ description: 'Data de criação do registro' })
    @CreateDateColumn()
    createdAt: Date;
}