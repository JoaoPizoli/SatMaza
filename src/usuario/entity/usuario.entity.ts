import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TipoUsuarioEnum } from "../enum/tipo-usuario.enum";
import { Exclude } from "class-transformer";


@Entity()
export class UsuarioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    usuario: number;

    @Column({ unique: true, nullable: true })
    email?: string;

    @Column()
    @Exclude()
    senha: string;

    @Column({
        type: 'enum',
        enum: TipoUsuarioEnum
    })
    tipo: TipoUsuarioEnum

    @CreateDateColumn()
    createdAt: Date;
}