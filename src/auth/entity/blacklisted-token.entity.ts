import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity('blacklisted_tokens')
export class BlacklistedTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'text' })
    token: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
