import { ApiProperty } from '@nestjs/swagger';

export class PredictionFeaturesDto {
  @ApiProperty({ example: 1 })
  driver_standings_position_before_race: number;

  @ApiProperty({ example: 350 })
  driver_points_before_race: number;

  @ApiProperty({ example: 1 })
  constructor_standings_position_before_race: number;

  @ApiProperty({ example: 500 })
  constructor_points_before_race: number;

  @ApiProperty({ example: 27.5 })
  driver_age: number;

  @ApiProperty({ example: 22.8 })
  avg_points_last_5_races: number;

  @ApiProperty({ example: 4.5, description: "Driver's average finish position at this specific circuit" })
  avg_finish_pos_at_circuit: number;

  @ApiProperty({ example: 18.5, description: "Average constructor points in the last 5 races" })
  avg_constructor_points_last_5_races: number;
}

export class DriverPredictionRequestDto {
  @ApiProperty({ example: 'VER' })
  driverId: string;

  @ApiProperty({ type: PredictionFeaturesDto })
  features: PredictionFeaturesDto;
}

export class PredictRequestDto {
  @ApiProperty({ type: [DriverPredictionRequestDto] })
  drivers: DriverPredictionRequestDto[];
}