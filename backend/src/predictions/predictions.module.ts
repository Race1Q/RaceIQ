import { Module } from '@nestjs/common';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';

@Module({
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
