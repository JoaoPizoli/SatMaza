import { MigrationInterface, QueryRunner } from "typeorm";

export class TornaMediaIdNaoObrigatorioPorHora1771274207315 implements MigrationInterface {
    name = 'TornaMediaIdNaoObrigatorioPorHora1771274207315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT "FK_f409a2576202677a993c558f2a4"`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "media_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "avt" ADD CONSTRAINT "FK_f409a2576202677a993c558f2a4" FOREIGN KEY ("media_id") REFERENCES "midia_attachment"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avt" DROP CONSTRAINT "FK_f409a2576202677a993c558f2a4"`);
        await queryRunner.query(`ALTER TABLE "avt" ALTER COLUMN "media_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "avt" ADD CONSTRAINT "FK_f409a2576202677a993c558f2a4" FOREIGN KEY ("media_id") REFERENCES "midia_attachment"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
