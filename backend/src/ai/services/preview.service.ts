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

      // 1. Check database for cached response with expiration check
      const cached = await this.aiResponseService.getLatestResponseIfValid<AiTrackPreviewDto>(
        'track_preview',
        'circuit',
        circuitId || 0, // Use 0 as fallback if circuitId is undefined
        this.previewTTL,
        undefined,
        eventId,
      );

      // 2. If found and valid, return cached response
      if (cached && !cached.isExpired) {
        this.logger.log(`Returning valid cached track preview for ${slug}${eventId ? `, event ${eventId}` : ''}`);
        return cached.data;
      }

      // 3. If found but expired, or not found - try to generate new response
      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('AI features disabled, returning expired cached track preview');
          return cached.data;
        }
        return this.getFallbackPreview(slug, eventId);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('Daily quota exceeded, returning expired cached track preview');
          return cached.data;
        }
        return this.getFallbackPreview(slug, eventId);
      }

      // 4. Try to generate new response
      try {
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

        // 5. If expired response existed, delete it before storing new one
        if (cached?.isExpired) {
          await this.aiResponseService.deleteLatestResponse(
            'track_preview',
            'circuit',
            circuitId || 0,
            undefined,
            eventId,
          );
        }

        // 6. Store the new response in database
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
      } catch (apiError) {
        // 7. API failed - return expired cached if available
        if (cached?.isExpired) {
          this.logger.warn(`API failed, returning expired cached track preview: ${apiError.message}`);
          return cached.data;
        }
        // 8. No cached response - return fallback
        this.logger.error(`No cached response and API failed: ${apiError.message}`);
        return this.getFallbackPreview(slug, eventId);
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating track preview: ${error.message}`, error.stack);

      // Final fallback
      return this.getFallbackPreview(slug, eventId);
    }
  }

  /**
   * Fallback preview when AI generation fails and no cached response available
   */
  private getFallbackPreview(slug: string, eventId?: number): AiTrackPreviewDto {
    return {
      trackSlug: slug,
      eventId,
      intro: 'Track preview data is currently unavailable. Please try again later.',
      strategyNotes: [
        'Data is being generated',
        'Please check back shortly',
      ],
      weatherAngle: undefined,
      historyBlurb: undefined,
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }
}

