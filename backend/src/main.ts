// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Add this section for CORS
  const frontendURL = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://purple-sand-0300d7203.2.azurestaticapps.net' 
    ],
    credentials: true,
  });

  // Your port logic is correct
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
