import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokensAndOrquestrador1771600000000 implements MigrationInterface {
    name = 'AddRefreshTokensAndOrquestrador1771600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tabela de refresh tokens (sistema de login persistente 15 dias)
        await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" SERIAL NOT NULL,
                "token" text NOT NULL,
                "usuario_id" integer NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "revoked" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
        `);

        // 2. Adiciona ORQUESTRADOR ao enum de tipo de usuário
        await queryRunner.query(`
            ALTER TYPE "public"."usuario_entity_tipo_enum"
            ADD VALUE IF NOT EXISTS 'ORQUESTRADOR'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove a tabela de refresh tokens
        await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_token"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);

        // Nota: PostgreSQL não permite remover valores de enum diretamente.
        // Para reverter o ORQUESTRADOR seria necessário recriar o enum,
        // o que exigiria alterar todas as colunas que o referenciam.
        // Em produção, o down() de enum geralmente é um no-op aceito.
    }
}
