import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';   // <-- Import DriversService
import { IngestService } from './ingest.service';     // <-- Import IngestService

@Module({
  controllers: [DriversController],
  providers: [DriversService, IngestService],
  exports: [DriversService],
})
export class DriversModule {}