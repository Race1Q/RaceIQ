import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TireStint } from './tire-stints.entity';
import { TireStintsService } from './tire-stints.service';
import { TireStintsController } from './tire-stints.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TireStint]),
    forwardRef(() => SessionsModule),  // Circular via RacesModule
    forwardRef(() => DriversModule),   // Circular dependency
  ],
  providers: [TireStintsService],
  controllers: [TireStintsController],
  exports: [TireStintsService, TypeOrmModule], // ✅ Export TypeOrmModule
})
export class TireStintsModule {}


