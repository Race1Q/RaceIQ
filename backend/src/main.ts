// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api');

  // Initialize Swagger
  const config = new DocumentBuilder()
    .setTitle('RaceIQ API')
    .setDescription('The RaceIQ backend API for Formula 1 data')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('drivers', 'Driver management endpoints')
    .addTag('constructors', 'Constructor management endpoints')
    .addTag('circuits', 'Circuit management endpoints')
    .addTag('races', 'Race management endpoints')
    .addTag('results', 'Race results endpoints')
    .addTag('standings', 'Championship standings endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Add this section for CORS
  const frontendURL = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://purple-sand-0300d7203.2.azurestaticapps.net' 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Your port logic is correct
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
