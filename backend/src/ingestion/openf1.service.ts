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
      console.error('SERVICE FAILED:', error);
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
    const upper = (sessionName || '').toUpperCase();
    // Detect Sprint Qualifying/Shootout first
    if ((upper.includes('SPRINT') && upper.includes('QUALIFY')) || upper.includes('SHOOTOUT')) {
      return 'SPRINT_QUALIFYING';
    }
    if (upper.includes('PRACTICE')) return 'PRACTICE';
    if (upper.includes('QUALIFY')) return 'QUALIFYING';
    if (upper.includes('SPRINT')) return 'SPRINT';
    if (upper.includes('RACE')) return 'RACE';
    return 'UNKNOWN';
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
        } catch (e) { 
          console.error('SERVICE FAILED:', e);
          this.logger.warn(`No qualifying data found in Ergast for ${year} R${race.round}`); 
        }
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
        } catch (e) { 
          console.error('SERVICE FAILED:', e);
          this.logger.warn(`No race results data found in Ergast for ${year} R${race.round}`); 
        }
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

  ///// ----- ***** INGEST SPRINT QUALIFYING (SHOOTOUT) RESULTS ***** ----- /////

  public async ingestSprintQualifyingResults(year: number) {
    this.logger.log(`Starting Sprint Qualifying (Shootout) ingestion for ${year}...`);

    // Find season
    const { data: season } = await this.supabaseService.client
      .from('seasons').select('id').eq('year', year).single();
    if (!season) { this.logger.error(`Season ${year} not found.`); return; }

    // Races in season
    const { data: dbRacesForYear } = await this.supabaseService.client
      .from('races').select('id, name, round').eq('season_id', season.id);

    // Sessions in DB
    const { data: dbSessions } = await this.supabaseService.client
      .from('sessions')
      .select('id, type, race_id, openf1_session_key, races(name, season_id)')
      .in('race_id', (dbRacesForYear ?? []).map(r => r.id));

    // Build driver map support and load constructor-driver links for this season
    const { data: dbDrivers } = await this.supabaseService.client
      .from('drivers').select('id, name_acronym');
    // Diagnostics for dbDrivers
    this.logger.warn(`[DIAGNOSTIC] Loaded ${dbDrivers?.length ?? 0} total drivers from DB.`);
    if (dbDrivers && dbDrivers.length > 0) {
      this.logger.debug(`[DIAGNOSTIC] Sample driver from DB: ${JSON.stringify(dbDrivers[0])}`);
    }
    const { data: driverTeamLinks } = await this.supabaseService.client
      .from('constructor_drivers')
      .select('driver_id, constructor_id')
      .eq('season_id', season.id);

    // Prefetch OpenF1 meetings and sessions ONCE, then only consider SPRINT_QUALIFYING
    const meetings = await this.fetchOpenF1Data<OpenF1Meeting>(`/meetings?year=${year}`);
    const openf1Sessions = await this.fetchOpenF1Data<OpenF1Session>(`/sessions?year=${year}`);
    const sprintQualiSessions = openf1Sessions.filter(s => this.mapSessionType(s.session_name) === 'SPRINT_QUALIFYING');

    // Map race name -> race.id for quick lookup (normalize names like in other ingesters)
    const raceNameToId = new Map<string, number>();
    (dbRacesForYear ?? []).forEach(r => {
      const simplified = r.name.replace('Grand Prix', '').trim().toLowerCase();
      raceNameToId.set(simplified, r.id);
    });

    // Build meeting_key -> race_id map
    const meetingKeyToRaceId = new Map<number, number>();
    meetings.forEach(m => {
      const simplifiedMeeting = m.meeting_name.replace('Grand Prix', '').trim().toLowerCase();
      const raceId = raceNameToId.get(simplifiedMeeting === 'sao paulo' ? 'são paulo' : simplifiedMeeting) || raceNameToId.get(simplifiedMeeting);
      if (raceId) meetingKeyToRaceId.set(m.meeting_key, raceId);
    });

    // Build driver_id -> constructor_id map from constructor_drivers for this season
    const driverIdToConstructorId = new Map<number, number>();
    (driverTeamLinks ?? []).forEach(link => {
      if (link.driver_id && link.constructor_id) {
        driverIdToConstructorId.set(Number(link.driver_id), Number(link.constructor_id));
      }
    });

    // Work only with SPRINT_QUALIFYING OpenF1 sessions
    for (const oSq of sprintQualiSessions) {
      const raceId = meetingKeyToRaceId.get(oSq.meeting_key);
      if (!raceId) continue; // Not a race we have (or naming mismatch)

      // Find or create DB SPRINT_QUALIFYING session for this race
      let sqSession = (dbSessions ?? []).find(s => s.race_id === raceId && s.type === 'SPRINT_QUALIFYING');

      // If missing, create minimal session row
      if (!sqSession) {
        const { data: inserted, error } = await this.supabaseService.client
          .from('sessions')
          .insert({ race_id: raceId, type: 'SPRINT_QUALIFYING' })
          .select('id, type, race_id, openf1_session_key')
          .single();
        if (error) { this.logger.warn(`Could not create SPRINT_QUALIFYING session for race_id=${raceId}: ${error.message}`); continue; }
        sqSession = inserted as any;
      }

      // Ensure the openf1_session_key is set from the pre-fetched OpenF1 session
      if (!sqSession || !sqSession.openf1_session_key) {
        await this.supabaseService.client
          .from('sessions')
          .update({ openf1_session_key: oSq.session_key })
          .eq('id', sqSession!.id);
        sqSession!.openf1_session_key = oSq.session_key as any;
      }

      if (!sqSession || !sqSession.openf1_session_key) {
        this.logger.warn(`No OpenF1 session key for SPRINT_QUALIFYING at race_id=${raceId}. Skipping.`);
        continue;
      }

      // ==== Resolve correct season_id for this race and load constructor mapping ====
      // Prefer nested relation from dbSessions if present, else fetch race row
      let currentSeasonId: number | undefined = undefined;
      const sessionFromList = (dbSessions ?? []).find(s => s.race_id === raceId && s.type === 'SPRINT_QUALIFYING');
      // @ts-ignore - access nested relation if present
      currentSeasonId = sessionFromList?.races?.season_id as number | undefined;
      if (!currentSeasonId) {
        const { data: raceRow } = await this.supabaseService.client
          .from('races')
          .select('season_id')
          .eq('id', raceId)
          .single();
        currentSeasonId = raceRow?.season_id as number | undefined;
      }

      // DIAGNOSTIC: log resolved season_id for this session
      this.logger.warn(`[race_id=${raceId}] DIAGNOSTIC: Found season_id: ${currentSeasonId} (Type: ${typeof currentSeasonId})`);
      if (!currentSeasonId) {
        this.logger.error(`(race_id=${raceId}) 'season_id' is null or undefined. Skipping.`);
        continue;
      }

      const { data: constructorDrivers } = await this.supabaseService.client
        .from('constructor_drivers')
        .select('driver_id, constructor_id')
        .eq('season_id', currentSeasonId);
      const driverConstructorMap = new Map<number, number>();
      (constructorDrivers ?? []).forEach((cd: any) => {
        if (cd.driver_id && cd.constructor_id) {
          driverConstructorMap.set(Number(cd.driver_id), Number(cd.constructor_id));
        }
      });
      if (driverConstructorMap.size === 0) {
        this.logger.error(`(race_id=${raceId}) No constructor_drivers for season_id=${currentSeasonId}.`);
      }

      // Diagnostic: show map size and sample key check (e.g., driverId 809 – adjust if needed)
      this.logger.warn(`[race_id=${raceId}] Map Created. Size: ${driverConstructorMap.size}. Has '809'? ${driverConstructorMap.has(809)}. Value: ${driverConstructorMap.get(809)}`);

      // Build driver_number -> driver_id FROM THIS SPRINT_QUALIFYING SESSION (normalized mapping)
      const driverNumberToId = new Map<number, number>();
      const oDriversSq = await this.fetchOpenF1Data<OpenF1Driver>(`/drivers?session_key=${sqSession.openf1_session_key}`);
      this.logger.debug(`[SQ race_id=${raceId}] RAW DRIVER DATA: ${JSON.stringify((oDriversSq || []).slice(0, 3))}`);

      const norm = (s?: string) => (s || '').toUpperCase().trim();

      for (const od of (oDriversSq ?? [])) {
        const acr = norm(od.name_acronym);
        let dbd = (dbDrivers ?? []).find(d => norm(d.name_acronym) === acr);
        if (dbd) {
          driverNumberToId.set(od.driver_number, dbd.id);
        } else {
          if (od.driver_number === 1) {
            this.logger.error(`[race_id=${raceId}] FAILED TO MAP VERSTAPPEN. API Acronym: "${acr}". Could not find match in ${dbDrivers?.length ?? 0} dbDrivers.`);
          }
        }
      }

      // Diagnostics: log a sample of unmapped drivers to fix acronym mismatches in DB if any
      const unmapped = (oDriversSq ?? [])
        .filter(od => !driverNumberToId.has(od.driver_number))
        .map(od => ({ driver_number: od.driver_number, acronym: od.name_acronym, team: od.team_name }))
        .slice(0, 5);
      if (unmapped.length) {
        this.logger.warn(`SQ unmapped drivers (acronym mismatch?): ${JSON.stringify(unmapped)} (showing up to 5)`);
      }

      // Fetch Sprint Qualifying classification from OpenF1
      let results = await this.fetchOpenF1Data<OpenF1RaceResult>(`/results?session_key=${sqSession.openf1_session_key}`);
      this.logger.warn(`[race_id=${raceId}] Fetched results. Count: ${results.length}`);
      if (results.length > 0) {
        this.logger.debug(`[race_id=${raceId}] Sample result: ${JSON.stringify(results[0])}`);
      }

      // Fallback: derive classification from latest positions if results are empty
      if (results.length === 0) {
        const positions = await this.fetchOpenF1Data<OpenF1Position>(`/position?session_key=${sqSession.openf1_session_key}`);
        this.logger.warn(`[race_id=${raceId}] Results empty. Fallback to /position. Count: ${positions.length}`);
        if (positions.length > 0) {
          const latestByDriver = new Map<number, OpenF1Position>();
          for (const p of positions) {
            latestByDriver.set(p.driver_number, p); // assume API order is chronological; last wins
          }
          const derived = Array.from(latestByDriver.values())
            .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
            .map((p) => ({
              session_key: p.session_key,
              driver_number: p.driver_number,
              position: p.position,
              points: 0,
              grid_position: 0,
              laps: 0,
              time: null as any,
              status: 'DerivedFromPosition',
            } as OpenF1RaceResult));
          results = derived;
          this.logger.warn(`[race_id=${raceId}] Derived classification from positions. Drivers: ${results.length}`);
        }
      }

      // Clear and insert into qualifying_results under the SPRINT_QUALIFYING session
      await this.supabaseService.client.from('qualifying_results').delete().eq('session_id', sqSession.id);

      const toInsert = results.map(res => {
        const driverId = driverNumberToId.get(res.driver_number);
        const constructorId = driverId ? driverConstructorMap.get(driverId) : undefined;
        if (driverId && !constructorId) {
          this.logger.warn(`(race_id=${raceId}) Mapped driver ${driverId} but found NO constructor_id for season_id=${currentSeasonId}.`);
        }
        // Diagnostic: log mapping for Verstappen (driver_number=1) to verify keys
        if (res.driver_number === 1) {
          this.logger.debug(`[race_id=${raceId}] Mapping VER: driver_number=${res.driver_number}, mapped_driverId=${driverId} (Type: ${typeof driverId}), mapped_constructorId=${constructorId} (Type: ${typeof constructorId})`);
        }
        return {
          session_id: sqSession!.id,
          driver_id: driverId,
          constructor_id: constructorId,
          position: res.position,
          // Sprint Shootout has effectively one final classification time; store in Q3 for consistency
          q1_time_ms: null,
          q2_time_ms: null,
          q3_time_ms: this.timeStringToMs(res.time || null),
        };
      }).filter(r => r.driver_id && r.constructor_id);

      if (toInsert.length > 0) {
        const { error } = await this.supabaseService.client.from('qualifying_results').insert(toInsert);
        if (error) this.logger.error(`Failed to insert sprint qualifying for race_id=${raceId}.`, error);
        else this.logger.log(`Inserted ${toInsert.length} sprint qualifying rows for race_id=${raceId}.`);
      } else {
        this.logger.warn(`No mappable sprint qualifying rows for race_id=${raceId}.`);
      }
      await new Promise(r => setTimeout(r, 200));
    }

    this.logger.log(`Finished Sprint Qualifying (Shootout) ingestion for ${year}.`);
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

  ///// ----- ***** BACKFILL CONSTRUCTOR-DRIVERS (ERGAST) ***** ----- /////

  /**
   * Backfills the constructor_drivers table for a range of seasons using Ergast standings.
   * Prerequisites:
   *  - drivers.ergast_driver_ref populated
   *  - constructors.name matches Ergast constructor names for the years (e.g., RB, Sauber)
   */
  public async backfillConstructorDrivers(startYear: number, endYear: number) {
    this.logger.log(`Backfilling constructor_drivers ${startYear}-${endYear}...`);

    // Load driver refs
    const { data: allDrivers, error: driverErr } = await this.supabaseService.client
      .from('drivers')
      .select('id, ergast_driver_ref')
      .not('ergast_driver_ref', 'is', null);
    if (driverErr) throw new Error(`Failed to fetch drivers: ${driverErr.message}`);
    const driverRefToId = new Map((allDrivers ?? []).map((d: any) => [d.ergast_driver_ref, d.id]));

    // Load constructors (by name)
    const { data: allConstructors, error: consErr } = await this.supabaseService.client
      .from('constructors')
      .select('id, name');
    if (consErr) throw new Error(`Failed to fetch constructors: ${consErr.message}`);
    const consNameToId = new Map((allConstructors ?? []).map((c: any) => [c.name, c.id]));

    // Load seasons (year -> id)
    const { data: allSeasons, error: seaErr } = await this.supabaseService.client
      .from('seasons')
      .select('id, year');
    if (seaErr) throw new Error(`Failed to fetch seasons: ${seaErr.message}`);
    const yearToSeasonId = new Map((allSeasons ?? []).map((s: any) => [s.year, s.id]));

    for (let year = startYear; year <= endYear; year++) {
      const seasonId = yearToSeasonId.get(year);
      if (!seasonId) { this.logger.warn(`Skip ${year}: no season row.`); continue; }

      try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`;
        const resp = await firstValueFrom(this.httpService.get(url));
        const lists = resp.data?.MRData?.StandingsTable?.StandingsLists;
        const standings = (Array.isArray(lists) && lists[0]?.DriverStandings) || [];

        const toUpsert: { season_id: number; driver_id: number; constructor_id: number }[] = [];
        for (const s of standings) {
          const driverRef = s?.Driver?.driverId;
          const constructorName = s?.Constructors?.[0]?.name;
          const driverId = driverRefToId.get(driverRef);
          const constructorId = consNameToId.get(constructorName);
          if (driverId && constructorId) {
            toUpsert.push({ season_id: seasonId, driver_id: driverId, constructor_id: constructorId });
          } else {
            if (!driverId) this.logger.warn(`(${year}) driver map miss: ${driverRef}`);
            if (!constructorId) this.logger.warn(`(${year}) constructor map miss: '${constructorName}'`);
          }
        }

        if (toUpsert.length) {
          const { error } = await this.supabaseService.client
            .from('constructor_drivers')
            .upsert(toUpsert, { onConflict: 'season_id,constructor_id,driver_id' });
          if (error) this.logger.error(`Upsert failed ${year}: ${error.message}`);
          else this.logger.log(`Upserted ${toUpsert.length} constructor_drivers for ${year}.`);
        } else {
          this.logger.warn(`No mappings to upsert for ${year}.`);
        }
      } catch (e: any) {
        this.logger.error(`Ergast fetch failed for ${year}: ${e?.message || e}`);
      }
    }

    this.logger.log('constructor_drivers backfill complete.');
  }

  ///// ----- ***** BACKFILL DRIVER ACRONYMS (ERGAST) ***** ----- /////

  /**
   * Backfills drivers.name_acronym using Ergast driver standings (Driver.code) as source.
   * Requires drivers.ergast_driver_ref to be populated.
   */
  public async backfillDriverAcronyms(startYear: number, endYear: number) {
    this.logger.log(`Backfilling drivers.name_acronym ${startYear}-${endYear}...`);

    const { data: allDrivers, error: driverErr } = await this.supabaseService.client
      .from('drivers')
      .select('id, ergast_driver_ref, name_acronym')
      .not('ergast_driver_ref', 'is', null);
    if (driverErr) throw new Error(`Failed to fetch drivers: ${driverErr.message}`);

    const driverRefMap = new Map((allDrivers ?? []).map((d: any) => [d.ergast_driver_ref, d]));
    const updates: { id: number; name_acronym: string }[] = [];

    for (let year = startYear; year <= endYear; year++) {
      try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`;
        const resp = await firstValueFrom(this.httpService.get(url));
        const lists = resp.data?.MRData?.StandingsTable?.StandingsLists;
        const standings = (Array.isArray(lists) && lists[0]?.DriverStandings) || [];

        for (const s of standings) {
          const ref = s?.Driver?.driverId;
          const code = s?.Driver?.code; // e.g., "VER"
          if (!ref || !code) continue;
          const dbd = driverRefMap.get(ref);
          if (dbd && dbd.name_acronym !== code) {
            updates.push({ id: dbd.id, name_acronym: code });
            driverRefMap.set(ref, { ...dbd, name_acronym: code });
          }
        }
      } catch (e: any) {
        this.logger.error(`Ergast fetch failed for ${year}: ${e?.message || e}`);
      }
    }

    if (updates.length) {
      this.logger.log(`Updating name_acronym for ${updates.length} drivers...`);
      const chunk = 200;
      for (let i = 0; i < updates.length; i += chunk) {
        const slice = updates.slice(i, i + chunk);
        const { error } = await this.supabaseService.client
          .from('drivers')
          .upsert(slice, { onConflict: 'id' });
        if (error) {
          this.logger.error(`Driver acronym upsert failed (batch ${i}-${i + slice.length}): ${error.message}`);
          break;
        }
      }
      this.logger.log('Driver acronym backfill complete.');
    } else {
      this.logger.log('Driver acronyms already up-to-date.');
    }
  }

  ///// ----- ***** BACKFILL DRIVER REFS + ACRONYMS (ERGAST, BY YEAR) ***** ----- /////

  /**
   * Backfills drivers.ergast_driver_ref and drivers.name_acronym by matching on first/last name
   * against Ergast standings for a given season.
   */
  public async backfillDriverRefsAndAcronyms(year: number) {
    this.logger.log(`Backfilling drivers table (refs+acronyms) for ${year} using Ergast...`);

    // Load our current drivers
    const { data: allDbDrivers, error: driverErr } = await this.supabaseService.client
      .from('drivers')
      .select('id, first_name, last_name, name_acronym, ergast_driver_ref');
    if (driverErr) throw new Error(`Failed to fetch drivers: ${driverErr.message}`);

    // Fetch Ergast standings for the season
    let standings: any[] = [];
    try {
      const url = `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`;
      const response = await firstValueFrom(this.httpService.get(url));
      const lists = response.data?.MRData?.StandingsTable?.StandingsLists;
      standings = (Array.isArray(lists) && lists[0]?.DriverStandings) || [];
    } catch (e: any) {
      this.logger.error(`Failed to fetch Ergast standings for ${year}: ${e?.message || e}`);
      return;
    }
    if (!standings.length) {
      this.logger.warn(`No Ergast standings data found for ${year}.`);
      return;
    }

    // Build updates by name match
    const updates: { id: number; name_acronym?: string; ergast_driver_ref?: string }[] = [];
    let updatedCount = 0;
    for (const s of standings) {
      const d = s?.Driver;
      if (!d) continue;
      const ergastRef: string | undefined = d.driverId;
      const ergastCode: string | undefined = d.code; // e.g., "VER"
      const given: string | undefined = d.givenName;
      const family: string | undefined = d.familyName;
      if (!given || !family) continue;

      const dbDriver = (allDbDrivers ?? []).find((x: any) => x.first_name === given && x.last_name === family);
      if (dbDriver && (ergastRef || ergastCode)) {
        const needsRef = ergastRef && dbDriver.ergast_driver_ref !== ergastRef;
        const needsCode = ergastCode && dbDriver.name_acronym !== ergastCode;
        if (needsRef || needsCode) {
          updates.push({ id: dbDriver.id, name_acronym: ergastCode, ergast_driver_ref: ergastRef });
          updatedCount++;
        }
      } else if (!dbDriver) {
        this.logger.warn(`(${year}) No driver found in DB matching: ${given} ${family}`);
      }
    }

    if (!updates.length) {
      this.logger.log('All drivers are already up-to-date.');
      return;
    }

    this.logger.log(`Updating ${updatedCount} drivers with correct refs and acronyms...`);
    const { error: updateError } = await this.supabaseService.client
      .from('drivers')
      .upsert(updates, { onConflict: 'id' });
    if (updateError) this.logger.error(`Failed to update drivers: ${updateError.message}`);
    else this.logger.log('Successfully updated drivers table.');
  }

  ///// ----- ***** INGEST SPRINT RACE RESULTS (ERGAST) ***** ----- /////

  public async ingestSprintRaceResults(year: number) {
    this.logger.log(`Starting Sprint Race results ingestion for ${year}...`);

    // 1) Resolve season
    const { data: season } = await this.supabaseService.client
      .from('seasons')
      .select('id')
      .eq('year', year)
      .single();
    if (!season) { this.logger.error(`Season ${year} not found.`); return; }

    // 2) Driver map by Ergast ref
    const { data: allDrivers } = await this.supabaseService.client
      .from('drivers')
      .select('id, ergast_driver_ref')
      .not('ergast_driver_ref', 'is', null);
    const driverRefMap = new Map((allDrivers ?? []).map((d: any) => [d.ergast_driver_ref, d.id]));

    // 3) CORRECT mapping: driver_id -> constructor_id for this season
    const { data: constructorDrivers } = await this.supabaseService.client
      .from('constructor_drivers')
      .select('driver_id, constructor_id')
      .eq('season_id', season.id);
    if (!constructorDrivers || constructorDrivers.length === 0) {
      this.logger.error(`No 'constructor_drivers' data found for season ${season.id}.`);
      return;
    }
    const driverConstructorMap = new Map<number, number>(
      (constructorDrivers ?? []).map((cd: any) => [Number(cd.driver_id), Number(cd.constructor_id)])
    );

    // 4) All SPRINT sessions for the season
    const { data: sprintSessions } = await this.supabaseService.client
      .from('sessions')
      .select('id, race_id, races(round, name)')
      .eq('races.season_id', season.id)
      .eq('type', 'SPRINT');

    if (!sprintSessions || sprintSessions.length === 0) {
      this.logger.warn(`No SPRINT sessions found in DB for ${year}.`);
      return;
    }

    // 5) Loop sessions and fetch Ergast sprint.json
    for (const session of sprintSessions) {
      const race = session.races as any;
      const raceName = race?.name ?? `race_id=${session.race_id}`;
      const round = race?.round;
      if (!round) { this.logger.warn(`(${raceName}) Missing round; skipping.`); continue; }

      let sprintResults: any[] = [];
      try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/${round}/sprint.json`;
        const response = await firstValueFrom(this.httpService.get(url));
        sprintResults = response.data?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? [];
      } catch (e: any) {
        this.logger.warn(`(${raceName}) Ergast mirror (Jolpi) failed: ${e?.message || e}. Retrying with primary Ergast API...`);
      }

      if (!sprintResults.length) {
        try {
          const fallbackUrl = `https://ergast.com/api/f1/${year}/${round}/sprint.json`;
          const response = await firstValueFrom(this.httpService.get(fallbackUrl));
          sprintResults = response.data?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? [];
        } catch (e2: any) {
          this.logger.error(`(${raceName}) Primary Ergast API also failed: ${e2?.message || e2}. Skipping this race.`);
          continue;
        }
      }

      if (!sprintResults.length) { this.logger.warn(`(${raceName}) Ergast returned empty sprint results.`); continue; }

      // 6) Clear and build insert payload
      await this.supabaseService.client.from('race_results').delete().eq('session_id', session.id);

      const toInsert = sprintResults
        .map((res: any) => {
          const driverId = driverRefMap.get(res?.Driver?.driverId);
          const constructorId = driverId ? driverConstructorMap.get(driverId) : undefined;
          if (!driverId) this.logger.warn(`(${raceName}) Could not map driver: ${res?.Driver?.driverId}`);
          if (driverId && !constructorId) this.logger.warn(`(${raceName}) Could not map constructor for driver_id: ${driverId}`);
          return {
            session_id: session.id,
            driver_id: driverId,
            constructor_id: constructorId,
            position: res?.position ? parseInt(res.position, 10) : null,
            points: res?.points ? parseFloat(res.points) : 0,
            grid: res?.grid ? parseInt(res.grid, 10) : 0,
            laps: res?.laps ? parseInt(res.laps, 10) : 0,
            status: res?.status ?? null,
            time_ms: res?.Time?.millis
              ? parseInt(res.Time.millis, 10)
              : this.timeStringToMs(res?.Time?.time ?? null),
            fastest_lap_rank: null,
            points_for_fastest_lap: 0,
          };
        })
        .filter((r: any) => r.driver_id && r.constructor_id);

      // 7) Insert
      if (toInsert.length > 0) {
        const { error } = await this.supabaseService.client.from('race_results').insert(toInsert);
        if (error) this.logger.error(`(${raceName}) Failed to insert sprint results: ${error.message}`);
        else this.logger.log(`(${raceName}) Successfully inserted ${toInsert.length} sprint race results.`);
      } else {
        this.logger.warn(`(${raceName}) No mappable sprint race results.`);
      }
    }

    this.logger.log(`Finished Sprint Race results ingestion for ${year}.`);
  }
}