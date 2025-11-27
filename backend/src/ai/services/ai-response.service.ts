import { Injectable, Logger } from '@nestjs/common';
import { AiResponseRepository } from '../repositories/ai-response.repository';

@Injectable()
export class AiResponseService {
  private readonly logger = new Logger(AiResponseService.name);

  constructor(private readonly aiResponseRepository: AiResponseRepository) {}

  /**
   * Get the latest AI response for a specific context
   * This is the main method that AI services will use
   * @deprecated Use getLatestResponseIfValid() for expiration checking
   */
  async getLatestResponse<T>(
    responseType: string,
    entityType: string,
    entityId: number | string,
    season?: number,
    eventId?: number,
  ): Promise<T | null> {
    try {
      const response = await this.aiResponseRepository.findLatest(
        responseType,
        entityType,
        entityId,
        season,
        eventId,
      );

      if (response) {
        this.logger.debug(
          `Found latest ${responseType} response for ${entityType}:${entityId} (generated: ${response.generatedAt})`,
        );
        return response.responseData as T;
      }

      this.logger.debug(
        `No ${responseType} response found for ${entityType}:${entityId}`,
      );
      return null;
    } catch (error) {
      this.logger.error(
        `Error retrieving ${responseType} response for ${entityType}:${entityId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Get latest response if it exists and check if it's still valid (not expired)
   * @param responseType Type of response (e.g., 'news', 'bio', 'track_preview')
   * @param entityType Type of entity (e.g., 'driver', 'circuit', 'general')
   * @param entityId ID of the entity
   * @param ttlSeconds Time-to-live in seconds for this response type
   * @param season Optional season year
   * @param eventId Optional event ID
   * @returns Object with data and expiration status if found, null if not found
   */
  async getLatestResponseIfValid<T>(
    responseType: string,
    entityType: string,
    entityId: number | string,
    ttlSeconds: number,
    season?: number,
    eventId?: number,
  ): Promise<{ data: T; isExpired: boolean } | null> {
    try {
      const response = await this.aiResponseRepository.findLatest(
        responseType,
        entityType,
        entityId,
        season,
        eventId,
      );

      if (!response) {
        this.logger.debug(
          `No ${responseType} response found for ${entityType}:${entityId}`,
        );
        return null;
      }

      // If generatedAt is null, treat as expired
      if (!response.generatedAt) {
        this.logger.warn(
          `Response found but generatedAt is null for ${responseType} ${entityType}:${entityId}, treating as expired`,
        );
        return {
          data: response.responseData as T,
          isExpired: true,
        };
      }

      // Calculate age in seconds
      const generatedAtTime = new Date(response.generatedAt).getTime();
      const now = Date.now();
      const ageInSeconds = (now - generatedAtTime) / 1000;

      const isExpired = ageInSeconds >= ttlSeconds;

      if (isExpired) {
        this.logger.debug(
          `Cached ${responseType} response expired for ${entityType}:${entityId} (age: ${ageInSeconds.toFixed(0)}s, TTL: ${ttlSeconds}s)`,
        );
      } else {
        this.logger.debug(
          `Valid cached ${responseType} response found for ${entityType}:${entityId} (age: ${ageInSeconds.toFixed(0)}s, TTL: ${ttlSeconds}s)`,
        );
      }

      return {
        data: response.responseData as T,
        isExpired,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving ${responseType} response for ${entityType}:${entityId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Delete the latest response for a specific context
   * Used when replacing expired responses with new ones
   */
  async deleteLatestResponse(
    responseType: string,
    entityType: string,
    entityId: number | string,
    season?: number,
    eventId?: number,
  ): Promise<void> {
    try {
      const deleted = await this.aiResponseRepository.deleteLatest(
        responseType,
        entityType,
        entityId,
        season,
        eventId,
      );

      if (deleted) {
        this.logger.log(
          `Deleted old ${responseType} response for ${entityType}:${entityId}`,
        );
      } else {
        this.logger.debug(
          `No ${responseType} response found to delete for ${entityType}:${entityId}`,
        );
      }
    } catch (error) {
      // Log warning but don't fail the request
      this.logger.warn(
        `Error deleting old ${responseType} response for ${entityType}:${entityId}: ${error.message}`,
      );
    }
  }

  /**
   * Store a new AI response
   * This is used when generating new responses from Gemini
   */
  async storeResponse<T>(
    responseType: string,
    entityType: string,
    entityId: number | string,
    responseData: T,
    season?: number,
    eventId?: number,
    isFallback: boolean = false,
    aiAttribution?: string,
  ): Promise<void> {
    try {
      await this.aiResponseRepository.store(
        responseType,
        entityType,
        entityId,
        responseData,
        season,
        eventId,
        isFallback,
        aiAttribution,
      );

      this.logger.log(
        `Stored new ${responseType} response for ${entityType}:${entityId}${isFallback ? ' (fallback)' : ''}`,
      );
    } catch (error) {
      this.logger.error(
        `Error storing ${responseType} response for ${entityType}:${entityId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get response with fallback logic
   * This combines the latest response retrieval with fallback handling
   */
  async getResponseWithFallback<T>(
    responseType: string,
    entityType: string,
    entityId: number | string,
    fallbackGenerator: () => T,
    season?: number,
    eventId?: number,
  ): Promise<T> {
    // Try to get latest response
    const latestResponse = await this.getLatestResponse<T>(
      responseType,
      entityType,
      entityId,
      season,
      eventId,
    );

    if (latestResponse) {
      return latestResponse;
    }

    // No response found, generate fallback
    this.logger.warn(
      `No ${responseType} response found for ${entityType}:${entityId}, using fallback`,
    );
    return fallbackGenerator();
  }

  /**
   * Get all responses for an entity (for debugging/analytics)
   */
  async getEntityHistory(
    responseType: string,
    entityType: string,
    entityId: number | string,
    season?: number,
  ) {
    return this.aiResponseRepository.findByEntity(
      responseType,
      entityType,
      entityId,
      season,
    );
  }

  /**
   * Clean up old responses
   */
  async cleanupOldResponses(olderThanDays: number = 30): Promise<number> {
    try {
      const deletedCount = await this.aiResponseRepository.deleteOldResponses(
        olderThanDays,
      );
      this.logger.log(`Cleaned up ${deletedCount} old AI responses`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up old responses', error);
      return 0;
    }
  }

  /**
   * Get service statistics
   */
  async getStats() {
    return this.aiResponseRepository.getStats();
  }
}
