import { ApiProperty } from '@nestjs/swagger';

export class DriverStandingsResponseDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Driver full name', example: 'Lewis Hamilton' })
  full_name: string;

  @ApiProperty({ description: 'Driver number', example: 44, nullable: true })
  driver_number: number | null;

  @ApiProperty({ description: 'Country code', example: 'GB', nullable: true })
  country_code: string | null;

  @ApiProperty({ description: 'Team name', example: 'Mercedes' })
  team_name: string;

  @ApiProperty({ description: 'Position in championship', example: 3 })
  position: number;

  @ApiProperty({ description: 'Points in championship', example: 347 })
  points: number;

  @ApiProperty({ description: 'Number of wins', example: 8 })
  wins: number;

  // Legacy fields for backward compatibility
  @ApiProperty({ description: 'Driver ID (legacy)', example: 1, required: false })
  driver_id?: number;

  @ApiProperty({ description: 'Driver first name (legacy)', example: 'Lewis', required: false })
  first_name?: string;

  @ApiProperty({ description: 'Driver last name (legacy)', example: 'Hamilton', required: false })
  last_name?: string;

  @ApiProperty({ description: 'Constructor name (legacy)', example: 'Mercedes', required: false })
  constructor_name?: string;

  @ApiProperty({ description: 'Season year', example: 2024, required: false })
  season?: number;
}
