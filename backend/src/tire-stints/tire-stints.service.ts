import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TireStint } from './tire-stints.entity';
import { QueryTireStintDto } from './dto/query-tire-stint.dto';

@Injectable()
export class TireStintsService {
  private readonly logger = new Logger(TireStintsService.name);

  constructor(
    @InjectRepository(TireStint)
    private tireStintRepository: Repository<TireStint>,
  ) {}

  /**
   * Finds all tire stints, optionally filtering by session_id or driver_id.
   * Includes driver relation for context.
   * @param query - The query parameters for filtering.
   * @returns A promise of an array of tire stints.
   */
  async findAll(query: QueryTireStintDto): Promise<TireStint[]> {
    const { session_id, driver_id } = query;
    
    // Build where conditions using direct column queries
    const whereConditions: any = {};
    if (session_id) {
      whereConditions.session_id = session_id;
    }
    if (driver_id) {
      whereConditions.driver_id = driver_id;
    }

    this.logger.log(`Finding tire stints with query: ${JSON.stringify(query)}`);
    
    return this.tireStintRepository.find({
      where: whereConditions,
      relations: ['driver'],
      order: {
        id: 'ASC',
      },
    });
  }
}
