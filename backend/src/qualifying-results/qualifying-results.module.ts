import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualifyingResult } from './qualifying-results.entity';
import { QualifyingResultsController } from './qualifying-results.controller';

@Module({
  imports: [
    // ✅ Only register OUR OWN entity
    TypeOrmModule.forFeature([QualifyingResult]),
  ],
  controllers: [QualifyingResultsController],
  providers: [],
  exports: [TypeOrmModule], // ✅ Export TypeOrmModule
})
export class QualifyingResultsModule {}


