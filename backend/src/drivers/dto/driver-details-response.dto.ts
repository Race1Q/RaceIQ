import { ApiProperty } from '@nestjs/swagger';

export class DriverDetailsResponseDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  driver_id: number;

  @ApiProperty({ description: 'Driver first name', example: 'Lewis' })
  first_name: string;

  @ApiProperty({ description: 'Driver last name', example: 'Hamilton' })
  last_name: string;

  @ApiProperty({ description: 'Driver number', example: 44, nullable: true })
  driver_number: number | null;

  @ApiProperty({ description: 'Country name', example: 'Great Britain' })
  country_name: string;

  @ApiProperty({ description: 'Date of birth', example: '1985-01-07' })
  date_of_birth: string;

  @ApiProperty({ description: 'Total races participated', example: 332 })
  total_races: number;

  @ApiProperty({ description: 'Total wins', example: 103 })
  total_wins: number;

  @ApiProperty({ description: 'Total podiums', example: 197 })
  total_podiums: number;

  @ApiProperty({ description: 'Total points', example: 4639.5 })
  total_points: number;

  @ApiProperty({ description: 'World championships won', example: 7 })
  world_championships: number;

  @ApiProperty({ description: 'Current constructor', example: 'Mercedes' })
  current_constructor: string;
}
