// src/circuits/circuits.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiNotFoundResponse, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CircuitsService } from './circuits.service';
import { Circuit } from './circuits.entity';
import { ApiErrorDto } from '../common/dto/api-error.dto';

@ApiTags('Circuits')
@Controller('circuits')
export class CircuitsController {
  constructor(private readonly circuitsService: CircuitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all circuits', description: 'Returns a complete list of all Formula 1 circuits with their descriptions, locations, and track information.' })
  @ApiOkResponse({ type: [Circuit], description: 'List of all circuits' })
  async findAll(): Promise<Circuit[]> {
    return this.circuitsService.findAll();
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The circuit with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Circuit> {
    return this.circuitsService.findOne(id);
  }
}
