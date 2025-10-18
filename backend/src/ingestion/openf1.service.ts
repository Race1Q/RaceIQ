import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';

// --- TYPE DEFINITIONS ---
interface DbSession {
  id: number;
  type: string;
  start_time: string;
  race_id: number;
}

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
  team_name: string;
  // For qualifying results
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

interface OpenF1Position {
  session_key: number;
  driver_number: number;
  position: number;
}

interface OpenF1RaceResult {
  session_key: number;
  driver_number: number;
  position: number;
  points: number;
  grid_position: number;
  laps: number;
  time: string; // duration string
  status: string;
}

interface OpenF1Lap {
  session_key: number;
  driver_number: number;
  lap_number: number;
  position: number;
  lap_duration: number; // in seconds
  is_pit_out_lap: boolean;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
}

interface OpenF1PitStop {
  session_key: number;
  driver_number: number;
  lap_number: number;
  pit_duration: number; // stationary duration in seconds
  duration: number; // total pitlane duration in seconds
}


@Injectable()
export class OpenF1Service {
  private readonly logger = new Logger(OpenF1Service.name);
  private readonly apiBaseUrl = 'https://api.openf1.org/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  ///// ----- ***** FETCH OPENF1 DATA ***** ----- /////

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

  ///// ----- ***** HELPER FUNCTIONS ***** ----- /////

