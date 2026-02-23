import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: AddCriticalIndexes
 *
 * Adiciona indexes de desempenho críticos para o funcionamento em produção.
 *
 * Motivação:
 * - blacklisted_tokens.token: consultado em TODA request autenticada (guard JWT).
 *   Sem index, faz full table scan a cada chamada à API.
 * - sat.representante_id: usado nos filtros por representante (tela "minhas SATs").
 * - sat.status: usado em todos os filtros de listagem por status.
 * - sat.destino: usado nos filtros por laboratório (BAGUA / BSOLVENTE).
 * - sat.createdAt: usado no ORDER BY createdAt DESC de todas as listagens.
 * - avt.sat_id: chave estrangeira do relacionamento OneToOne AVT → SAT.
 * - avt.usuario_id: chave estrangeira do responsável técnico.
 * - blacklisted_tokens.expiresAt: necessário para limpeza periódica de tokens expirados.
 */
export class AddCriticalIndexes1771530018297 implements MigrationInterface {
    name = 'AddCriticalIndexes1771530018297'

    // CREATE INDEX CONCURRENTLY não pode rodar dentro de transaction.
    // Com transaction = false o TypeORM não envolve esta migration em BEGIN/COMMIT.
    // Os IF NOT EXISTS garantem idempotência caso a migration seja reexecutada.
    transaction = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── blacklisted_tokens ─────────────────────────────────────────────────
        // Crítico: consultado em cada request para validar se o token foi revogado
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_blacklisted_tokens_token"
            ON "blacklisted_tokens" ("token")
        `);

        // Útil para job de limpeza de tokens expirados
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_blacklisted_tokens_expiresAt"
            ON "blacklisted_tokens" ("expiresAt")
        `);

        // ── sat ────────────────────────────────────────────────────────────────
        // Filtro de SATs por representante (tela "Minhas SATs")
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_sat_representante_id"
            ON "sat" ("representante_id")
        `);

        // Filtro por status (PENDENTE, EM_ANALISE, FINALIZADA, etc.)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_sat_status"
            ON "sat" ("status")
        `);

        // Filtro por laboratório de destino (BASE_AGUA / BASE_SOLVENTE)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_sat_destino"
            ON "sat" ("destino")
        `);

        // ORDER BY createdAt DESC em todas as listagens paginadas
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_sat_createdAt"
            ON "sat" ("createdAt" DESC)
        `);

        // ── avt ────────────────────────────────────────────────────────────────
        // Chave estrangeira OneToOne AVT → SAT (JoinColumn sat_id)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_avt_sat_id"
            ON "avt" ("sat_id")
        `);

        // Chave estrangeira ManyToOne AVT → Usuario (responsável técnico)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_avt_usuario_id"
            ON "avt" ("usuario_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blacklisted_tokens_token"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blacklisted_tokens_expiresAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_representante_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_destino"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sat_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_avt_sat_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_avt_usuario_id"`);
    }
}
