import { ApiProperty } from '@nestjs/swagger';

export class NewsCitationDto {
  @ApiProperty({ description: 'Article title' })
  title: string;

  @ApiProperty({ description: 'Article URL' })
  url: string;

  @ApiProperty({ description: 'News source (e.g., BBC Sport, MotorSport.com)' })
  source: string;

  @ApiProperty({ description: 'Publication date', required: false })
  publishedAt?: string;
}

export class AiNewsDto {
  @ApiProperty({ description: '2-3 sentence summary of top F1 stories' })
  summary: string;

  @ApiProperty({ description: 'Top 3-5 news bullet points', type: [String] })
  bullets: string[];

  @ApiProperty({ description: 'News article citations with sources', type: [NewsCitationDto] })
  citations: NewsCitationDto[];

  @ApiProperty({ description: 'Timestamp when content was generated' })
  generatedAt: string;

  @ApiProperty({ description: 'Cache TTL in seconds' })
  ttlSeconds: number;

  @ApiProperty({ description: 'Whether this is fallback content', required: false })
  isFallback?: boolean;
}

