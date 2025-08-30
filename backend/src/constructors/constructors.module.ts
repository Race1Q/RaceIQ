import { Module } from '@nestjs/common';
import { ConstructorsController } from './constructors.controller';
import { ConstructorsService } from './constructors.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SupabaseModule, HttpModule],
  controllers: [ConstructorsController],
  providers: [ConstructorsService],
  exports: [ConstructorsService],
})
export class ConstructorsModule {}