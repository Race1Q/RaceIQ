import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { AiResponseService } from './ai-response.service';
import { TrackDataAdapter } from '../adapters/track-data.adapter';
import { AiTrackPreviewDto } from '../dto/ai-preview.dto';
import { TRACK_SYSTEM_PROMPT, TRACK_USER_TEMPLATE } from '../prompts/track.prompt';

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);
  private readonly previewTTL: number;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly quotaService: QuotaService,
    private readonly cache: PersistentCacheService,
    private readonly aiResponseService: AiResponseService,
    private readonly trackDataAdapter: TrackDataAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 4380 hours (6 months)
    const ttlHours = this.config.get<number>('AI_TRACK_TTL_H') || 4380; // 6 months
    this.previewTTL = ttlHours * 3600; // Convert hours to seconds
  }

  /**
   * Get AI-generated track preview
   * @param slug Track slug identifier
   * @param eventId Optional event ID for event-specific preview
   */
  async getTrackPreview(slug: string, eventId?: number): Promise<AiTrackPreviewDto> {
    try {
      // First, get track data to extract circuit ID
      const trackData = await this.trackDataAdapter.getTrackData(slug, eventId);
      const circuitId = trackData.circuitId;

      // Check database for latest response first
      const latestResponse = await this.aiResponseService.getLatestResponse<AiTrackPreviewDto>(
        'track_preview',
        'circuit',
        circuitId || 0, // Use 0 as fallback if circuitId is undefined
        undefined,
        eventId,
      );

      if (latestResponse) {
        this.logger.log(`Returning latest database response for track preview: ${slug}${eventId ? `, event ${eventId}` : ''}`);
        return latestResponse;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackPreview(slug, eventId);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, using fallback');
        return this.getFallbackPreview(slug, eventId);
      }

      // Generate AI preview
      this.logger.log(`Generating AI preview for track ${slug}${eventId ? `, event ${eventId}` : ''}`);
      const userPrompt = TRACK_USER_TEMPLATE(trackData, eventId);

      interface GeminiPreviewResponse {
        intro: string;
        strategyNotes: string[];
        weatherAngle?: string;
        historyBlurb?: string;
      }

      const aiResponse = await this.geminiService.generateJSON<GeminiPreviewResponse>(
        TRACK_SYSTEM_PROMPT,
        userPrompt
      );

      // Track quota usage
      this.quotaService.increment();

      // Build response
      const response: AiTrackPreviewDto = {
        trackSlug: slug,
        eventId,
        intro: aiResponse.intro,
        strategyNotes: aiResponse.strategyNotes,
        weatherAngle: aiResponse.weatherAngle,
        historyBlurb: aiResponse.historyBlurb,
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };

      // Store the response in database
      await this.aiResponseService.storeResponse(
        'track_preview',
        'circuit',
        circuitId || 0, // Use 0 as fallback if circuitId is undefined
        response,
        undefined,
        eventId,
        false,
        'Powered by Gemini AI'
      );
      this.logger.log(`Successfully generated and stored preview for track ${slug}`);

      return response;
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating track preview: ${error.message}`, error.stack);

      // Final fallback
      return this.getFallbackPreview(slug, eventId);
    }
  }

  /**
   * Fallback preview when AI generation fails
   */
  private getFallbackPreview(slug: string, eventId?: number): AiTrackPreviewDto {
    return {
      trackSlug: slug,
      eventId,
      intro: 'AI-generated track preview is temporarily unavailable.',
      strategyNotes: [
        'Track preview is being generated',
        'Check back in a few moments for strategic insights',
        'View race results for historical performance data',
      ],
      weatherAngle: undefined,
      historyBlurb: undefined,
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }
}

