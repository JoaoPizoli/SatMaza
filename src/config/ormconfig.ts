import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { DataSource } from "typeorm";
import { config } from "dotenv";

// Carrega variáveis de ambiente do .env
config();

const ormConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: false,
    logging: false,
}

const AppDataSource = new DataSource(ormConfig)

export { AppDataSource }
export default ormConfig