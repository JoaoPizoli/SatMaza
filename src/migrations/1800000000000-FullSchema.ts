import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration consolidada — estado final do schema em produção.
 *
 * Cria do zero todas as tabelas, enums, índices e foreign keys.
 * O usuário ADMIN é criado automaticamente no boot pelo UsuarioService.onModuleInit().
 */
export class FullSchema1800000000000 implements MigrationInterface {
    name = 'FullSchema1800000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {

        // ── Extensão UUID ──────────────────────────────────────────────────────
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // ── Enums ──────────────────────────────────────────────────────────────
        await queryRunner.query(`
            CREATE TYPE "public"."usuario_entity_tipo_enum" AS ENUM(
                'ADMIN', 'ORQUESTRADOR', 'BAGUA', 'BSOLVENTE', 'REPRESENTANTE'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."midia_attachment_status_enum" AS ENUM(
                'PENDING', 'READY', 'FAILED'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sat_status_enum" AS ENUM(
                'PENDENTE', 'ENVIADO_BAGUA', 'ENVIADO_BSOLVENTE', 'FINALIZADA', 'EM_ANALISE'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sat_destino_enum" AS ENUM(
                'BASE_AGUA', 'BASE_SOLVENTE'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."avt_status_enum" AS ENUM(
                'PENDENTE', 'CONCLUIDO', 'EM_ANALISE'
            )
        `);

        // ── Tabelas ────────────────────────────────────────────────────────────

        // usuario_entity
        await queryRunner.query(`
            CREATE TABLE "usuario_entity" (
                "id"               SERIAL      NOT NULL,
                "usuario"          varchar(3)  NOT NULL,
                "email"            varchar              ,
                "senha"            varchar     NOT NULL,
                "tipo"             "public"."usuario_entity_tipo_enum" NOT NULL,
                "createdAt"        TIMESTAMP   NOT NULL DEFAULT now(),
                "nome"             varchar              ,
                "password_changed" boolean     NOT NULL DEFAULT false,
                CONSTRAINT "UQ_772bf338df28ac61f2d2573ac1f" UNIQUE ("usuario"),
                CONSTRAINT "UQ_6082ea37fc8d89e467f2674e742" UNIQUE ("email"),
                CONSTRAINT "PK_62e71f62ae485377e123dab0c57" PRIMARY KEY ("id")
            )
        `);

        // sat
        await queryRunner.query(`
            CREATE TABLE "sat" (
                "id"               uuid        NOT NULL DEFAULT uuid_generate_v4(),
                "seq"              SERIAL      NOT NULL,
                "codigo"           varchar(12) NOT NULL,
                "cliente"          varchar     NOT NULL,
                "cidade"           varchar     NOT NULL,
                "produtos"         varchar     NOT NULL,
                "quantidade"       integer     NOT NULL,
                "contato"          varchar     NOT NULL,
                "representante_id" integer     NOT NULL,
                "telefone"         varchar     NOT NULL,
                "reclamacao"       varchar     NOT NULL,
                "status"           "public"."sat_status_enum" NOT NULL DEFAULT 'PENDENTE',
                "destino"          "public"."sat_destino_enum",
                "createdAt"        TIMESTAMP   NOT NULL DEFAULT now(),
                "updatedAt"        TIMESTAMP   NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_aabd0c20156d01f680deda1e4f0" UNIQUE ("codigo"),
                CONSTRAINT "PK_d91d6e5643c9836a8596a01699c" PRIMARY KEY ("id")
            )
        `);

        // sat_lote
        await queryRunner.query(`
            CREATE TABLE "sat_lote" (
                "id"       uuid         NOT NULL DEFAULT uuid_generate_v4(),
                "lote"     varchar(255) NOT NULL,
                "validade" varchar(255) NOT NULL,
                "sat_id"   uuid         NOT NULL,
                CONSTRAINT "PK_sat_lote_id" PRIMARY KEY ("id")
            )
        `);

        // midia_attachment
        await queryRunner.query(`
            CREATE TABLE "midia_attachment" (
                "id"           uuid         NOT NULL,
                "sat_id"       uuid         NOT NULL,
                "blobName"     varchar(255) NOT NULL,
                "mimeType"     varchar(100) NOT NULL,
                "sizeBytes"    bigint       NOT NULL,
                "originalName" varchar(255),
                "status"       "public"."midia_attachment_status_enum" NOT NULL DEFAULT 'PENDING',
                "context"      varchar(20)  NOT NULL DEFAULT 'sat_evidencia',
                "createdAt"    TIMESTAMP    NOT NULL DEFAULT now(),
                CONSTRAINT "PK_535d82836c6c66ec0d61b3078fa" PRIMARY KEY ("id")
            )
        `);

        // avt
        await queryRunner.query(`
            CREATE TABLE "avt" (
                "id"                    uuid      NOT NULL DEFAULT uuid_generate_v4(),
                "sat_id"                uuid      NOT NULL,
                "averigucao_tecnica"    text,
                "possiveis_causas"      text,
                "media_id"              uuid,
                "lote"                  varchar(10),
                "reclamacao_procedente" boolean,
                "troca"                 boolean,
                "recolhimento_lote"     boolean,
                "solucao"               text,
                "data"                  TIMESTAMP NOT NULL,
                "createdAt"             TIMESTAMP NOT NULL DEFAULT now(),
                "usuario_id"            integer   NOT NULL,
                "status"                "public"."avt_status_enum" NOT NULL DEFAULT 'PENDENTE',
                CONSTRAINT "REL_7165b0e968faa4eb88d5ca99bf" UNIQUE ("sat_id"),
                CONSTRAINT "REL_f409a2576202677a993c558f2a" UNIQUE ("media_id"),
                CONSTRAINT "PK_5aed136dc16d664efb67719111e" PRIMARY KEY ("id")
            )
        `);

