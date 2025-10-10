import { ApiProperty } from '@nestjs/swagger';

export class DriverSeasonStatsDto {
  @ApiProperty({ description: 'Season year' })
  year: number;

  @ApiProperty({ description: 'Driver ID' })
  driver_id: number;

  @ApiProperty({ description: 'Total points scored in the season' })
  total_points: number;

  @ApiProperty({ description: 'Total wins in the season' })
  wins: number;

  @ApiProperty({ description: 'Total podium finishes in the season' })
  podiums: number;

  @ApiProperty({ description: 'Total pole positions from qualifying in the season' })
  poles: number;
}
