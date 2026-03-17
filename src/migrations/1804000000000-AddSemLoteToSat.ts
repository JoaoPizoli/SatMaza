import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSemLoteToSat1804000000000 implements MigrationInterface {
    name = 'AddSemLoteToSat1804000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sat" ADD "sem_lote" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sat" DROP COLUMN "sem_lote"`);
    }
}
