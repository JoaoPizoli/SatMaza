import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionaContextoNaMidia1771281600000 implements MigrationInterface {
    name = 'AdicionaContextoNaMidia1771281600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Adicionar coluna context (IF NOT EXISTS — synchronize:true pode já ter criado)
        await queryRunner.query(
            `ALTER TABLE "midia_attachment" ADD COLUMN IF NOT EXISTS "context" varchar(20) NOT NULL DEFAULT 'sat_evidencia'`
        );

        // 2. Corrigir registros existentes: laudos que já estão vinculados a AVTs
        await queryRunner.query(
            `UPDATE "midia_attachment" SET "context" = 'avt_laudo' WHERE "id" IN (SELECT "media_id" FROM "avt" WHERE "media_id" IS NOT NULL)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "midia_attachment" DROP COLUMN "context"`
        );
    }
}
