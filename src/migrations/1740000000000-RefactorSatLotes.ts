
import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorSatLotes1700000000000 implements MigrationInterface {
    name = 'RefactorSatLotes1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create sat_lote table
        await queryRunner.query(`CREATE TABLE "sat_lote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lote" varchar(255) NOT NULL, "validade" varchar(255) NOT NULL, "sat_id" uuid NOT NULL, CONSTRAINT "PK_sat_lote_id" PRIMARY KEY ("id"))`);

        // 2. Add foreign key
        await queryRunner.query(`ALTER TABLE "sat_lote" ADD CONSTRAINT "FK_sat_lote_sat" FOREIGN KEY ("sat_id") REFERENCES "sat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // 3. Migrate existing data (Best effort)
        // We need to move data from sat.lotes (simple-array) and sat.validade to sat_lote table
        // Since simple-array is comma separated string in DB usually.
        // BUT, TypeORM 'simple-array' is TEXT/VARCHAR. 

        // Let's iterate over SATs that have lotes
        const sats = await queryRunner.query(`SELECT id, lotes, validade FROM "sat" WHERE lotes IS NOT NULL AND lotes != ''`);

        for (const sat of sats) {
            const lotesArr = sat.lotes.split(','); // TypeORM simple-array default separator
            for (const lote of lotesArr) {
                if (lote.trim()) {
                    await queryRunner.query(`INSERT INTO "sat_lote" (id, lote, validade, sat_id) VALUES (uuid_generate_v4(), '${lote.trim()}', '${sat.validade}', '${sat.id}')`);
                }
            }
        }

        // 4. Drop old columns
        await queryRunner.query(`ALTER TABLE "sat" DROP COLUMN "lotes"`);
        await queryRunner.query(`ALTER TABLE "sat" DROP COLUMN "validade"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse is hard because we might merge multiple lotes back. 
        // For now, simpler down: add columns back, drop table. Data loss on DOWN is acceptable for this refactor in dev.
        await queryRunner.query(`ALTER TABLE "sat" ADD "validade" varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "sat" ADD "lotes" text NOT NULL DEFAULT ''`); // simple-array uses text usually or varchar

        // We could try to restore data taking the first lote/validade, but let's keep it simple for now.

        await queryRunner.query(`ALTER TABLE "sat_lote" DROP CONSTRAINT "FK_sat_lote_sat"`);
        await queryRunner.query(`DROP TABLE "sat_lote"`);
    }
}
