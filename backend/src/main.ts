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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('RaceIQ API')
    .setDescription('Formula 1 Racing Data API')
    .setVersion('1.0')
    .addTag('Driver Standings', 'Driver standings and championship data')
    .addTag('Drivers', 'Driver information and statistics')
    .addTag('Races', 'Race information and results')
    .addTag('Constructors', 'Constructor/team information')
    .addTag('Circuits', 'Circuit and track information')
    .addTag('Seasons', 'Season information and statistics')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // CORS configuration for production
  const frontendURL = configService.get<string>('FRONTEND_URL');
  const allowedOrigins = [
    'http://localhost:5173', // Development
    'https://purple-sand-0300d7203.2.azurestaticapps.net', // Current production
  ];
  
  // Add frontend URL from environment if provided
  if (frontendURL) {
    allowedOrigins.push(frontendURL);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Your port logic is correct
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
