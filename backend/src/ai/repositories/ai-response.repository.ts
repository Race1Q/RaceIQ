import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiResponse } from '../entities/ai-response.entity';

@Injectable()
export class AiResponseRepository {
  constructor(
    @InjectRepository(AiResponse)
    private readonly repository: Repository<AiResponse>,
  ) {}

  /**
   * Get the latest AI response for a specific context
   */
  async findLatest(
    responseType: string,
    entityType: string,
    entityId: number | string,
    season?: number,
    eventId?: number,
  ): Promise<AiResponse | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('response')
      .where('response.responseType = :responseType', { responseType })
      .andWhere('response.entityType = :entityType', { entityType })
      .andWhere('response.entityId = :entityId', { entityId: typeof entityId === 'string' ? parseInt(entityId) : entityId });

    if (season !== undefined) {
      queryBuilder.andWhere('response.season = :season', { season });
    } else {
      queryBuilder.andWhere('response.season IS NULL');
    }

    if (eventId !== undefined) {
      queryBuilder.andWhere('response.eventId = :eventId', { eventId });
    } else {
      queryBuilder.andWhere('response.eventId IS NULL');
    }

    return queryBuilder
      .orderBy('response.generatedAt', 'DESC')
      .getOne();
  }

  /**
   * Store a new AI response
   */
  async store(
    responseType: string,
    entityType: string,
    entityId: number | string,
    responseData: any,
    season?: number,
    eventId?: number,
    isFallback: boolean = false,
    aiAttribution?: string,
  ): Promise<AiResponse> {
    const response = this.repository.create({
      responseType,
      entityType,
      entityId: typeof entityId === 'string' ? parseInt(entityId) : entityId,
      season: season || null,
      eventId: eventId || null,
      responseData,
      generatedAt: new Date(),
      isFallback,
      aiAttribution: aiAttribution || 'Powered by Gemini AI',
    });

    return this.repository.save(response);
  }

  /**
   * Get all responses for a specific entity (for analytics/debugging)
   */
  async findByEntity(
    responseType: string,
    entityType: string,
    entityId: number | string,
    season?: number,
  ): Promise<AiResponse[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('response')
      .where('response.responseType = :responseType', { responseType })
      .andWhere('response.entityType = :entityType', { entityType })
      .andWhere('response.entityId = :entityId', { entityId: typeof entityId === 'string' ? parseInt(entityId) : entityId });

    if (season !== undefined) {
      queryBuilder.andWhere('response.season = :season', { season });
    } else {
      queryBuilder.andWhere('response.season IS NULL');
    }

    return queryBuilder
      .orderBy('response.generatedAt', 'DESC')
      .getMany();
  }

  /**
   * Delete the latest response for a specific context
   */
  async deleteLatest(
    responseType: string,
    entityType: string,
    entityId: number | string,
    season?: number,
    eventId?: number,
  ): Promise<boolean> {
    const latest = await this.findLatest(
      responseType,
      entityType,
      entityId,
      season,
      eventId,
    );

    if (!latest) {
      return false;
    }

    await this.repository.remove(latest);
    return true;
  }

  /**
   * Delete old responses (for cleanup)
   */
  async deleteOldResponses(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Get response statistics
   */
  async getStats(): Promise<{
    totalResponses: number;
    responsesByType: Record<string, number>;
    oldestResponse: Date | null;
    newestResponse: Date | null;
  }> {
    const totalResponses = await this.repository.count();

    const responsesByType = await this.repository
      .createQueryBuilder('response')
      .select('response.responseType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('response.responseType')
      .getRawMany();

    const oldestResponse = await this.repository
      .createQueryBuilder('response')
      .select('MIN(response.createdAt)', 'oldest')
      .getRawOne();

    const newestResponse = await this.repository
      .createQueryBuilder('response')
      .select('MAX(response.createdAt)', 'newest')
      .getRawOne();

    return {
      totalResponses,
      responsesByType: responsesByType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>),
      oldestResponse: oldestResponse?.oldest || null,
      newestResponse: newestResponse?.newest || null,
    };
  }
}
