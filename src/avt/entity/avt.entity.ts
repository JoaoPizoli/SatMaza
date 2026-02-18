import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SatEntity } from "../../sat/entity/sat.entity";
import { MediaAttachmentEntity } from "../../mediaAttachment/entity/mediaAttachment.entity";
import { StatusAvtEnum } from "../enum/status-avt.enum";
import { UsuarioEntity } from "../../usuario/entity/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity({ name: 'avt' })
export class AvtEntity {
    @ApiProperty({ description: 'ID da AVT (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'SAT associada', type: () => SatEntity })
    @OneToOne(() => SatEntity, (sat) => sat.avt, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'sat_id' })
    sat: SatEntity

    @ApiProperty({ description: 'ID da SAT associada' })
    @Column()
    sat_id: string;

    @ApiProperty({ description: 'Descrição da averiguação técnica', nullable: true })
    @Column({ type: 'text', nullable: true })
    averigucao_tecnica: string;

    @ApiProperty({ description: 'Possíveis causas identificadas', nullable: true })
    @Column({ type: 'text', nullable: true })
    possiveis_causas: string;

    @ApiProperty({ description: 'Laudo/mídia associada', type: () => MediaAttachmentEntity, nullable: true })
    @OneToOne(() => MediaAttachmentEntity, { onDelete: 'RESTRICT', nullable: true, eager: true })
    @JoinColumn({ name: 'media_id' })
    laudo: MediaAttachmentEntity;

    @ApiProperty({ description: 'ID da mídia/laudo', nullable: true })
    @Column({ nullable: true })
    media_id: string | null;

    @ApiProperty({ description: 'Lote analisado', example: '241001-001', nullable: true })
    @Column({ type: 'varchar', length: 10, nullable: true })
    lote: string;

    @ApiProperty({ description: 'Indica se a reclamação é procedente', nullable: true })
    @Column({ nullable: true })
    reclamacao_procedente: boolean;

    @ApiProperty({ description: 'Indica se será realizada troca', nullable: true })
    @Column({ nullable: true })
    troca: boolean;

    @ApiProperty({ description: 'Indica se será realizado recolhimento do lote', nullable: true })
    @Column({ nullable: true })
    recolhimento_lote: boolean;

    @ApiProperty({ description: 'Solução proposta', nullable: true })
    @Column({ type: 'text', nullable: true })
    solucao: string;

    @ApiProperty({ description: 'Data da averiguação' })
    @Column()
    data: Date;

    @ApiProperty({ description: 'Data de criação do registro' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Responsável técnico', type: () => UsuarioEntity })
    @ManyToOne(() => UsuarioEntity)
    @JoinColumn({ name: 'usuario_id' })
    responsavel_tecnico: UsuarioEntity;

    @ApiProperty({ description: 'ID do usuário responsável técnico' })
    @Column()
    usuario_id: number;

    @ApiProperty({ description: 'Status da AVT', enum: StatusAvtEnum, example: StatusAvtEnum.PENDENTE })
    @Column({
        type: 'enum',
        enum: StatusAvtEnum,
        default: StatusAvtEnum.PENDENTE
    })
    status: StatusAvtEnum;

}