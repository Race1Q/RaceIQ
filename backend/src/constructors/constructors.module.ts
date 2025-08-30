import { Module } from '@nestjs/common';
import { ConstructorController } from './constructors.controller';
import { ConstructorService } from './constructors.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SupabaseModule, HttpModule],
  controllers: [ConstructorController],
  providers: [ConstructorService],
  exports: [ConstructorService],
})
export class ConstructorsModule {}
