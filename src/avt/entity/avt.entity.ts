import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SatEntity } from "../../sat/entity/sat.entity";
import { MediaAttachmentEntity } from "../../mediaAttachment/entity/mediaAttachment.entity";
import { StatusAvtEnum } from "../enum/status-avt.enum";
import { UsuarioEntity } from "../../usuario/entity/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity({ name: 'avt'})
export class AvtEntity {
    @ApiProperty({ description: 'ID da AVT (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'SAT associada', type: () => SatEntity })
    @OneToOne(() => SatEntity, { onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'sat_id'})
    sat: SatEntity
    
    @ApiProperty({ description: 'ID da SAT associada' })
    @Column()
    sat_id: string;

    @ApiProperty({ description: 'Descrição da averiguação técnica' })
    @Column({ type: 'varchar', length: 250 })
    averigucao_tecnica: string;

    @ApiProperty({ description: 'Possíveis causas identificadas' })
    @Column({ type: 'varchar', length: 250 })
    possiveis_causas: string;

    @ApiProperty({ description: 'Laudo/mídia associada', type: () => MediaAttachmentEntity })
    @OneToOne(()=> MediaAttachmentEntity, { onDelete: 'RESTRICT'})
    @JoinColumn({ name: 'media_id'})
    laudo: MediaAttachmentEntity;

    @ApiProperty({ description: 'ID da mídia/laudo' })
    @Column()
    media_id: string;

    @ApiProperty({ description: 'Lote analisado', example: '241001-001' })
    @Column({ type: 'varchar', length: 10})
    lote: string;

    @ApiProperty({ description: 'Indica se a reclamação é procedente' })
    @Column()
    reclamacao_procedente: boolean;

    @ApiProperty({ description: 'Indica se será realizada troca' })
    @Column()
    troca: boolean;

    @ApiProperty({ description: 'Indica se será realizado recolhimento do lote' })
    @Column()
    recolhimento_lote: boolean;

    @ApiProperty({ description: 'Solução proposta' })
    @Column({ type: 'varchar', length: 250 })
    solucao: string;

    @ApiProperty({ description: 'Data da averiguação' })
    @Column()
    data: Date;

    @ApiProperty({ description: 'Data de criação do registro' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Responsável técnico', type: () => UsuarioEntity })
    @OneToOne(()=> UsuarioEntity, (u) => u.id)
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