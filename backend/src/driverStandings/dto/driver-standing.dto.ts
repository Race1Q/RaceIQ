import { ApiProperty } from '@nestjs/swagger';

export class DriverStandingDto {
  @ApiProperty({ description: 'Unique identifier for the driver standing record', example: 1 })
  id?: number;

  @ApiProperty({ description: 'Race ID', example: 1 })
  race_id: number;

  @ApiProperty({ description: 'Driver ID', example: 1 })
  driver_id: number;

  @ApiProperty({ description: 'Points earned by the driver', example: 25 })
  points: number;

  @ApiProperty({ description: 'Position in the standings', example: 1 })
  position: number;

  @ApiProperty({ description: 'Season year', example: 2023 })
  season: number;

  @ApiProperty({ description: 'Number of wins', example: 1 })
  wins: number;
}

export class DriverStandingResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Array of driver standings', type: [DriverStandingDto] })
  data: DriverStandingDto[];

  @ApiProperty({ description: 'Total count of records', example: 100 })
  total?: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page?: number;

  @ApiProperty({ description: 'Records per page', example: 10 })
  limit?: number;
}

export class ConnectionTestResponseDto {
  @ApiProperty({ description: 'Connection test result', example: true })
  success: boolean;

  @ApiProperty({ description: 'Timestamp of the test', example: '2024-01-15T10:30:00.000Z' })
  timestamp: string;
}
