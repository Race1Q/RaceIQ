import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DriversService } from './drivers.service';
import { IngestService } from './ingest.service';
import { PublicController } from './public.controller';

@Module({
  providers: [DriversService, IngestService],
  controllers: [AdminController, PublicController],
  exports: [IngestService, DriversService],
})
export class DriversModule {}
