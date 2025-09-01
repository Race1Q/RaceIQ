import { ApiProperty } from '@nestjs/swagger';

export class DriverResponseDto {
  @ApiProperty({ description: 'Unique identifier for the driver', example: 1 })
  id: number;

  @ApiProperty({ description: 'Driver number on the car', example: 44, nullable: true })
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

  @ApiProperty({ description: 'Computed full name', example: 'Lewis Hamilton' })
  full_name?: string;
}
