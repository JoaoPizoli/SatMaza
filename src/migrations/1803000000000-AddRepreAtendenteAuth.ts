import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRepreAtendenteAuth1803000000000 implements MigrationInterface {
    name = 'AddRepreAtendenteAuth1803000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "repre_atendente_entity" ADD "senha" varchar`);
        await queryRunner.query(`ALTER TABLE "repre_atendente_entity" ADD "password_changed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "entity_type" varchar NOT NULL DEFAULT 'usuario'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "entity_type"`);
        await queryRunner.query(`ALTER TABLE "repre_atendente_entity" DROP COLUMN "password_changed"`);
        await queryRunner.query(`ALTER TABLE "repre_atendente_entity" DROP COLUMN "senha"`);
    }
}
