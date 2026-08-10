import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOriginEnv = configService.get<string>('CORS_ORIGIN');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  let allowedOrigins: string | string[] | boolean;
  if (corsOriginEnv) {
    allowedOrigins = corsOriginEnv.includes(',')
      ? corsOriginEnv.split(',').map((origin) => origin.trim())
      : corsOriginEnv.trim();
  } else if (!isProduction) {
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006',
    ];
  } else {
    allowedOrigins = false;
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
void bootstrap();
