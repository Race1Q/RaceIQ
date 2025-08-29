import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConstructorService } from './constructors.service';
import { Logger } from '@nestjs/common';

async function ingestConstructors() {
  const logger = new Logger('IngestConstructorsScript');
  
  try {
    logger.log('Starting constructors ingestion script');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const constructorService = app.get(ConstructorService);
    
    const result = await constructorService.ingestConstructors();
    
    logger.log(`Ingestion completed: ${result.created} created, ${result.updated} updated`);
    logger.log('Constructors ingestion script finished successfully');
    
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to ingest constructors', error);
    process.exit(1);
  }
}

ingestConstructors();

