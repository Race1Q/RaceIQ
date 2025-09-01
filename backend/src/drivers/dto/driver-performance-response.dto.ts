import { ApiProperty } from '@nestjs/swagger';

export class DriverPerformanceResponseDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  driver_id: number;

  @ApiProperty({ description: 'Season year', example: '2024' })
  season: string;

  @ApiProperty({ description: 'Total races in season', example: 24 })
  races: number;

  @ApiProperty({ description: 'Wins in season', example: 0 })
  wins: number;

  @ApiProperty({ description: 'Podiums in season', example: 1 })
  podiums: number;

  @ApiProperty({ description: 'Points in season', example: 234 })
  points: number;

  @ApiProperty({ description: 'Position in championship', example: 3 })
  position: number;

  @ApiProperty({ description: 'Constructor name', example: 'Mercedes' })
  constructor_name: string;

  @ApiProperty({ description: 'Best finish position', example: 2 })
  best_finish: number;

  @ApiProperty({ description: 'Number of fastest laps', example: 1 })
  fastest_laps: number;

  @ApiProperty({ description: 'Number of pole positions', example: 1 })
  pole_positions: number;
}
