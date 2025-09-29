import { ApiProperty } from '@nestjs/swagger';

export class RaceDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ required: false })
  season_id?: number;
  @ApiProperty({ required: false })
  circuit_id?: number;
  @ApiProperty()
  round: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false, type: String, description: 'Race date (YYYY-MM-DD)' })
  date?: Date | string;
  @ApiProperty({ required: false })
  time?: string;
}
