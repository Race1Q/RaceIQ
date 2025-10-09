import { ApiProperty } from '@nestjs/swagger';

export class AiDriverBioDto {
  @ApiProperty({ description: 'Driver ID' })
  driverId: number;

  @ApiProperty({ description: 'Season year for season-specific bio', required: false, nullable: true })
  season: number | null;

  @ApiProperty({ description: 'Bio title (e.g., "Lewis Hamilton – 7× World Champion")' })
  title: string;

  @ApiProperty({ description: '1-sentence teaser/hook' })
  teaser: string;

  @ApiProperty({ description: '2-3 narrative paragraphs about the driver', type: [String] })
  paragraphs: string[];

  @ApiProperty({ description: 'Bullet points of key achievements and highlights', type: [String] })
  highlights: string[];

  @ApiProperty({ description: 'Timestamp when content was generated' })
  generatedAt: string;

  @ApiProperty({ description: 'Whether this is fallback content', required: false })
  isFallback?: boolean;
}

