import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNomeAndPasswordChangedToUsuario1771603000000 implements MigrationInterface {
    name = 'AddNomeAndPasswordChangedToUsuario1771603000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Coluna nome — armazena o nome completo do usuário
        await queryRunner.query(`
            ALTER TABLE "usuario_entity"
            ADD COLUMN "nome" character varying NULL
        `);

        // Coluna password_changed — indica se o usuário já alterou a senha padrão
        await queryRunner.query(`
            ALTER TABLE "usuario_entity"
            ADD COLUMN "password_changed" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_entity" DROP COLUMN "password_changed"`);
        await queryRunner.query(`ALTER TABLE "usuario_entity" DROP COLUMN "nome"`);
    }
}
