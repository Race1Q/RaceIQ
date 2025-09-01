import { ApiProperty } from '@nestjs/swagger';

export class DriverStandingsResponseDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  driver_id: number;

  @ApiProperty({ description: 'Driver first name', example: 'Lewis' })
  first_name: string;

  @ApiProperty({ description: 'Driver last name', example: 'Hamilton' })
  last_name: string;

  @ApiProperty({ description: 'Driver number', example: 44, nullable: true })
  driver_number: number | null;

  @ApiProperty({ description: 'Constructor name', example: 'Mercedes' })
  constructor_name: string;

  @ApiProperty({ description: 'Points in championship', example: 347 })
  points: number;

  @ApiProperty({ description: 'Position in championship', example: 3 })
  position: number;

  @ApiProperty({ description: 'Season year', example: 2024 })
  season: number;
}
