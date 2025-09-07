import { ApiProperty } from '@nestjs/swagger';

export class FeaturedDriverResponseDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  driverId: number;

  @ApiProperty({ description: 'Driver full name', example: 'Lewis Hamilton' })
  fullName: string;

  @ApiProperty({ description: 'Team name', example: 'Mercedes' })
  teamName: string;

  @ApiProperty({ description: 'Driver number', example: 44, nullable: true })
  driverNumber: number | null;

  @ApiProperty({ description: 'Country code', example: 'GB', nullable: true })
  countryCode: string | null;

  @ApiProperty({ description: 'Headshot URL', example: 'https://example.com/headshot.png' })
  headshotUrl: string;

  @ApiProperty({ description: 'Championship points', example: 347 })
  points: number;

  @ApiProperty({ description: 'Number of wins', example: 8 })
  wins: number;

  @ApiProperty({ description: 'Number of podiums', example: 15 })
  podiums: number;
}
