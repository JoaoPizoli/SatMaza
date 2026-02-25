import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TipoUsuarioEnum } from "../enum/tipo-usuario.enum";
import { Exclude } from "class-transformer";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";


@Entity()
export class UsuarioEntity {
    @ApiProperty({ description: 'ID do usuário', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Código do usuário', example: "003" })
    @Column({ unique: true, type: "varchar", length: 3 })
    usuario: string;

    @ApiProperty({ description: 'E-mail do usuário', example: 'usuario@satmaza.com', nullable: true })
    @Column({ unique: true, nullable: true })
    email?: string;

    @ApiHideProperty()
    @Column()
    @Exclude()
    senha: string;

    @ApiProperty({ description: 'Tipo/perfil do usuário', enum: TipoUsuarioEnum, example: TipoUsuarioEnum.REPRESENTANTE })
    @Column({
        type: 'enum',
        enum: TipoUsuarioEnum
    })
    tipo: TipoUsuarioEnum

    @ApiProperty({ description: 'Data de criação do usuário' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Nome do usuário', example: 'João Pedro', nullable: true })
    @Column({ nullable: true })
    nome?: string;

    @ApiProperty({ description: 'Indica se o usuário já alterou a senha padrão', example: false })
    @Column({ default: false })
    password_changed: boolean;
}