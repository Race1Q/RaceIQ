import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TireStint } from './tire-stints.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TireStint]),
    SessionsModule,
    DriversModule,
  ],
  exports: [TypeOrmModule],
})
export class TireStintsModule {}


