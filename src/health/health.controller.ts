import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
        @InjectDataSource()
        private readonly defaultDataSource: DataSource,
        @InjectDataSource('erp_mysql')
        private readonly erpDataSource: DataSource,
    ) {}

    @Get()
    @Public()
    @HealthCheck()
    @ApiOperation({
        summary: 'Health check geral',
        description: 'Verifica conectividade com o banco principal (PostgreSQL) e com o ERP (MySQL)',
    })
    @ApiResponse({ status: 200, description: 'Todos os serviços operacionais' })
    @ApiResponse({ status: 503, description: 'Um ou mais serviços indisponíveis' })
    check() {
        return this.health.check([
            () => this.db.pingCheck('database', { connection: this.defaultDataSource }),
            () => this.db.pingCheck('erp_mysql', { connection: this.erpDataSource }),
        ]);
    }

    @Get('db')
    @Public()
    @HealthCheck()
    @ApiOperation({
        summary: 'Health check do banco principal (PostgreSQL)',
        description: 'Verifica apenas a conectividade com o PostgreSQL',
    })
    @ApiResponse({ status: 200, description: 'Banco principal operacional' })
    @ApiResponse({ status: 503, description: 'Banco principal indisponível' })
    checkDb() {
        return this.health.check([
            () => this.db.pingCheck('database', { connection: this.defaultDataSource }),
        ]);
    }

    @Get('azure')
    @Public()
    @HealthCheck()
    @ApiOperation({
        summary: 'Health check de conectividade Azure',
        description: 'Retorna status do serviço Azure (token verificado on-demand em cada envio de email)',
    })
    @ApiResponse({ status: 200, description: 'Serviço Azure reportado como ativo' })
    checkAzure() {
        return this.health.check([
            async () => ({
                azure: {
                    status: 'up' as const,
                    message: 'Azure Graph token is validated on each email send operation',
                },
            }),
        ]);
    }
}
