// backend/src/constructors/dto/constructor-stats-bulk.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ConstructorStatsDto {
  @ApiProperty({ description: 'Total points for the season' })
  points: number;

  @ApiProperty({ description: 'Number of wins' })
  wins: number;

  @ApiProperty({ description: 'Number of podiums' })
  podiums: number;

  @ApiProperty({ description: 'Championship position' })
  position: number;
}

export class ConstructorBulkItemDto {
  @ApiProperty({ description: 'Constructor ID' })
  constructorId: number;

  @ApiProperty({ description: 'Constructor name' })
  constructorName: string;

  @ApiProperty({ description: 'Constructor nationality' })
  nationality: string;

  @ApiProperty({ description: 'Whether the constructor is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Constructor statistics', type: ConstructorStatsDto })
  stats: ConstructorStatsDto;
}

export class ConstructorStatsBulkResponseDto {
  @ApiProperty({ description: 'Season year' })
  seasonYear: number;

  @ApiProperty({ description: 'List of constructors with their stats', type: [ConstructorBulkItemDto] })
  constructors: ConstructorBulkItemDto[];
}
