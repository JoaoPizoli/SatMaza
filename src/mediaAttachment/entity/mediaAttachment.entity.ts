import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { StatusMediaEnum } from "../enum/status-media.enum";
import { SatEntity } from "src/sat/entity/sat.entity";


@Entity({ name: 'midia_attachment'})
export class MediaAttachmentEntity {
    @PrimaryColumn('uuid')
    id: string;

    @ManyToOne(() => SatEntity, (sat) => sat.evidencias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sat_id' })
    sat: SatEntity;

    @Column({ type: 'uuid' })
    sat_id: string;

    @Column({ type: 'varchar', length: 255 })
    blobName: string;

    @Column({ type: 'varchar', length: 100 })
    mimeType: string;

    @Column({ type: 'bigint' })
    sizeBytes: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    originalName?: string;

    @Column({
        type: 'enum',
        enum: StatusMediaEnum,
        default: StatusMediaEnum.PENDING,
    })
    status: StatusMediaEnum;

    @CreateDateColumn()
    createdAt: Date;
}