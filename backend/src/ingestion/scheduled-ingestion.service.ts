import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IngestionService } from './ingestion.service';

@Injectable()
export class ScheduledIngestionService {
  private readonly logger = new Logger(ScheduledIngestionService.name);

  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Runs the current year pipeline every Monday at 8:00 AM
   * Cron format: second minute hour day month dayOfWeek
   * 0 0 8 * * 1 = Every Monday at 8:00 AM
   */
  @Cron('0 0 8 * * 1', {
    name: 'weekly-current-year-pipeline',
    timeZone: 'UTC', // Adjust timezone as needed
  })
  async handleWeeklyPipeline() {
    const currentYear = new Date().getFullYear();

    this.logger.log(`🚀 Starting scheduled incremental ingestion for year ${currentYear}`);

    try {
      // Incremental, not ingestCurrentYearPipeline. The full pipeline deletes every
      // session in the season before rebuilding, and results/qualifying/stints/events
      // cascade off sessions — so a week where OpenF1 is slow or rate-limits would
      // leave the season gutted until someone noticed. This only touches rounds that
      // have run but have no results yet, and is a no-op when nothing is missing.
      const result = await this.ingestionService.ingestMissingRounds(currentYear);

      if (result.success) {
        this.logger.log(`✅ Scheduled pipeline completed successfully for ${currentYear}`);
        this.logger.log(`Steps completed: ${result.steps.length}`);
        result.steps.forEach(step => {
          this.logger.log(`  - ${step.step}: ${step.status} (${step.duration}ms)`);
        });
      } else {
        this.logger.error(`❌ Scheduled pipeline failed for ${currentYear}: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`❌ Scheduled pipeline error for ${currentYear}:`, error.message);
    }
  }

 // Manual trigger script for testing - should prove that the automated pipeline is working
 // Must call whatever handleWeeklyPipeline calls, or it proves nothing.
  async triggerManualPipeline(year: number = new Date().getFullYear()) {
    this.logger.log(`🔧 Manual trigger: Running incremental ingestion for ${year}`);
    return await this.ingestionService.ingestMissingRounds(year);
  }
}
