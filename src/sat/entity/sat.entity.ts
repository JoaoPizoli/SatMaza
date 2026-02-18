import { Column, CreateDateColumn, Entity, Generated, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { LaboratorioSatEnum } from "../enum/laboratorio-sat.enum";
import { StatusSatEnum } from "../enum/status-sat.enum";
import { UsuarioEntity } from "../../usuario/entity/usuario.entity";
import { MediaAttachmentEntity } from "../../mediaAttachment/entity/mediaAttachment.entity";
import { SatLoteEntity } from "./sat-lote.entity";
import { AvtEntity } from "../../avt/entity/avt.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'sat' })
export class SatEntity {
    @ApiProperty({ description: 'ID único da SAT (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({ description: 'Número sequencial da SAT', example: 1 })
    @Column({ type: 'int' })
    @Generated('increment')
    seq: number;

    @ApiProperty({ description: 'Código único da SAT', example: 'SAT-000001' })
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 12, unique: true })
    codigo: string;

    @ApiProperty({ description: 'Nome do cliente', example: 'Empresa ABC Ltda' })
    @Column()
    cliente: string;

    @ApiProperty({ description: 'Cidade do cliente', example: 'São Paulo' })
    @Column()
    cidade: string;

    @ApiProperty({ description: 'Produto relacionado', example: 'Tinta Acrílica Premium' })
    @Column()
    produtos: string;

    @ApiProperty({ description: 'Quantidade do produto', example: 10 })
    @Column()
    quantidade: number;

    @ApiProperty({ description: 'Lista de lotes e suas validades', type: () => [SatLoteEntity] })
    @OneToMany(() => SatLoteEntity, (satLote) => satLote.sat, { cascade: true, eager: true })
    lotes: SatLoteEntity[];

    @ApiProperty({ description: 'Nome do contato', example: 'João Silva' })
    @Column()
    contato: string;

    @ApiProperty({ description: 'Representante responsável', type: () => UsuarioEntity })
    @ManyToOne(() => UsuarioEntity)
    @JoinColumn({ name: 'representante_id' })
    representante: UsuarioEntity;

    @ApiProperty({ description: 'ID do representante', example: 12345 })
    @Column()
    representante_id: number;

    @ApiProperty({ description: 'Telefone de contato', example: '(11) 99999-9999' })
    @Column()
    telefone: string;

    @ApiProperty({ description: 'Descrição da reclamação' })
    @Column()
    reclamacao: string;

    @ApiProperty({ description: 'Status da SAT', enum: StatusSatEnum, example: StatusSatEnum.PENDENTE })
    @Column({
        type: 'enum',
        enum: StatusSatEnum,
        default: StatusSatEnum.PENDENTE
    })
    status: StatusSatEnum;

    @ApiProperty({ description: 'Laboratório de destino', enum: LaboratorioSatEnum, example: LaboratorioSatEnum.BASE_AGUA, nullable: true })
    @Column({
        type: 'enum',
        enum: LaboratorioSatEnum,
        nullable: true,
    })
    destino: LaboratorioSatEnum | null;

    @ApiProperty({ description: 'Evidências/mídias anexadas', type: () => [MediaAttachmentEntity] })
    @OneToMany(() => MediaAttachmentEntity, (media) => media.sat)
    evidencias: MediaAttachmentEntity[];

    @ApiProperty({ description: 'Averiguação Técnica vinculada', type: () => AvtEntity, nullable: true })
    @OneToOne(() => AvtEntity, (avt) => avt.sat, { nullable: true })
    avt: AvtEntity | null;

    @ApiProperty({ description: 'Data de criação da SAT' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Data da última atualização da SAT' })
    @UpdateDateColumn()
    updatedAt: Date;
}