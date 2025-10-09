import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DriversService } from '../../drivers/drivers.service';

export interface DriverDataForBio {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  code: string;
  driverNumber: number | null;
  countryCode: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  funFact: string | null;
  careerStats?: {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    grandsPrixEntered: number;
    dnfs: number;
    highestRaceFinish: number;
    firstRaceYear?: number;
    firstRaceEvent?: string;
  };
  seasonStats?: {
    year: number;
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    poles?: number;
  };
  currentTeam?: string;
}

@Injectable()
export class DriverStatsAdapter {
  private readonly logger = new Logger(DriverStatsAdapter.name);

  constructor(private readonly driversService: DriversService) {}

  /**
   * Fetch comprehensive driver data for bio generation
   * @param driverId Driver ID
   * @param season Optional season year for season-specific stats
   */
  async getDriverData(driverId: number, season?: number): Promise<DriverDataForBio> {
    try {
      this.logger.log(`Fetching driver data for ID: ${driverId}${season ? `, season: ${season}` : ''}`);

      // Fetch driver basic info
      const driver = await this.driversService.findOne(driverId);

      if (!driver) {
        throw new NotFoundException(`Driver with ID ${driverId} not found`);
      }

      // Fetch career stats
      let careerStats;
      try {
        const stats = await this.driversService.getDriverCareerStats(driverId);
        careerStats = {
          wins: stats.careerStats.wins,
          podiums: stats.careerStats.podiums,
          fastestLaps: stats.careerStats.fastestLaps,
          points: stats.careerStats.points,
          grandsPrixEntered: stats.careerStats.grandsPrixEntered,
          dnfs: stats.careerStats.dnfs,
          highestRaceFinish: stats.careerStats.highestRaceFinish,
          firstRaceYear: stats.careerStats.firstRace?.year,
          firstRaceEvent: stats.careerStats.firstRace?.event,
        };
      } catch (error) {
        this.logger.warn(`Failed to fetch career stats for driver ${driverId}: ${error.message}`);
        careerStats = undefined;
      }

      // Fetch season-specific stats if requested
      let seasonStats;
      if (season) {
        try {
          const stats = await this.driversService.getDriverStats(driverId, season);
          if (stats.yearStats) {
            seasonStats = {
              year: season,
              wins: stats.yearStats.wins,
              podiums: stats.yearStats.podiums,
              fastestLaps: stats.yearStats.fastestLaps,
              points: stats.yearStats.points,
              poles: stats.yearStats.poles,
            };
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch season stats for driver ${driverId}, season ${season}: ${error.message}`);
          seasonStats = undefined;
        }
      }

      // Build comprehensive data object
      const driverData: DriverDataForBio = {
        id: driver.id,
        fullName: `${driver.first_name} ${driver.last_name}`.trim(),
        firstName: driver.first_name,
        lastName: driver.last_name,
        code: driver.name_acronym,
        driverNumber: driver.driver_number,
        countryCode: driver.country_code,
        dateOfBirth: driver.date_of_birth ? driver.date_of_birth.toString() : null,
        bio: driver.bio,
        funFact: driver.fun_fact,
        careerStats,
        seasonStats,
      };

      this.logger.log(`Successfully fetched comprehensive data for driver ${driverId}`);
      return driverData;
    } catch (error) {
      this.logger.error(`Error fetching driver data: ${error.message}`, error.stack);
      throw error;
    }
  }
}

