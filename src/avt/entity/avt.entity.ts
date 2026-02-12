import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SatEntity } from "src/sat/entity/sat.entity";
import { MediaAttachmentEntity } from "src/mediaAttachment/entity/mediaAttachment.entity";
import { StatusAvtEnum } from "../enum/status-avt.enum";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";


@Entity({ name: 'avt'})
export class AvtEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => SatEntity, { onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'sat_id'})
    sat: SatEntity
    
    @Column()
    sat_id: string;

    @Column({ type: 'varchar', length: 250 })
    averigucao_tecnica: string;

    @Column({ type: 'varchar', length: 250 })
    possiveis_causas: string;

    @OneToOne(()=> MediaAttachmentEntity, { onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'media_id'})
    laudo: MediaAttachmentEntity;

    @Column()
    media_id: string;

    @Column({ type: 'varchar', length: 10})
    lote: string;

    @Column()
    reclamacao_procedente: boolean;

    @Column()
    troca: boolean;

    @Column()
    recolhimento_lote: boolean;

    @Column({ type: 'varchar', length: 250 })
    solucao: string;

    @Column()
    data: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(()=> UsuarioEntity, (u) => u.id)
    @JoinColumn({ name: 'usuario_id' })
    responsavel_tecnico: UsuarioEntity;

    @Column()
    usuario_id: number;

    @Column({
        type: 'enum',
        enum: StatusAvtEnum,
        default: StatusAvtEnum.PENDENTE
    })
    status: StatusAvtEnum;

}