import { ApiProperty } from '@nestjs/swagger';

export class AiStandingsAnalysisDto {
  @ApiProperty({ description: 'Overall season standings overview' })
  overview: string;

  @ApiProperty({ description: 'Key insights and highlights', type: [String] })
  keyInsights: string[];

  @ApiProperty({ description: 'Driver championship analysis' })
  driverAnalysis: {
    leader: string;
    biggestRiser: string;
    biggestFall: string;
    midfieldBattle: string;
  };

  @ApiProperty({ description: 'Constructor championship analysis' })
  constructorAnalysis: {
    leader: string;
    competition: string;
    surprises: string;
  };

  @ApiProperty({ description: 'Current trends and patterns', type: [String] })
  trends: string[];

  @ApiProperty({ description: 'Season predictions and outlook', type: [String] })
  predictions: string[];

  @ApiProperty({ description: 'Timestamp when the content was generated' })
  generatedAt: string;

  @ApiProperty({ description: 'Whether this is fallback data due to AI service unavailability' })
  isFallback: boolean;
}
