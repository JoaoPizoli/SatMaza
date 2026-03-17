import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('refresh_tokens')
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'text' })
    token: string;

    @Column()
    usuario_id: number;

    @Column({ default: 'usuario' })
    entity_type: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    revoked: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
