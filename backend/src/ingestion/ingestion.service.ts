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
      this.logger.log('📡 [3/4] Ingesting modern results and laps...');
      await this.openf1Service.ingestModernResultsAndLaps(year);
      steps.push({ 
        step: 'Modern Results & Laps', 
        status: 'success', 
        duration: Date.now() - startTime 
      });

      // Step 4: Refresh Materialized Views (5 views)
      startTime = Date.now();
      this.logger.log('🔄 [4/4] Refreshing materialized views...');
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
   * Which already-run rounds of a season have no race results yet.
   * This is the set an incremental top-up needs to fill.
   */
  async findRoundsMissingResults(year: number): Promise<{ round: number; name: string; date: string }[]> {
    return this.dataSource.query(
      `SELECT r.round, r.name, r.date::text AS date
         FROM races r
         JOIN seasons s ON s.id = r.season_id
         LEFT JOIN sessions ses ON ses.race_id = r.id AND ses.type = 'RACE'
         LEFT JOIN race_results rr ON rr.session_id = ses.id
        WHERE s.year = $1
          AND r.date < CURRENT_DATE
        GROUP BY r.round, r.name, r.date
       HAVING COUNT(rr.id) = 0
        ORDER BY r.round`,
      [year],
    );
  }

  /**
   * Incremental top-up: ingest ONLY the rounds that have happened but have no
   * results, then refresh the views.
   *
   * Prefer this over ingestCurrentYearPipeline for routine updates. The full
   * pipeline deletes every session in the season before re-inserting, and
   * race_results/qualifying_results/tire_stints/race_events all cascade off
   * sessions — so it destroys the whole season's results and is only correct if
   * every subsequent step succeeds. This touches nothing outside the missing rounds.
   */
  async ingestMissingRounds(year: number = new Date().getFullYear()): Promise<{
    success: boolean;
    message: string;
    rounds: number[];
    steps: { step: string; status: string; duration: number }[];
  }> {
    const missing = await this.findRoundsMissingResults(year);
    const rounds = missing.map(r => r.round);
    const steps: { step: string; status: string; duration: number }[] = [];

    if (rounds.length === 0) {
      this.logger.log(`✅ ${year} is already up to date — no rounds missing results.`);
      return { success: true, message: `No missing rounds for ${year}.`, rounds: [], steps };
    }

    this.logger.log(
      `🚀 Topping up ${year} rounds ${rounds.join(', ')} ` +
        `(${missing.map(m => m.name).join(', ')})`,
    );

    try {
      let startTime = Date.now();
      this.logger.log('📡 [1/4] Sessions and weather (scoped)...');
      await this.openf1Service.ingestSessionsAndWeather(year, { rounds });
      steps.push({ step: 'OpenF1 Sessions & Weather', status: 'success', duration: Date.now() - startTime });

      startTime = Date.now();
      this.logger.log('📡 [2/4] Granular data (scoped)...');
      await this.openf1Service.ingestGranularData(year, { rounds });
      steps.push({ step: 'OpenF1 Granular Data', status: 'success', duration: Date.now() - startTime });

      startTime = Date.now();
      this.logger.log('📡 [3/4] Modern results and laps (scoped)...');
      await this.openf1Service.ingestModernResultsAndLaps(year, { rounds });
      steps.push({ step: 'Modern Results & Laps', status: 'success', duration: Date.now() - startTime });

      startTime = Date.now();
      this.logger.log('🔄 [4/4] Refreshing materialized views...');
      await this.refreshMaterializedViews();
      steps.push({ step: 'Refresh Materialized Views', status: 'success', duration: Date.now() - startTime });

      const stillMissing = await this.findRoundsMissingResults(year);
      if (stillMissing.length > 0) {
        return {
          success: false,
          message:
            `Ingested rounds ${rounds.join(', ')} but ${stillMissing.map(r => r.round).join(', ')} ` +
            `still have no results. Check whether OpenF1 has published them yet.`,
          rounds,
          steps,
        };
      }

      return {
        success: true,
        message: `Successfully added ${year} rounds ${rounds.join(', ')} and refreshed materialized views.`,
        rounds,
        steps,
      };
    } catch (error) {
      this.logger.error('❌ Incremental ingestion failed:', error.message);
      return { success: false, message: `Incremental ingestion failed: ${error.message}`, rounds, steps };
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
      for (const year of [2023, 2024, 2025, 2026]) {
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