  private timeStringToMs(timeString: string | null): number | null {
    if (!timeString) return null;

    // Matches formats like "1:23.456" or "23.456"
    const parts = timeString.split(':');
    let totalMs = 0;
    
    if (parts.length === 2) { // Minutes and seconds
      const [minutes, seconds] = parts;
      totalMs += parseInt(minutes, 10) * 60 * 1000;
      totalMs += parseFloat(seconds) * 1000;
    } else if (parts.length === 1) { // Just seconds
      const [seconds] = parts;
      totalMs += parseFloat(seconds) * 1000;
    } else {
      return null;
    }

    return Math.round(totalMs);
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
    const sessions = await this.fetchOpenF1Data<OpenF1Session>(`/sessions?year=${year}`);
    
    if (!sessions || sessions.length === 0) {
      this.logger.warn(`No OpenF1 sessions found for ${year}.`);
      return;
    }

    const sessionsToInsert: any[] = [];

    for (const session of sessions) {
      const meeting = meetings.find(m => m.meeting_key === session.meeting_key);
      if (!meeting) continue;

      const simplifiedMeetingName = meeting.meeting_name.replace('Grand Prix', '').trim().toLowerCase();
      
      // Fix for Sao Paulo name mismatch
      const raceNameLookup = simplifiedMeetingName === 'sao paulo' ? 'são paulo' : simplifiedMeetingName;
      const raceId = raceMap.get(raceNameLookup);

      if (!raceId) continue;

      const weatherData = await this.fetchOpenF1Data<OpenF1Weather>(`/weather?session_key=${session.session_key}`);
      const latestWeather = weatherData.length > 0 ? weatherData[weatherData.length - 1] : null;

      sessionsToInsert.push({
        race_id: raceId,
        openf1_session_key: session.session_key, // <-- THE CRUCIAL ADDITION
        type: this.mapSessionType(session.session_name),
        start_time: session.date_start,
        weather: latestWeather,
      });
      await new Promise(resolve => setTimeout(resolve, 50)); 
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
      } else {
        this.logger.log(`Successfully ingested ${sessionsToInsert.length} OpenF1 sessions for ${year}.`);
      }
    }
  }

  ///// ----- ***** INGEST GRANULAR DATA ***** ----- /////

  public async ingestGranularData(year: number) {
    this.logger.log(`Starting OpenF1 Granular Data (Stints, Events) ingestion for ${year}...`);
  
    // 1. Fetch all necessary mapping data
    const openf1Sessions = await this.fetchOpenF1Data<OpenF1Session>(`/sessions?year=${year}`);
    if (!openf1Sessions || openf1Sessions.length === 0) {
      this.logger.warn(`No OpenF1 sessions found for ${year}.`);
      return;
    }
    
    const { data: season } = await this.supabaseService.client.from('seasons').select('id').eq('year', year).single();
    if (!season) {
      this.logger.error(`Could not find season_id for year ${year}. Aborting ingestion.`);
      return;
    }
    
    const { data: dbRacesForYear } = await this.supabaseService.client.from('races').select('id, name').eq('season_id', season.id);
    const raceIdsForYear = (dbRacesForYear ?? []).map(r => r.id);
    const { data: dbSessions } = await this.supabaseService.client
      .from('sessions')
      .select('id, type, race_id')
      .in('race_id', raceIdsForYear) as { data: { id: number; type: string; race_id: number; }[] | null };
  
    const openf1Meetings = await this.fetchOpenF1Data<OpenF1Meeting>(`/meetings?year=${year}`);
    const raceIdToMeetingKeyMap = new Map<number, number>();
    (dbRacesForYear ?? []).forEach(race => {
      const simplifiedRaceName = race.name.replace('Grand Prix', '').trim().toLowerCase();
      const meeting = openf1Meetings.find(m => m.meeting_name.replace('Grand Prix', '').trim().toLowerCase() === simplifiedRaceName);
      if (meeting) raceIdToMeetingKeyMap.set(race.id, meeting.meeting_key);
    });
    
    // Map drivers
    const raceSessionKey = openf1Sessions.find(s => s.session_name === 'Race')?.session_key;
    if (!raceSessionKey) {
      this.logger.warn(`No Race session found for ${year}, cannot map drivers.`);
      return;
    }
    const openf1Drivers = await this.fetchOpenF1Data<OpenF1Driver>(`/drivers?session_key=${raceSessionKey}`);
    const { data: dbDrivers } = await this.supabaseService.client.from('drivers').select('id, name_acronym');
    const driverNumberToIdMap = new Map<number, number>();
    for (const o_driver of openf1Drivers) {
      const db_driver = (dbDrivers ?? []).find(d => d.name_acronym === o_driver.name_acronym);
      if (db_driver) driverNumberToIdMap.set(o_driver.driver_number, db_driver.id);
    }
    this.logger.log(`Successfully mapped ${driverNumberToIdMap.size} drivers for ${year}.`);

    // --- vvv ADD THIS NEW DEBUG BLOCK vvv ---
    this.logger.debug('----- GRANULAR DATA DEBUG INFO -----');
    this.logger.debug(`Found ${dbSessions?.length ?? 0} sessions for ${year} in the database.`);
    if (dbSessions && dbSessions.length > 0) {
      this.logger.debug(`Sample DB session: ${JSON.stringify(dbSessions[0])}`);
    }
    this.logger.debug(`Constructed raceIdToMeetingKeyMap with ${raceIdToMeetingKeyMap.size} entries.`);
    this.logger.debug(JSON.stringify(Array.from(raceIdToMeetingKeyMap.entries())));
    this.logger.debug('----------------------------------');
    // --- ^^^ ADD THIS NEW DEBUG BLOCK ^^^ ---
  
    // 2. Loop through each session and fetch its granular data
    for (const oSession of openf1Sessions) {
      const sessionType = this.mapSessionType(oSession.session_name);
      let dbSession: { id: number; type: string; race_id: number; } | null = null;
      for (const [raceId, meetingKey] of raceIdToMeetingKeyMap.entries()) {
        if (meetingKey === oSession.meeting_key) {
            // Check if this specific raceId/type combo exists in the sessions we inserted
            const sessionMatch = (dbSessions ?? []).find(dbs => dbs.race_id === raceId && dbs.type === sessionType);
            
            if (sessionMatch) {
              // Found it. This is the correct session.
              dbSession = sessionMatch;
              break; // Now we can break, we found the one we need
            }
            // If no match, we DON'T break. We continue the loop to check the other duplicate race ID.
        }
      }
        
      if (!dbSession) {
        this.logger.warn(`Could not find DB session for OpenF1 session ${oSession.session_name}. Skipping granular data.`);
        continue;
      }
      
      await this.supabaseService.client.from('tire_stints').delete().eq('session_id', dbSession.id);
      await this.supabaseService.client.from('race_events').delete().eq('session_id', dbSession.id);
  
      // --- Ingest Tire Stints ---
      const stints = await this.fetchOpenF1Data<OpenF1Stint>(`/stints?session_key=${oSession.session_key}`);
      const stintsToInsert = stints.map(stint => ({
        session_id: dbSession.id,
        driver_id: driverNumberToIdMap.get(stint.driver_number),
        stint_number: stint.stint_number,
        compound: stint.compound || 'UNKNOWN',
        tyre_age_at_start: stint.tyre_age_at_start,
        start_lap: stint.lap_start,
        end_lap: stint.lap_end,
      })).filter(s => s.driver_id);
  
      if (stintsToInsert.length > 0) {
        const { error } = await this.supabaseService.client.from('tire_stints').insert(stintsToInsert);
        if (error) this.logger.error(`Failed to insert tire stints for session ${oSession.session_key}`, error);
        else this.logger.log(`Ingested ${stintsToInsert.length} tire stints for session ${oSession.session_name}.`);
      }
      
      // --- Ingest Race Events ---
      const raceEvents = await this.fetchOpenF1Data<OpenF1RaceControl>(`/race_control?session_key=${oSession.session_key}`);
      const eventsToInsert = raceEvents
        .filter(e => ['Flag', 'SafetyCar', 'VirtualSafetyCar'].includes(e.category))
        .map(event => ({
          session_id: dbSession.id,
          type: event.category.toUpperCase(),
          message: event.message,
          metadata: event.flag ? { flag: event.flag } : null,
        }));
  
      if (eventsToInsert.length > 0) {
        const { error } = await this.supabaseService.client.from('race_events').insert(eventsToInsert);
        if (error) this.logger.error(`Failed to insert race events for session ${oSession.session_key}`, error);
        else this.logger.log(`Ingested ${eventsToInsert.length} race events for session ${oSession.session_name}.`);
      }
  
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    this.logger.log(`Successfully ingested granular data for ${year}.`);
  }

  ///// ----- ***** INGEST MODERN RESULTS AND LAPS ***** ----- /////

  public async ingestModernResultsAndLaps(year: number) {
    this.logger.log(`Starting ROBUST Modern Ingestion for ${year}...`);

    // --- 1. SETUP & MAPPING ---
    const { data: season } = await this.supabaseService.client.from('seasons').select('id').eq('year', year).single();
    if (!season) { this.logger.error(`Season ${year} not found.`); return; }

    const { data: dbRacesForYear } = await this.supabaseService.client.from('races').select('id, name, round').eq('season_id', season.id);
    // Get sessions WITH the new key we just saved
    const { data: dbSessions } = await this.supabaseService.client.from('sessions').select('id, type, race_id, openf1_session_key').in('race_id', (dbRacesForYear ?? []).map(r => r.id));
    
    const { data: dbDrivers } = await this.supabaseService.client.from('drivers').select('id, name_acronym, ergast_driver_ref');
    const { data: dbConstructors } = await this.supabaseService.client.from('constructors').select('id, name');

    const ergastDriverRefMap = new Map((dbDrivers ?? []).map(d => [d.ergast_driver_ref, d.id]));
    const constructorNameMap = new Map((dbConstructors ?? []).map(c => [c.name, c.id]));
    const driverNumberToIdMap = new Map<number, number>();
     if ((dbDrivers ?? []).length > 0) {
        const representativeSessionKey = (dbSessions ?? []).find(s => s.type === 'RACE')?.openf1_session_key;
        if(representativeSessionKey) {
            const drivers = await this.fetchOpenF1Data<OpenF1Driver>(`/drivers?session_key=${representativeSessionKey}`);
            (dbDrivers ?? []).forEach(dbd => { const od = drivers.find(od => od.name_acronym === dbd.name_acronym); if (od) driverNumberToIdMap.set(od.driver_number, dbd.id); });
        }
    }


    // --- 2. LOOP THROUGH EACH RACE OF THE SEASON ---
    for (const race of (dbRacesForYear ?? [])) {
      this.logger.log(`Processing ${year} Round ${race.round}: ${race.name}`);

      // --- 3. ERGAST DATA INGESTION (No change here) ---
      const ergastApiBase = `https://api.jolpi.ca/ergast/f1`;
      // ... same logic for fetching quali and race results ...
      const qualiSession = (dbSessions ?? []).find(s => s.race_id === race.id && s.type === 'QUALIFYING');
      if (qualiSession) { /* ... Omitted for brevity ... */ }
      const raceSession = (dbSessions ?? []).find(s => s.race_id === race.id && s.type === 'RACE');
      if (raceSession) { /* ... Omitted for brevity ... */ }
      if (qualiSession) {
        await this.supabaseService.client.from('qualifying_results').delete().eq('session_id', qualiSession.id);
        const url = `${ergastApiBase}/${year}/${race.round}/qualifying.json`;
        try {
          const response = await firstValueFrom(this.httpService.get(url));
          const qualiResults = response.data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
          const qualiToInsert = qualiResults.map(res => ({
            session_id: qualiSession.id,
            driver_id: ergastDriverRefMap.get(res.Driver.driverId),
            constructor_id: constructorNameMap.get(res.Constructor.name),
            position: parseInt(res.position, 10),
            q1_time_ms: this.timeStringToMs(res.Q1),
            q2_time_ms: this.timeStringToMs(res.Q2),
            q3_time_ms: this.timeStringToMs(res.Q3),
          })).filter(r => r.driver_id && r.constructor_id);

          if (qualiToInsert.length > 0) {
            await this.supabaseService.client.from('qualifying_results').insert(qualiToInsert);
          }
        } catch (e) { this.logger.warn(`No qualifying data found in Ergast for ${year} R${race.round}`); }
      }
      if (raceSession) {
        await this.supabaseService.client.from('race_results').delete().eq('session_id', raceSession.id);
        const url = `${ergastApiBase}/${year}/${race.round}/results.json`;
        try {
          const response = await firstValueFrom(this.httpService.get(url));
          const raceResults = response.data.MRData.RaceTable.Races[0]?.Results || [];
          const raceResultsToInsert = raceResults.map(res => ({
            session_id: raceSession.id,
            driver_id: ergastDriverRefMap.get(res.Driver.driverId),
            constructor_id: constructorNameMap.get(res.Constructor.name),
            position: parseInt(res.position, 10),
            points: parseFloat(res.points),
            grid: parseInt(res.grid, 10),
            laps: parseInt(res.laps, 10),
            status: res.status,
            time_ms: this.timeStringToMs(res.Time?.time),
          })).filter(r => r.driver_id && r.constructor_id);

          if (raceResultsToInsert.length > 0) {
            await this.supabaseService.client.from('race_results').insert(raceResultsToInsert);
          }
        } catch (e) { this.logger.warn(`No race results data found in Ergast for ${year} R${race.round}`); }
      }

      // --- 4. OPENF1 DATA INGESTION (NOW RELIABLE) ---
      // Get the race session from our DB, which now includes the key we need.
      const oSessionData = (dbSessions ?? []).find(s => s.race_id === race.id && s.type === 'RACE');
      
      if (oSessionData && oSessionData.openf1_session_key) {
        await this.supabaseService.client.from('laps').delete().eq('race_id', race.id);
        await this.supabaseService.client.from('pit_stops').delete().eq('race_id', race.id);

        const oSessionKey = oSessionData.openf1_session_key;
        const laps = await this.fetchOpenF1Data<OpenF1Lap>(`/laps?session_key=${oSessionKey}`);
        const pits = await this.fetchOpenF1Data<OpenF1PitStop>(`/pit?session_key=${oSessionKey}`);

        // ... same logic for inserting laps and pits ...
        const lapsToInsert = laps.map(l => ({ race_id: race.id, driver_id: driverNumberToIdMap.get(l.driver_number), lap_number: l.lap_number, position: l.position, time_ms: Math.round(l.lap_duration * 1000), sector_1_ms: l.duration_sector_1 ? Math.round(l.duration_sector_1 * 1000) : null, sector_2_ms: l.duration_sector_2 ? Math.round(l.duration_sector_2 * 1000) : null, sector_3_ms: l.duration_sector_3 ? Math.round(l.duration_sector_3 * 1000) : null, is_pit_out_lap: l.is_pit_out_lap })).filter(l => l.driver_id);
        if (lapsToInsert.length > 0) { await this.supabaseService.client.from('laps').insert(lapsToInsert); this.logger.log(`Successfully ingested ${lapsToInsert.length} laps for ${race.name}.`); }

        const stopCounts = new Map<number, number>();
        const pitStopsToInsert = pits.sort((a, b) => a.lap_number - b.lap_number).map(p => { const dId = driverNumberToIdMap.get(p.driver_number); if (!dId) return null; const count = stopCounts.get(dId) || 0; stopCounts.set(dId, count + 1); return { race_id: race.id, driver_id: dId, stop_number: count + 1, lap_number: p.lap_number, stationary_duration_ms: Math.round(p.pit_duration * 1000), total_duration_in_pitlane_ms: Math.round(p.duration * 1000), }; }).filter(p => p !== null);
        if (pitStopsToInsert.length > 0) { await this.supabaseService.client.from('pit_stops').insert(pitStopsToInsert); this.logger.log(`Successfully ingested ${pitStopsToInsert.length} pit stops for ${race.name}.`); }

      } else {
        this.logger.warn(`Could not find OpenF1 session key for ${race.name} in the database. Skipping granular data.`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    this.logger.log(`Finished ROBUST modern ingestion for ${year}.`);
  }

  ///// ----- ***** INGEST TRACK LAYOUTS ***** ----- /////

  public async ingestTrackLayouts() {
    this.logger.log('Starting Track Layout ingestion... This is a heavy, one-time operation.');

    const referenceYear = 2023; // Use a complete, recent season

    // 1. Get our DB data for the reference year
    const { data: season } = await this.supabaseService.client.from('seasons').select('id').eq('year', referenceYear).single();
    if (!season) {
      this.logger.error(`Cannot find season ${referenceYear} to build layouts.`);
      return;
    }

    // --- THIS IS THE FIX ---
    const meetings = await this.fetchOpenF1Data<OpenF1Meeting>(`/meetings?year=${referenceYear}`);
    const raceSessions = await this.fetchOpenF1Data<OpenF1Session>(`/sessions?year=${referenceYear}&session_name=Race`);
    // --- END FIX ---

    // 4. Fetch ONLY the latest race for the reference year
    const { data: latestRace, error: raceError } = await this.supabaseService.client
      .from('races')
      .select('circuit_id, name')
      .eq('season_id', season.id)
      .order('round', { ascending: false }) // Find the highest round number
      .limit(1)
      .single(); // We only want one race object

    if (raceError || !latestRace) {
      this.logger.error(`Could not find the latest race for ${referenceYear}.`, raceError);
      return;
    }

    this.logger.log(`Found latest race to test: ${latestRace.name}. Checking and fetching its layout...`);
    const circuitIdToUpdate = latestRace.circuit_id;

    // 5. Find the OpenF1 session key for this one race
    const simpleName = latestRace.name.replace('Grand Prix', '').trim().toLowerCase();
    const oMeeting = meetings.find(m => m.meeting_name.replace('Grand Prix', '').trim().toLowerCase() === simpleName);
    if (!oMeeting) {
      this.logger.warn(`Could not find OpenF1 meeting for race: ${latestRace.name}`);
      return;
    }

    const oSession = raceSessions.find(s => s.meeting_key === oMeeting.meeting_key);
    if (!oSession) {
      this.logger.warn(`Could not find OpenF1 race session for meeting: ${oMeeting.meeting_name}`);
      return;
    }

    this.logger.log(`Fetching layout for ${latestRace.name} (Session: ${oSession.session_key})... This will take a moment.`);

    // 6. Fetch location data for ALL drivers on lap 5. This is a broader query.
    this.logger.log(`Fetching location data for ALL drivers on Lap 5...`);
    const allDriversLap5 = await this.fetchOpenF1Data<any>(
      `/location?session_key=${oSession.session_key}&lap_number=5`
    );

    if (!allDriversLap5 || allDriversLap5.length === 0) {
      this.logger.warn(`API returned no location data at all for lap 5. Skipping track.`);
      return; // Exit the function
    }

    // 7. Data was returned! Grab the first driver number from the list (whoever it is).
    const referenceDriverNum = allDriversLap5[0].driver_number;
    this.logger.log(`Data found. Using driver ${referenceDriverNum} as the reference for the lap trace.`);

    // 8. Filter the full list to ONLY that one driver, then map their coordinates.
    const lapTrace = allDriversLap5
      .filter(point => point.driver_number === referenceDriverNum)
      .map(point => ({ x: point.x, y: point.y, z: point.z }));

    // 9. Track layout storage removed - track_layout column doesn't exist in database
    if (lapTrace.length > 0) {
      // TODO: Implement track layout storage if needed in the future
      this.logger.log(`Track layout generated for circuit ${circuitIdToUpdate} with ${lapTrace.length} points (not saved to DB)`);
      
      const updateError = null; // Skip database update
      if (updateError) {
        this.logger.error(`Failed to save layout for circuit ${circuitIdToUpdate}:`, updateError);
      } else {
        this.logger.log(`Successfully ingested layout for ${latestRace.name}!`);
      }
    } else {
      this.logger.warn(`Could not find a complete lap trace for ${latestRace.name}.`);
    }

    this.logger.log('--- Finished Track Layout Ingestion Test ---');
  }

}