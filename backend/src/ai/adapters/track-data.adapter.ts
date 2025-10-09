import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CircuitsService } from '../../circuits/circuits.service';
import { RacesService } from '../../races/races.service';

export interface TrackDataForPreview {
  slug: string;
  circuitId?: number;
  circuitName?: string;
  location?: string;
  country?: string;
  lengthKm?: number;
  raceDistanceKm?: number;
  historicalRaces?: Array<{
    year: number;
    raceName: string;
    winner?: string;
    date?: string;
  }>;
  eventInfo?: {
    eventId: number;
    raceName?: string;
    date?: string;
  };
}

@Injectable()
export class TrackDataAdapter {
  private readonly logger = new Logger(TrackDataAdapter.name);

  constructor(
    private readonly circuitsService: CircuitsService,
    private readonly racesService: RacesService,
  ) {}

  /**
   * Fetch comprehensive track data for preview generation
   * @param slug Track slug identifier (can be circuit name or ID)
   * @param eventId Optional event ID for event-specific data
   */
  async getTrackData(slug: string, eventId?: number): Promise<TrackDataForPreview> {
    try {
      this.logger.log(`Fetching track data for slug: ${slug}${eventId ? `, event: ${eventId}` : ''}`);

      // Try to parse slug as circuit ID first
      const circuitId = parseInt(slug, 10);
      let circuit;

      if (!isNaN(circuitId)) {
        // Fetch by ID
        try {
          circuit = await this.circuitsService.findOne(circuitId);
        } catch (error) {
          this.logger.warn(`Circuit not found by ID ${circuitId}: ${error.message}`);
        }
      }

      // If not found by ID or slug is not a number, try to find by name
      if (!circuit) {
        try {
          const circuits = await this.circuitsService.findAll();
          circuit = circuits.find(c => 
            c.name.toLowerCase().includes(slug.toLowerCase()) ||
            slug.toLowerCase().includes(c.name.toLowerCase())
          );
        } catch (error) {
          this.logger.warn(`Error searching circuits by name: ${error.message}`);
        }
      }

      if (!circuit) {
        throw new NotFoundException(`Circuit not found for slug: ${slug}`);
      }

      // Fetch historical races for this circuit
      let historicalRaces: Array<{
        year: number;
        raceName: string;
        date?: string;
      }> = [];
      try {
        const races = await this.racesService.findAll({ circuit_id: circuit.id });
        
        // Get up to 5 most recent races
        historicalRaces = races
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(race => ({
            year: new Date(race.date).getFullYear(),
            raceName: race.name,
            date: race.date?.toString(),
          }));
      } catch (error) {
        this.logger.warn(`Failed to fetch historical races: ${error.message}`);
      }

      // Fetch event-specific data if eventId provided
      let eventInfo;
      if (eventId) {
        try {
          const event = await this.racesService.findOne(eventId.toString());
          if (event) {
            eventInfo = {
              eventId,
              raceName: event.name,
              date: event.date?.toString(),
            };
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch event ${eventId}: ${error.message}`);
        }
      }

      // Build comprehensive track data
      const trackData: TrackDataForPreview = {
        slug,
        circuitId: circuit.id,
        circuitName: circuit.name,
        location: circuit.location,
        country: circuit.country_code,
        lengthKm: circuit.length_km,
        raceDistanceKm: circuit.race_distance_km,
        historicalRaces,
        eventInfo,
      };

      this.logger.log(`Successfully fetched track data for ${circuit.name}`);
      return trackData;
    } catch (error) {
      this.logger.error(`Error fetching track data: ${error.message}`, error.stack);
      throw error;
    }
  }
}

