import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { ApiErrorDto } from '../common/dto/api-error.dto';
import { TireStintsService } from './tire-stints.service';
import { QueryTireStintDto } from './dto/query-tire-stint.dto';
import { TireStint } from './tire-stints.entity';

@ApiTags('Tire Stints')
@Controller('tire-stints')
export class TireStintsController {
  constructor(private readonly tireStintsService: TireStintsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all tire stints',
    description:
      'Fetches a list of all tire stints, optionally filtering by session_id and/or driver_id.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of tire stints.',
    type: [TireStint],
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ApiErrorDto,
  })
  findAll(
    @Query(new ValidationPipe({ transform: true, forbidNonWhitelisted: true }))
    query: QueryTireStintDto,
  ) {
    return this.tireStintsService.findAll(query);
  }
}
