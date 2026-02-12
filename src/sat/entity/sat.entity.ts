import { Column, Entity, Generated, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LaboratorioSatEnum } from "../enum/laboratorio-sat.enum";
import { StatusSatEnum } from "../enum/status-sat.enum";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";
import { MediaAttachmentEntity } from "src/mediaAttachment/entity/mediaAttachment.entity";

@Entity({ name: 'sat'})
export class SatEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'int'})
    @Generated('increment')
    seq: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 12, unique: true })
    codigo: string;

    @Column()
    cliente: string;

    @Column()
    cidade: string;

    @Column()
    produtos: string;

    @Column()
    quantidade: number;

    @Column({ type: 'string', length: 10 })
    lote?: string;

    @Column()
    validade: string;

    @Column()
    contato: string;

    @ManyToOne(()=> UsuarioEntity)
    @JoinColumn({ name: 'representante_id' })
    representante: UsuarioEntity;

    @Column()
    representante_id: number;

    @Column()
    telefone: string;

    @Column()
    reclamacao: string;

    @Column({
        type: 'enum',
        enum: StatusSatEnum,
        default: StatusSatEnum.PENDENTE
    })
    status: StatusSatEnum;

    @Column({
        type: 'enum',
        enum: LaboratorioSatEnum,
    })
    destino: LaboratorioSatEnum;

    @OneToMany(() => MediaAttachmentEntity, (media) => media.sat)
    evidencias: MediaAttachmentEntity[];
}