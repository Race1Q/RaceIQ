import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryTireStintDto {
  @ApiPropertyOptional({
    description: 'Filter by a specific session ID.',
    example: 6554,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  session_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by a specific driver ID.',
    example: 574,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  driver_id?: number;
}
