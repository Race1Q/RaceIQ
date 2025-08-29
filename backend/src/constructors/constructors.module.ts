// backend/src/constructors/constructors.module.ts

import { Module } from '@nestjs/common';
import { ConstructorsService } from './constructors.service';
import { ConstructorsController } from './constructors.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule], // Makes SupabaseService available for injection
  controllers: [ConstructorsController],
  providers: [ConstructorsService],
})
export class ConstructorsModule {}