// backend/src/ingestion/ingestion.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ErgastService } from './ergast.service';
import { OpenF1Service } from './openf1.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly ergastService: ErgastService,
    private readonly openf1Service: OpenF1Service,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Refresh all materialized views
   * Should be called after any data ingestion that affects view data
   */
  async refreshMaterializedViews(): Promise<void> {
    this.logger.log('🔄 Starting materialized view refresh...');
    
    const views = [
      'driver_standings_materialized',
      'driver_career_stats_materialized',
      'race_fastest_laps_materialized',
      'constructor_standings_materialized',
      'driver_season_stats_materialized',
    ];

    for (const view of views) {
      try {
        const startTime = Date.now();
        await this.dataSource.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);
        const duration = Date.now() - startTime;
        this.logger.log(`✅ Refreshed ${view} (${duration}ms)`);
      } catch (error) {
        this.logger.error(`❌ Failed to refresh ${view}:`, error.message);
        // Continue with other views even if one fails
      }
    }

    this.logger.log(`✨ Successfully refreshed ${views.length} materialized views!`);
  }

  /**
   * Run the complete current year data ingestion pipeline
   * This is what you'll use going forward for ongoing season updates
   */
  async ingestCurrentYearPipeline(year: number = new Date().getFullYear()): Promise<{ 
    success: boolean; 
    message: string;
    steps: { step: string; status: string; duration: number }[];
  }> {
    this.logger.log(`🚀 Starting Current Year Pipeline Ingestion for year ${year}...`);
    const steps: { step: string; status: string; duration: number }[] = [];
    
    try {
      // Step 1: OpenF1 Sessions & Weather
      let startTime = Date.now();
      this.logger.log('📡 [1/4] Ingesting OpenF1 sessions and weather...');
      await this.openf1Service.ingestSessionsAndWeather(year);
      steps.push({ 
        step: 'OpenF1 Sessions & Weather', 
        status: 'success', 
        duration: Date.now() - startTime 
      });

      // Step 2: OpenF1 Granular Data (Tire Stints, Race Events)
      startTime = Date.now();
      this.logger.log('📡 [2/4] Ingesting OpenF1 granular data...');
      await this.openf1Service.ingestGranularData(year);
      steps.push({ 
        step: 'OpenF1 Granular Data', 
        status: 'success', 
        duration: Date.now() - startTime 
      });

      // Step 3: Modern Results & Laps (Hybrid: Ergast + OpenF1)
      startTime = Date.now();
      this.logger.log('📡 [3/6] Ingesting modern results and laps...');
      await this.openf1Service.ingestModernResultsAndLaps(year);
      steps.push({ 
        step: 'Modern Results & Laps', 
        status: 'success', 
        duration: Date.now() - startTime 
      });

      // Step 3.5: Sprint Qualifying (classification from OpenF1)
      startTime = Date.now();
      this.logger.log('📡 [4/6] Ingesting Sprint Qualifying (SQ)...');
      try {
        await this.openf1Service.ingestSprintQualifyingResults(year);
        steps.push({ 
          step: 'Sprint Qualifying', 
          status: 'success', 
          duration: Date.now() - startTime 
        });
      } catch (error) {
        this.logger.error(`Sprint Qualifying ingestion failed: ${error.message}`);
        steps.push({ 
          step: 'Sprint Qualifying', 
          status: 'error', 
          duration: Date.now() - startTime 
        });
      }

      // Step 4: Sprint Race results (positions + points from Ergast)
      startTime = Date.now();
      this.logger.log('📡 [5/6] Ingesting Sprint Race results...');
      try {
        await this.openf1Service.ingestSprintRaceResults(year);
        steps.push({ 
          step: 'Sprint Race Results', 
          status: 'success', 
          duration: Date.now() - startTime 
        });
      } catch (error) {
        this.logger.error(`Sprint Race ingestion failed: ${error.message}`);
        steps.push({ 
          step: 'Sprint Race Results', 
          status: 'error', 
          duration: Date.now() - startTime 
        });
      }

      // Step 5: Refresh Materialized Views (5 views)
      startTime = Date.now();
      this.logger.log('🔄 [6/6] Refreshing materialized views...');
      await this.refreshMaterializedViews();
      steps.push({ 
        step: 'Refresh Materialized Views', 
        status: 'success', 
        duration: Date.now() - startTime 
      });

      this.logger.log(`✅ Current Year Pipeline completed successfully!`);
      
      return {
        success: true,
        message: `Successfully ingested all data for ${year} and refreshed materialized views`,
        steps
      };

    } catch (error) {
      this.logger.error('❌ Current Year Pipeline failed:', error.message);
      return {
        success: false,
        message: `Pipeline failed: ${error.message}`,
        steps
      };
    }
  }

  /**
   * OPTIONAL: Full historical + modern pipeline
   * Use this if you ever need to rebuild the entire database from scratch
   */
  async runFullPipeline(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🚀 Starting FULL Ingestion Pipeline (Historical + Modern)...');
    
    try {
      // === ERGAST HISTORICAL (2000-2022) ===
      this.logger.log('📚 [Phase 1/2] Running Ergast Historical Ingestion...');
      await this.ergastService.ingestSeasons();
      await this.ergastService.ingestCircuits();
      await this.ergastService.ingestConstructors();
      await this.ergastService.ingestDrivers();
      await this.ergastService.ingestRacesAndSessions();
      await this.ergastService.ingestAllResults();
      await this.ergastService.ingestAllStandings();

      // === OPENF1 MODERN (2023-2025) ===
      this.logger.log('📡 [Phase 2/2] Running OpenF1 Modern Ingestion...');
      for (const year of [2023, 2024, 2025]) {
        this.logger.log(`Processing year ${year}...`);
        await this.openf1Service.ingestSessionsAndWeather(year);
        await this.openf1Service.ingestGranularData(year);
        await this.openf1Service.ingestModernResultsAndLaps(year);
      }

      // === REFRESH MATERIALIZED VIEWS ===
      this.logger.log('🔄 Refreshing all materialized views...');
      await this.refreshMaterializedViews();

      this.logger.log('✅ Full Pipeline completed successfully!');
      return {
        success: true,
        message: 'Full historical and modern ingestion completed with materialized view refresh'
      };

    } catch (error) {
      this.logger.error('❌ Full Pipeline failed:', error.message);
      return {
        success: false,
        message: `Full pipeline failed: ${error.message}`
      };
    }
  }
}

