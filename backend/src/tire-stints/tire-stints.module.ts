import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TireStint } from './tire-stints.entity';
import { TireStintsService } from './tire-stints.service';
import { TireStintsController } from './tire-stints.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TireStint]),
    SessionsModule,
    DriversModule,
  ],
  providers: [TireStintsService],
  controllers: [TireStintsController],
  exports: [TireStintsService],
})
export class TireStintsModule {}


