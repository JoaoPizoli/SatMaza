import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Verifica se a API está online' })
  @ApiResponse({ status: 200, description: 'API online', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
