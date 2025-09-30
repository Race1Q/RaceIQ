// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api');

  // Initialize Swagger (updated)
  const version = process.env.npm_package_version ?? '1.0.0';
  const config = new DocumentBuilder()
    .setTitle('RaceIQ API')
    .setDescription('Public and protected endpoints for race/driver data.')
    .setVersion(version)
    .addBearerAuth()
    // Explicit servers for prod + local (paths already include /api from global prefix)
    .addServer('https://raceiq-api.azurewebsites.net')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  // raw JSON
  app.getHttpAdapter().getInstance().get('/docs-json', (_req, res) => {
    res.json(document);
  });

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
