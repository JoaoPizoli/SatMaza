import { MigrationInterface, QueryRunner } from "typeorm";

export class CriaRepreAtendenteEntity1771610000000 implements MigrationInterface {
    name = 'CriaRepreAtendenteEntity1771610000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "repre_atendente_entity" (
                "id" SERIAL NOT NULL,
                "usuarios" TEXT[] NOT NULL,
                "nome_representante_comercial" character varying NOT NULL,
                "email_representante_comercial" character varying NOT NULL,
                CONSTRAINT "PK_repre_atendente_entity" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "repre_atendente_entity"`);
    }
}
