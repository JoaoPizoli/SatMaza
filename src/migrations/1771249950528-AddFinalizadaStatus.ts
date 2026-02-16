import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFinalizadaStatus1771249950528 implements MigrationInterface {
    name = 'AddFinalizadaStatus1771249950528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."usuario_entity_tipo_enum" RENAME TO "usuario_entity_tipo_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_entity_tipo_enum" AS ENUM('ADMIN', 'ORQUESTRADOR', 'BAGUA', 'BSOLVENTE', 'REPRESENTANTE')`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" ALTER COLUMN "tipo" TYPE "public"."usuario_entity_tipo_enum" USING "tipo"::"text"::"public"."usuario_entity_tipo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_entity_tipo_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."sat_status_enum" RENAME TO "sat_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sat_status_enum" AS ENUM('PENDENTE', 'ENVIADO_BAGUA', 'ENVIADO_BSOLVENTE', 'FINALIZADA')`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "status" TYPE "public"."sat_status_enum" USING "status"::"text"::"public"."sat_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "status" SET DEFAULT 'PENDENTE'`);
        await queryRunner.query(`DROP TYPE "public"."sat_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."avt_status_enum" RENAME TO "avt_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."avt_status_enum" AS ENUM('PENDENTE', 'CONCLUIDO', 'EM_ANALISE')`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "status" TYPE "public"."avt_status_enum" USING "status"::"text"::"public"."avt_status_enum"`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "status" SET DEFAULT 'PENDENTE'`);
        await queryRunner.query(`DROP TYPE "public"."avt_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."avt_status_enum_old" AS ENUM('PENDENTE', 'CONCLUIDO')`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "status" TYPE "public"."avt_status_enum_old" USING "status"::"text"::"public"."avt_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "status" SET DEFAULT 'PENDENTE'`);
        await queryRunner.query(`DROP TYPE "public"."avt_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."avt_status_enum_old" RENAME TO "avt_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."sat_status_enum_old" AS ENUM('PENDENTE', 'ENVIADO_BAGUA', 'ENVIADO_BSOLVENTE')`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "status" TYPE "public"."sat_status_enum_old" USING "status"::"text"::"public"."sat_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "status" SET DEFAULT 'PENDENTE'`);
        await queryRunner.query(`DROP TYPE "public"."sat_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sat_status_enum_old" RENAME TO "sat_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_entity_tipo_enum_old" AS ENUM('ADMIN', 'BAGUA', 'BSOLVENTE', 'REPRESENTANTE')`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" ALTER COLUMN "tipo" TYPE "public"."usuario_entity_tipo_enum_old" USING "tipo"::"text"::"public"."usuario_entity_tipo_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_entity_tipo_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."usuario_entity_tipo_enum_old" RENAME TO "usuario_entity_tipo_enum"`);
    }

}
