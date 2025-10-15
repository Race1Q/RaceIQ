import { ApiProperty } from '@nestjs/swagger';

export class DriverSeasonProgressionDto {
  @ApiProperty({ description: 'Season year' })
  year: number;

  @ApiProperty({ description: 'Race round number (1, 2, 3, etc.)' })
  round: number;

  @ApiProperty({ description: 'Name of the Grand Prix' })
  race_name: string;

  @ApiProperty({ description: 'Driver ID' })
  driver_id: number;

  @ApiProperty({ description: 'Points scored in this specific race' })
  points: number;

  @ApiProperty({ description: 'Cumulative points after this race' })
  cumulative_points: number;
}
