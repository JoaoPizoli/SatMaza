import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionaDataUsuario1771262397427 implements MigrationInterface {
    name = 'AdicionaDataUsuario1771262397427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sat" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sat" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "destino" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sat" ALTER COLUMN "destino" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sat" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sat" DROP COLUMN "createdAt"`);
    }

}
