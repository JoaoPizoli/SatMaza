import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { DataSource } from "typeorm";

const config: PostgresConnectionOptions = {
    type: 'postgres',
    host: '',
    port: 5432,
    username: 'postgres',
    password: '',
    database: '',
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../migrations/**/*.ts'],
}

const AppDataSource = new DataSource(config)

export { AppDataSource }
export default config