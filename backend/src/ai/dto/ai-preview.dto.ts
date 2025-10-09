import { ApiProperty } from '@nestjs/swagger';

export class AiTrackPreviewDto {
  @ApiProperty({ description: 'Track slug identifier' })
  trackSlug: string;

  @ApiProperty({ description: 'Event ID if specific event requested', required: false, nullable: true })
  eventId?: number;

  @ApiProperty({ description: '2-3 sentence introduction to the track' })
  intro: string;

  @ApiProperty({ description: 'Strategy notes including tyre management, overtaking zones', type: [String] })
  strategyNotes: string[];

  @ApiProperty({ description: 'Weather insights based on historical data', required: false })
  weatherAngle?: string;

  @ApiProperty({ description: 'Historical context and iconic moments at this circuit', required: false })
  historyBlurb?: string;

  @ApiProperty({ description: 'Timestamp when content was generated' })
  generatedAt: string;

  @ApiProperty({ description: 'Whether this is fallback content', required: false })
  isFallback?: boolean;
}

