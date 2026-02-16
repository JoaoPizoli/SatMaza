import { MigrationInterface, QueryRunner } from "typeorm";

export class TransformaOCampoUsuarioEmString1771262824733 implements MigrationInterface {
    name = 'TransformaOCampoUsuarioEmString1771262824733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_entity" DROP CONSTRAINT "UQ_772bf338df28ac61f2d2573ac1f"`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" DROP COLUMN "usuario"`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" ADD "usuario" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" ADD CONSTRAINT "UQ_772bf338df28ac61f2d2573ac1f" UNIQUE ("usuario")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_entity" DROP CONSTRAINT "UQ_772bf338df28ac61f2d2573ac1f"`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" DROP COLUMN "usuario"`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" ADD "usuario" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" ADD CONSTRAINT "UQ_772bf338df28ac61f2d2573ac1f" UNIQUE ("usuario")`);
    }

}
