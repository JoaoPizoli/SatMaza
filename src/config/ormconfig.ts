import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Em produção o Docker injeta as vars via env_file, mas carregamos
// .env.production como fallback para quando rodamos fora do compose
// (ex: migration:run local). dotenv não sobrescreve vars já definidas.
dotenv.config({ path: '.env.production' });
dotenv.config(); // fallback para .env em desenvolvimento local

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
