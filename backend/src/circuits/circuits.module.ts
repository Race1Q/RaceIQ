// src/circuits/circuits.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CircuitsService } from './circuits.service';
import { CircuitsController } from './circuits.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [HttpModule],
  controllers: [CircuitsController],
  providers: [CircuitsService, SupabaseService],
  exports: [CircuitsService],
})
export class CircuitsModule {}