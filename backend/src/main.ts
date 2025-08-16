// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // --- ADD THIS DEBUG LINE ---
  console.log('>>> DATABASE_URL from env:', process.env.DATABASE_URL);

  const app = await NestFactory.create(AppModule);

  // Add this section for CORS
  const frontendURL = process.env.FRONTEND_URL;
  app.enableCors({
    origin: [frontendURL],
  });

  // Your port logic is correct
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();