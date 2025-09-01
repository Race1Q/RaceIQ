// src/races/dto/race-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RaceResponseDto {
  @ApiProperty({ example: 424, description: 'The unique ID of the race event' })
  id: number;

  @ApiProperty({ example: 46, description: 'The ID of the season' })
  season_id: number;

  @ApiProperty({ example: 294, description: 'The ID of the circuit' })
  circuit_id: number;

  @ApiProperty({ example: 1, description: 'The round number of the race in the season' })
  round: number;

  @ApiProperty({ example: 'Bahrain Grand Prix', description: 'The official name of the race' })
  name: string;

  @ApiProperty({ example: '2025-03-16', description: 'The date of the race in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ example: '15:00:00', description: 'The start time of the race' })
  time: string;
}
