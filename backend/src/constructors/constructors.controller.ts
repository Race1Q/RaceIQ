// backend/src/constructors/constructors.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConstructorsService } from './constructors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('constructors')
@UseGuards(JwtAuthGuard) // This protects the endpoint, requiring a valid token
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Get()
  findAll() {
    return this.constructorsService.findAll();
  }
}