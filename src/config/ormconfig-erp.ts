import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const erpOrmConfig: TypeOrmModuleOptions = {
    name: 'erp_mysql',
    type: 'mysql',
    host: process.env.ERP_HOST,
    port: Number(process.env.ERP_PORT),
    username: process.env.ERP_USER,
    password: process.env.ERP_PASS,
    database: process.env.ERP_DB,
    synchronize: false,
};

export default erpOrmConfig;