        // blacklisted_tokens
        await queryRunner.query(`
            CREATE TABLE "blacklisted_tokens" (
                "id"        SERIAL    NOT NULL,
                "token"     text      NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8fb1bc7333c3b9f249f9feaa55d" PRIMARY KEY ("id")
            )
        `);

        // refresh_tokens
        await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id"         SERIAL    NOT NULL,
                "token"      text      NOT NULL,
                "usuario_id" integer   NOT NULL,
                "expiresAt"  TIMESTAMP NOT NULL,
                "revoked"    boolean   NOT NULL DEFAULT false,
                "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
            )
        `);

        // repre_atendente_entity
        await queryRunner.query(`
            CREATE TABLE "repre_atendente_entity" (
                "id"                            SERIAL  NOT NULL,
                "usuarios"                      TEXT[]  NOT NULL,
                "nome_representante_comercial"  varchar NOT NULL,
                "email_representante_comercial" varchar NOT NULL,
                CONSTRAINT "PK_repre_atendente_entity" PRIMARY KEY ("id")
            )
        `);

        // ── Foreign Keys ───────────────────────────────────────────────────────
        await queryRunner.query(`
            ALTER TABLE "sat"
            ADD CONSTRAINT "FK_233f266fca4dcaba3aa7136a5de"
            FOREIGN KEY ("representante_id") REFERENCES "usuario_entity"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sat_lote"
            ADD CONSTRAINT "FK_sat_lote_sat"
            FOREIGN KEY ("sat_id") REFERENCES "sat"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "midia_attachment"
            ADD CONSTRAINT "FK_25b5837432a156888cf5e4eed05"
            FOREIGN KEY ("sat_id") REFERENCES "sat"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "avt"
            ADD CONSTRAINT "FK_7165b0e968faa4eb88d5ca99bf3"
            FOREIGN KEY ("sat_id") REFERENCES "sat"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "avt"
            ADD CONSTRAINT "FK_f409a2576202677a993c558f2a4"
            FOREIGN KEY ("media_id") REFERENCES "midia_attachment"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "avt"
            ADD CONSTRAINT "FK_423b39837a7632a869aebdd97f0"
            FOREIGN KEY ("usuario_id") REFERENCES "usuario_entity"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // ── Índices ────────────────────────────────────────────────────────────
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_aabd0c20156d01f680deda1e4f" ON "sat" ("codigo")`);
        await queryRunner.query(`CREATE INDEX "IDX_blacklisted_tokens_token"     ON "blacklisted_tokens" ("token")`);
        await queryRunner.query(`CREATE INDEX "IDX_blacklisted_tokens_expiresAt" ON "blacklisted_tokens" ("expiresAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_sat_representante_id"         ON "sat" ("representante_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_sat_status"                   ON "sat" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_sat_destino"                  ON "sat" ("destino")`);
        await queryRunner.query(`CREATE INDEX "IDX_sat_createdAt"                ON "sat" ("createdAt" DESC)`);
        await queryRunner.query(`CREATE INDEX "IDX_avt_sat_id"                   ON "avt" ("sat_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_avt_usuario_id"               ON "avt" ("usuario_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_token"         ON "refresh_tokens" ("token")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        // ── Índices ────────────────────────────────────────────────────────────
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_token"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_avt_usuario_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_avt_sat_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_destino"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_representante_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blacklisted_tokens_expiresAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blacklisted_tokens_token"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_aabd0c20156d01f680deda1e4f"`);

        // ── Foreign Keys ───────────────────────────────────────────────────────
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT IF EXISTS "FK_423b39837a7632a869aebdd97f0"`);
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT IF EXISTS "FK_f409a2576202677a993c558f2a4"`);
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT IF EXISTS "FK_7165b0e968faa4eb88d5ca99bf3"`);
        await queryRunner.query(`ALTER TABLE "midia_attachment" DROP CONSTRAINT IF EXISTS "FK_25b5837432a156888cf5e4eed05"`);
        await queryRunner.query(`ALTER TABLE "sat_lote" DROP CONSTRAINT IF EXISTS "FK_sat_lote_sat"`);
        await queryRunner.query(`ALTER TABLE "sat" DROP CONSTRAINT IF EXISTS "FK_233f266fca4dcaba3aa7136a5de"`);

        // ── Tabelas (ordem de dependência: filhos antes dos pais) ─────────────
        await queryRunner.query(`DROP TABLE IF EXISTS "repre_atendente_entity"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "blacklisted_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "avt"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "midia_attachment"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sat_lote"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sat"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "usuario_entity"`);

        // ── Enums ──────────────────────────────────────────────────────────────
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."avt_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."sat_destino_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."sat_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."midia_attachment_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."usuario_entity_tipo_enum"`);
    }
}
