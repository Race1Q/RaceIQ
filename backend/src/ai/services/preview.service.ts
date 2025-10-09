import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
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
    private readonly trackDataAdapter: TrackDataAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 24 hours
    const ttlHours = this.config.get<number>('AI_TRACK_TTL_H') || 24;
    this.previewTTL = ttlHours * 3600; // Convert hours to seconds
  }

  /**
   * Get AI-generated track preview
   * @param slug Track slug identifier
   * @param eventId Optional event ID for event-specific preview
   */
  async getTrackPreview(slug: string, eventId?: number): Promise<AiTrackPreviewDto> {
    const cacheKey = `preview:${slug}:${eventId || 'general'}`;

    try {
      // Check cache first
      const cached = this.cache.get<AiTrackPreviewDto>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached preview for track ${slug}${eventId ? `, event ${eventId}` : ''}`);
        return cached;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackPreview(slug, eventId);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, trying stale cache or fallback');
        const stale = this.cache.get<AiTrackPreviewDto>(cacheKey, true);
        if (stale) {
          return { ...stale, isFallback: true };
        }
        return this.getFallbackPreview(slug, eventId);
      }

      // Fetch track data
      this.logger.log(`Fetching track data for preview generation: ${slug}`);
      const trackData = await this.trackDataAdapter.getTrackData(slug, eventId);

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

      // Cache the response
      await this.cache.set(cacheKey, response, this.previewTTL);
      this.logger.log(`Successfully generated and cached preview for track ${slug}`);

      return response;
    } catch (error) {
      this.logger.error(`Error generating track preview: ${error.message}`, error.stack);

      // Try to return stale cache on error
      const stale = this.cache.get<AiTrackPreviewDto>(cacheKey, true);
      if (stale) {
        this.logger.log('Returning stale cache due to error');
        return { ...stale, isFallback: true };
      }

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

