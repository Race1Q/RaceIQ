import { ApiProperty } from '@nestjs/swagger';

export class DriverDto {
  @ApiProperty({ description: 'Unique identifier for the driver', example: 1 })
  id: number;

  @ApiProperty({ description: 'Driver number', example: 44, nullable: true })
  driver_number: number | null;

  @ApiProperty({ description: 'Driver first name', example: 'Lewis' })
  first_name: string;

  @ApiProperty({ description: 'Driver last name', example: 'Hamilton' })
  last_name: string;

  @ApiProperty({ description: 'Driver name acronym', example: 'HAM', nullable: true })
  name_acronym: string | null;

  @ApiProperty({ description: 'Country code', example: 'GB', nullable: true })
  country_code: string | null;

  @ApiProperty({ description: 'Date of birth', example: '1985-01-07' })
  date_of_birth: string;

  @ApiProperty({ description: 'Full driver name', example: 'Lewis Hamilton' })
  full_name: string;
}

export class DriverDetailDto extends DriverDto {
  @ApiProperty({ description: 'Current team name', example: 'Mercedes', nullable: true, required: false })
  team_name?: string | null;

  @ApiProperty({ description: 'Nationality', example: 'British', nullable: true, required: false })
  nationality?: string | null;

  @ApiProperty({ description: 'Car number', example: 44, nullable: true, required: false })
  car_number?: number | null;
}

export class DriverStatsDto {
  @ApiProperty({ description: 'Total career points', example: 4639.5 })
  total_points: number;

  @ApiProperty({ description: 'Total career wins', example: 103 })
  total_wins: number;

  @ApiProperty({ description: 'Total career podiums', example: 197 })
  total_podiums: number;

  @ApiProperty({ description: 'Total fastest laps', example: 64 })
  total_fastest_laps: number;

  @ApiProperty({ description: 'Total races participated', example: 332 })
  total_races: number;

  @ApiProperty({ description: 'Total pole positions', example: 104 })
  total_poles: number;

  @ApiProperty({ description: 'Current championship position', example: 3, nullable: true, required: false })
  current_position?: number | null;

  @ApiProperty({ description: 'Current season points', example: 234 })
  current_season_points: number;

  @ApiProperty({ description: 'Current season wins', example: 0 })
  current_season_wins: number;

  @ApiProperty({ description: 'Current season podiums', example: 6 })
  current_season_podiums: number;
}

export class DriverResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Driver data', type: DriverDto })
  data: DriverDto;
}

export class DriverDetailResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Driver detailed data', type: DriverDetailDto })
  data: DriverDetailDto;
}

export class DriverStatsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Driver statistics', type: DriverStatsDto })
  data: DriverStatsDto;
}

export class DriversListResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Array of drivers', type: [DriverDto] })
  data: DriverDto[];

  @ApiProperty({ description: 'Total count of drivers', example: 20 })
  total: number;
}
