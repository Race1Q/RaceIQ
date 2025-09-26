import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceResult } from './race-results.entity';
import { RaceResultsController } from './race-results.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';
import { SupabaseModule } from '../supabase/supabase.module'; // ✅ import SupabaseModule
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceResult]),
    SessionsModule,
    DriversModule,
    ConstructorsModule,
    SupabaseModule, // ✅ add this so SupabaseService can be injected
  ],
  controllers: [RaceResultsController],
<<<<<<< HEAD
  providers: [RaceResultsService],
=======
  providers: [],
>>>>>>> main
  exports: [TypeOrmModule],
})
export class RaceResultsModule {}



