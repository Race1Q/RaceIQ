// src/circuits/circuits.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CircuitsService } from './circuits.service';
import { Circuit } from './circuits.entity';

@Controller('circuits')
export class CircuitsController {
  constructor(private readonly circuitsService: CircuitsService) {}

  @Get()
  async findAll(): Promise<Circuit[]> {
    return this.circuitsService.findAll();
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Circuit> {
    return this.circuitsService.findOne(id);
  }
}
