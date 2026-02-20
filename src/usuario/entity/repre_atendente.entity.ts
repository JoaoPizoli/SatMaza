import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class RepreAtendenteEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // Array no PostgreSQL para armazenar múltiplos códigos, ex: ['003', '007', '098']
    @Column({ type: "text", array: true })
    usuarios: string[];

    @Column()
    nome_representante_comercial: string;

    @Column()
    email_representante_comercial: string;
}
