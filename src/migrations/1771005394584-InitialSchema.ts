import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771005394584 implements MigrationInterface {
    name = 'InitialSchema1771005394584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."usuario_entity_tipo_enum" AS ENUM('ADMIN', 'BAGUA', 'BSOLVENTE', 'REPRESENTANTE')`);
        await queryRunner.query(`CREATE TABLE "usuario_entity" ("id" SERIAL NOT NULL, "usuario" integer NOT NULL, "email" character varying, "senha" character varying NOT NULL, "tipo" "public"."usuario_entity_tipo_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_772bf338df28ac61f2d2573ac1f" UNIQUE ("usuario"), CONSTRAINT "UQ_6082ea37fc8d89e467f2674e742" UNIQUE ("email"), CONSTRAINT "PK_62e71f62ae485377e123dab0c57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."midia_attachment_status_enum" AS ENUM('PENDING', 'READY', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "midia_attachment" ("id" uuid NOT NULL, "sat_id" uuid NOT NULL, "blobName" character varying(255) NOT NULL, "mimeType" character varying(100) NOT NULL, "sizeBytes" bigint NOT NULL, "originalName" character varying(255), "status" "public"."midia_attachment_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_535d82836c6c66ec0d61b3078fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sat_status_enum" AS ENUM('PENDENTE', 'ENVIADO_BAGUA', 'ENVIADO_BSOLVENTE')`);
        await queryRunner.query(`CREATE TYPE "public"."sat_destino_enum" AS ENUM('BASE_AGUA', 'BASE_SOLVENTE')`);
        await queryRunner.query(`CREATE TABLE "sat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "seq" SERIAL NOT NULL, "codigo" character varying(12) NOT NULL, "cliente" character varying NOT NULL, "cidade" character varying NOT NULL, "produtos" character varying NOT NULL, "quantidade" integer NOT NULL, "lotes" text NOT NULL, "validade" character varying NOT NULL, "contato" character varying NOT NULL, "representante_id" integer NOT NULL, "telefone" character varying NOT NULL, "reclamacao" character varying NOT NULL, "status" "public"."sat_status_enum" NOT NULL DEFAULT 'PENDENTE', "destino" "public"."sat_destino_enum" NOT NULL, CONSTRAINT "UQ_aabd0c20156d01f680deda1e4f0" UNIQUE ("codigo"), CONSTRAINT "PK_d91d6e5643c9836a8596a01699c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_aabd0c20156d01f680deda1e4f" ON "sat" ("codigo") `);
        await queryRunner.query(`CREATE TYPE "public"."avt_status_enum" AS ENUM('PENDENTE', 'CONCLUIDO')`);
        await queryRunner.query(`CREATE TABLE "avt" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sat_id" uuid NOT NULL, "averigucao_tecnica" character varying(250) NOT NULL, "possiveis_causas" character varying(250) NOT NULL, "media_id" uuid NOT NULL, "lote" character varying(10) NOT NULL, "reclamacao_procedente" boolean NOT NULL, "troca" boolean NOT NULL, "recolhimento_lote" boolean NOT NULL, "solucao" character varying(250) NOT NULL, "data" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "usuario_id" integer NOT NULL, "status" "public"."avt_status_enum" NOT NULL DEFAULT 'PENDENTE', CONSTRAINT "REL_7165b0e968faa4eb88d5ca99bf" UNIQUE ("sat_id"), CONSTRAINT "REL_f409a2576202677a993c558f2a" UNIQUE ("media_id"), CONSTRAINT "REL_423b39837a7632a869aebdd97f" UNIQUE ("usuario_id"), CONSTRAINT "PK_5aed136dc16d664efb67719111e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blacklisted_tokens" ("id" SERIAL NOT NULL, "token" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8fb1bc7333c3b9f249f9feaa55d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "midia_attachment" ADD CONSTRAINT "FK_25b5837432a156888cf5e4eed05" FOREIGN KEY ("sat_id") REFERENCES "sat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sat" ADD CONSTRAINT "FK_233f266fca4dcaba3aa7136a5de" FOREIGN KEY ("representante_id") REFERENCES "usuario_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "avt" ADD CONSTRAINT "FK_7165b0e968faa4eb88d5ca99bf3" FOREIGN KEY ("sat_id") REFERENCES "sat"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "avt" ADD CONSTRAINT "FK_f409a2576202677a993c558f2a4" FOREIGN KEY ("media_id") REFERENCES "midia_attachment"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "avt" ADD CONSTRAINT "FK_423b39837a7632a869aebdd97f0" FOREIGN KEY ("usuario_id") REFERENCES "usuario_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT "FK_423b39837a7632a869aebdd97f0"`);
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT "FK_f409a2576202677a993c558f2a4"`);
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT "FK_7165b0e968faa4eb88d5ca99bf3"`);
        await queryRunner.query(`ALTER TABLE "sat" DROP CONSTRAINT "FK_233f266fca4dcaba3aa7136a5de"`);
        await queryRunner.query(`ALTER TABLE "midia_attachment" DROP CONSTRAINT "FK_25b5837432a156888cf5e4eed05"`);
        await queryRunner.query(`DROP TABLE "blacklisted_tokens"`);
        await queryRunner.query(`DROP TABLE "avt"`);
        await queryRunner.query(`DROP TYPE "public"."avt_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aabd0c20156d01f680deda1e4f"`);
        await queryRunner.query(`DROP TABLE "sat"`);
        await queryRunner.query(`DROP TYPE "public"."sat_destino_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sat_status_enum"`);
        await queryRunner.query(`DROP TABLE "midia_attachment"`);
        await queryRunner.query(`DROP TYPE "public"."midia_attachment_status_enum"`);
        await queryRunner.query(`DROP TABLE "usuario_entity"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_entity_tipo_enum"`);
    }

}
