import { ApiProperty } from '@nestjs/swagger';

export class AiConstructorInfoDto {
  @ApiProperty({ description: 'Constructor overview and introduction' })
  overview: string;

  @ApiProperty({ description: 'Historical background and team heritage' })
  history: string;

  @ApiProperty({ description: 'List of team strengths and competitive advantages', type: [String] })
  strengths: string[];

  @ApiProperty({ description: 'List of current challenges and areas for improvement', type: [String] })
  challenges: string[];

  @ApiProperty({ description: 'Notable achievements and milestones', type: [String] })
  notableAchievements: string[];

  @ApiProperty({ description: 'Current season performance analysis' })
  currentSeason: {
    performance: string;
    highlights: string[];
    outlook: string;
  };

  @ApiProperty({ description: 'Timestamp when the content was generated' })
  generatedAt: string;

  @ApiProperty({ description: 'Whether this is fallback data due to AI service unavailability' })
  isFallback: boolean;
}
