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

 // Robust CORS configuration
 const allowedOriginsFromEnv = (configService.get<string>('ALLOWED_ORIGINS') ?? '')
   .split(',')
   .map((s) => s.trim())
   .filter(Boolean);

 app.enableCors({
   origin: (origin, callback) => {
     if (!origin) return callback(null, true);
     let hostname: string;
     try {
       hostname = new URL(origin).hostname;
     } catch {
       return callback(new Error('Invalid Origin'), false);
     }
     const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
     const isAzureStaticApps = /\.azurestaticapps\.net$/.test(hostname);

     // You can add your custom domain here in the future
     // const isRaceIQDomain = /(^|\.)raceiq\.app$/i.test(hostname);

     const isListed = allowedOriginsFromEnv.includes(origin);

     const allowed = isListed || isLocalhost || isAzureStaticApps;
     return callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
   },
   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
   credentials: true,
 });

  // Your port logic is correct
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
