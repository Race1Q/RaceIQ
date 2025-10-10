import { ApiProperty } from '@nestjs/swagger';

export class AiDriverFunFactsDto {
  @ApiProperty({ description: 'Driver ID' })
  driverId: number;

  @ApiProperty({
    description: 'Season year for season-specific facts',
    required: false,
    nullable: true,
  })
  season: number | null;

  @ApiProperty({ description: 'Fun facts title' })
  title: string;

  @ApiProperty({
    description: 'Array of 3-5 interesting fun facts about the driver',
    type: [String],
  })
  facts: string[];

  @ApiProperty({ description: 'Timestamp when content was generated' })
  generatedAt: string;

  @ApiProperty({ description: 'Whether this is fallback content', required: false })
  isFallback?: boolean;

  @ApiProperty({ description: 'AI attribution note', required: false })
  aiAttribution?: string;
}
