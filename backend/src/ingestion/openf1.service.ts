import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';

// --- TYPE DEFINITIONS ---
interface OpenF1Session {
  session_key: number;
  session_name: string;
  country_name: string;
  meeting_key: number;
  date_start: string;
  year: number;
}

interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
}

interface OpenF1Weather {
  air_temperature: number;
  track_temperature: number;
  rainfall: number;
  humidity: number;
  wind_speed: number;
}

interface OpenF1Stint {
  stint_number: number;
  lap_start: number;
  lap_end: number;
  driver_number: number;
  compound: string | null;
  tyre_age_at_start: number | null;
}

interface OpenF1RaceControl {
  date: string;
  category: string;
  flag?: string;
  message: string;
}

interface OpenF1Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
}

@Injectable()
export class OpenF1Service {
  private readonly logger = new Logger(OpenF1Service.name);
  private readonly apiBaseUrl = 'https://api.openf1.org/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private async fetchOpenF1Data<T>(endpoint: string, attempt = 0): Promise<T[]> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    try {
      this.logger.log(`Fetching data from OpenF1 endpoint: ${endpoint}`);
      const response = await firstValueFrom(this.httpService.get<T[]>(url));
      return response.data;
    } catch (error) {
      // Add robust retry logic for rate limiting
      if (error.response?.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        this.logger.warn(`OpenF1 Rate limited. Waiting ${waitTime.toFixed(0)}ms before retrying...`);
        await new Promise((r) => setTimeout(r, waitTime));
        return this.fetchOpenF1Data(endpoint, attempt + 1);
      }
      this.logger.error(`Failed to fetch data from ${url}`, error.stack);
      return [];
    }
  }

  private mapSessionType(sessionName: string): string {
    const upperName = sessionName.toUpperCase();
    if (upperName.includes('PRACTICE')) return 'PRACTICE';
    if (upperName.includes('QUALIFYING')) return 'QUALIFYING';
    if (upperName.includes('SPRINT')) return 'SPRINT';
    if (upperName.includes('RACE')) return 'RACE';
    return 'UNKNOWN'; // Fallback for any other type
  }


  ///// ----- ***** INGEST SESSIONS AND WEATHER ***** ----- /////

  public async ingestSessionsAndWeather(year: number) {
    this.logger.log(`Starting OpenF1 Sessions & Weather ingestion for ${year}...`);

    const { data: season } = await this.supabaseService.client.from('seasons').select('id').eq('year', year).single();
    if (!season) {
      this.logger.error(`Season ${year} not found in DB. Run Ergast ingestion first.`);
      return;
    }

    const { data: racesForYear } = await this.supabaseService.client.from('races').select('id, name').eq('season_id', season.id);
    if (!racesForYear || racesForYear.length === 0) {
      this.logger.error(`No races found for ${year} in DB. Run Ergast ingestion first.`);
      return;
    }

    const raceMap = new Map<string, number>();
    for (const race of racesForYear) {
      const simplifiedName = race.name.replace('Grand Prix', '').trim().toLowerCase();
      raceMap.set(simplifiedName, race.id);
    }

    const meetings = await this.fetchOpenF1Data<OpenF1Meeting>(`/meetings?year=${year}`);
    const meetingMap = new Map(meetings.map(m => [m.meeting_key, m.meeting_name]));

    const sessions = await this.fetchOpenF1Data<OpenF1Session>(`/sessions?year=${year}`);
    if (!sessions || sessions.length === 0) {
      this.logger.warn(`No OpenF1 sessions found for ${year}.`);
      return;
    }

    const sessionsToInsert: any[] = [];

    for (const session of sessions) {
      const meetingName = meetingMap.get(session.meeting_key);

      if (!session || !meetingName || !session.country_name) {
        this.logger.warn('Skipping a session from OpenF1 due to missing data.');
        continue;
      }

      const simplifiedMeetingName = meetingName.replace('Grand Prix', '').trim().toLowerCase();
      const raceId = raceMap.get(simplifiedMeetingName);

      if (!raceId) {
        this.logger.warn(`Could not find matching race for session: ${meetingName}`);
        continue;
      }

      const weatherData = await this.fetchOpenF1Data<OpenF1Weather>(`/weather?session_key=${session.session_key}`);
      const latestWeather = weatherData.length > 0 ? weatherData[weatherData.length - 1] : null;

      sessionsToInsert.push({
        race_id: raceId,
        type: this.mapSessionType(session.session_name),
        start_time: session.date_start,
        weather: latestWeather,
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const raceIdsToDelete = (racesForYear ?? []).map(r => r.id);
    if (raceIdsToDelete.length > 0) {
      this.logger.log(`Deleting existing OpenF1-era sessions for ${year} before inserting.`);
      await this.supabaseService.client.from('sessions').delete().in('race_id', raceIdsToDelete);
    }
    
    if (sessionsToInsert.length > 0) {
      const { error } = await this.supabaseService.client.from('sessions').insert(sessionsToInsert);
      if (error) {
        this.logger.error(`Failed to insert OpenF1 sessions for ${year}`, error);
        throw new Error('Failed to insert OpenF1 sessions');
      }
    }

    this.logger.log(`Successfully ingested ${sessionsToInsert.length} OpenF1 sessions for ${year}.`);
  }

  ///// ----- ***** INGEST GRANULAR DATA ***** ----- /////
  ///// ----- ***** INGEST GRANULAR DATA ***** ----- /////
  ///// ----- ***** INGEST GRANULAR DATA ***** ----- /////

  public async ingestGranularData(year: number) {
    this.logger.log(`Starting OpenF1 Granular Data (Stints, Events) ingestion for ${year}...`);

    // 1. Fetch sessions for this year FROM OPENF1 to get their session_keys
    const openf1Sessions = await this.fetchOpenF1Data<OpenF1Session>(`/sessions?year=${year}`);
    if (!openf1Sessions || openf1Sessions.length === 0) {
      this.logger.warn(`No OpenF1 sessions found for ${year}.`);
      return;
    }

    const raceSessionKey = openf1Sessions.find(s => s.session_name === 'Race')?.session_key;
    if (!raceSessionKey) {
      this.logger.warn(`No Race session found for ${year}, cannot map drivers.`);
      return;
    }

    const openf1Drivers = await this.fetchOpenF1Data<OpenF1Driver>(`/drivers?session_key=${raceSessionKey}`);
    // Select the name_acronym from our database
    const { data: dbDrivers } = await this.supabaseService.client.from('drivers').select('id, name_acronym');
    
    const driverNumberToIdMap = new Map<number, number>();
    for (const o_driver of openf1Drivers) {
      // Match using the reliable 3-letter acronym
      const db_driver = (dbDrivers ?? []).find(d => d.name_acronym === o_driver.name_acronym);
      if (db_driver) {
        driverNumberToIdMap.set(o_driver.driver_number, db_driver.id);
      }
    }
    this.logger.log(`Successfully mapped ${driverNumberToIdMap.size} drivers for ${year}.`);

    // 3. Loop through each session and fetch its granular data
    for (const session of openf1Sessions) {
      const { data: dbSession } = await this.supabaseService.client
        .from('sessions')
        .select('id')
        .eq('start_time', session.date_start)
        .single();
        
      if (!dbSession) {
        this.logger.warn(`Could not find DB session for OpenF1 session starting at ${session.date_start}. Skipping granular data.`);
        continue;
      }
      
      await this.supabaseService.client.from('tire_stints').delete().eq('session_id', dbSession.id);
      await this.supabaseService.client.from('race_events').delete().eq('session_id', dbSession.id);

      // --- Ingest Tire Stints ---
      const stints = await this.fetchOpenF1Data<OpenF1Stint>(`/stints?session_key=${session.session_key}`);
      const stintsToInsert = stints.map(stint => ({
        session_id: dbSession.id,
        driver_id: driverNumberToIdMap.get(stint.driver_number),
        stint_number: stint.stint_number,
        // FIX: Access properties directly from the 'stint' object
        compound: stint.compound || 'UNKNOWN',
        tyre_age_at_start: stint.tyre_age_at_start,
        start_lap: stint.lap_start,
        end_lap: stint.lap_end,
      })).filter(s => s.driver_id);

      // // ================== NEW DEBUGGING CODE START ==================
      // if (stints.length > 0) {
      //   this.logger.log('--- DEBUG: RAW STINT OBJECT FROM API ---');
      //   console.log(stints[0]);
      //   this.logger.log('-----------------------------------------');
      // }
      // // =================== NEW DEBUGGING CODE END ===================

      if (stintsToInsert.length > 0) {
        const { error } = await this.supabaseService.client.from('tire_stints').insert(stintsToInsert);
        if (error) {
            this.logger.error(`Failed to insert tire stints for session ${session.session_key}`, error);
            continue; 
        }
        this.logger.log(`Successfully ingested ${stintsToInsert.length} tire stints for session ${session.session_key}.`);
      }
      
      // --- Ingest Race Events ---
      const raceEvents = await this.fetchOpenF1Data<OpenF1RaceControl>(`/race_control?session_key=${session.session_key}`);
      const eventsToInsert = raceEvents
        .filter(e => ['Flag', 'SafetyCar', 'VirtualSafetyCar'].includes(e.category))
        .map(event => ({
          session_id: dbSession.id,
          type: event.category.toUpperCase(),
          message: event.message,
          metadata: event.flag ? { flag: event.flag } : null,
        }));

      // FIX: Add proper error checking for the insert operation
      if (eventsToInsert.length > 0) {
        const { error } = await this.supabaseService.client.from('race_events').insert(eventsToInsert);
        if (error) {
            this.logger.error(`Failed to insert race events for session ${session.session_key}`, error);
            continue;
        }
        this.logger.log(`Successfully ingested ${eventsToInsert.length} race events for session ${session.session_key}.`);
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.logger.log(`Successfully ingested granular data for ${year}.`);
  }

}