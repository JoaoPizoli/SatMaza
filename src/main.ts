import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const isProduction = process.env.NODE_ENV === 'production';
  const rawOrigins = process.env.ALLOWED_ORIGINS;

  if (isProduction && !rawOrigins) {
    logger.error('ALLOWED_ORIGINS é obrigatório em produção. Defina no .env.');
    process.exit(1);
  }

  const allowedOrigins = rawOrigins
    ? rawOrigins.split(',').map(o => o.trim())
    : null; // null = permite tudo (apenas desenvolvimento)

  app.enableCors({
    origin: allowedOrigins ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalFilters(new HttpExceptionFilter());

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('SatMaza API')
      .setDescription('API do sistema SatMaza - Gestão de SATs, AVTs, Mídias e Usuários')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Insira o token JWT',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ?? 3040;
  await app.listen(port);
  logger.log(`SatMaza API iniciada na porta ${port}`);
}
bootstrap();
