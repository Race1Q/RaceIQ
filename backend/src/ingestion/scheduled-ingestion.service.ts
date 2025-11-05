import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { IngestionService } from './ingestion.service';

@Injectable()
export class ScheduledIngestionService implements OnModuleInit {
  private readonly logger = new Logger(ScheduledIngestionService.name);

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Verify cron jobs are registered on module init
   */
  onModuleInit() {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    this.logger.log(`🔍 [CRON] Registered cron jobs: ${cronJobs.size}`);
    cronJobs.forEach((job, name) => {
      this.logger.log(`  - ${name}: registered`);
    });
    
    // Log next execution time for the weekly pipeline
    try {
      const weeklyJob = this.schedulerRegistry.getCronJob('weekly-current-year-pipeline');
      if (weeklyJob) {
        this.logger.log(`✅ [CRON] Weekly pipeline job registered successfully`);
        this.logger.log(`📅 [CRON] Schedule: Every Monday at 8:00 AM UTC`);
        this.logger.log(`📅 [CRON] Cron expression: 0 0 8 * * 1`);
        this.logger.log(`📅 [CRON] Next execution: Will run automatically when server is running at scheduled time`);
      } else {
        this.logger.warn(`⚠️ [CRON] Weekly pipeline job NOT found in registry`);
      }
    } catch (error) {
      this.logger.error(`❌ [CRON] Failed to verify weekly pipeline job: ${error.message}`);
    }
  }

  /**
   * Runs the current year pipeline every Monday at 8:00 AM UTC
   * Cron format: second minute hour day month dayOfWeek
   * 0 0 8 * * 1 = Every Monday at 8:00 AM UTC
   * 
   * CRITICAL: This requires:
   * 1. Server must be running at the scheduled time
   * 2. ScheduleModule.forRoot() must be imported in AppModule (✅ confirmed)
   * 3. This service must be registered as a provider in IngestionModule (✅ confirmed)
   * 
   * To verify cron is registered, check logs on app startup for:
   * "Nest application successfully started" - if cron jobs are registered, they appear in logs
   */
  @Cron('0 0 8 * * 1', {
    name: 'weekly-current-year-pipeline',
    timeZone: 'UTC',
  })
  async handleWeeklyPipeline() {
    const currentYear = new Date().getFullYear();
    const now = new Date();
    
    this.logger.log(`🚀 [CRON] Starting scheduled current year pipeline for year ${currentYear}`);
    this.logger.log(`🚀 [CRON] Current server time: ${now.toISOString()} (UTC: ${now.toUTCString()})`);
    
    try {
      const result = await this.ingestionService.ingestCurrentYearPipeline(currentYear);
      
      if (result.success) {
        this.logger.log(`✅ [CRON] Scheduled pipeline completed successfully for ${currentYear}`);
        this.logger.log(`✅ [CRON] Steps completed: ${result.steps.length}`);
        result.steps.forEach(step => {
          this.logger.log(`  - ${step.step}: ${step.status} (${step.duration}ms)`);
        });
      } else {
        this.logger.error(`❌ [CRON] Scheduled pipeline failed for ${currentYear}: ${result.message}`);
        this.logger.error(`❌ [CRON] Failed steps: ${result.steps.filter(s => s.status === 'error').length}`);
      }
    } catch (error) {
      this.logger.error(`❌ [CRON] Scheduled pipeline error for ${currentYear}:`, error.message);
      this.logger.error(`❌ [CRON] Stack trace:`, error.stack);
    }
  }

 // Manual trigger script for testing - should prove that the automated pipeline is working
  async triggerManualPipeline(year: number = new Date().getFullYear()) {
    this.logger.log(`🔧 Manual trigger: Running current year pipeline for ${year}`);
    return await this.ingestionService.ingestCurrentYearPipeline(year);
  }
}
