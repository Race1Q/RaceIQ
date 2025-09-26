import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';
import { countryCodeMap, nationalityToCountryCodeMap } from '../mapping/countries';

// Generic interfaces to handle the nested structure of the Ergast API response
interface ErgastTable {
  [key: string]: any[];
}
interface ErgastApiResponse {
  MRData: {
    total: string;
    limit: string;
    offset: string;
    [tableKey: string]: ErgastTable | any; // The table data is nested under a dynamic key
  };
}
interface ApiCircuit {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  }

interface ApiConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

interface ApiDriver {
    driverId: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
    permanentNumber?: string;
    code?: string; // This is the 3-letter acronym
  }

interface ApiRace {
    season: string;
    round: string;
    url: string;
    raceName: string;
    Circuit: {
      circuitId: string;
    };
    date: string;
    time?: string;
  }

interface ApiResult {
    number: string;
    position: string;
    points: string;
    Driver: { driverId: string; };
    Constructor: { constructorId: string; name: string; };
    grid: string;
    laps: string;
    status: string;
    Time?: { time: string; };
  }
  
interface ApiQualifyingResult {
    number: string;
    position: string;
    Driver: { driverId: string; };
    Constructor: { constructorId: string; name: string; };
    Q1?: string;
    Q2?: string;
    Q3?: string;
}
  
interface ApiLap {
    number: string;
    Timings: { driverId: string; position: string; time: string; }[];
}
  
interface ApiPitStop {
    driverId: string;
    stop: string;
    lap: string;
    duration: string;
}

interface ApiDriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: { driverId: string; };
}

interface ApiConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string; };
}


type RaceWithSeason = { id: number; round: number; year: { year: number; }; };

@Injectable()
export class ErgastService {
  private readonly logger = new Logger(ErgastService.name);
  private readonly apiBaseUrl = 'https://api.jolpi.ca/ergast/f1';

  // --- CONFIGURATION ---
  private readonly startYear = 2000;
  private readonly endYear = 2025; // Allow foundational scripts to run for all years 
  private readonly pageLimit = 100; // A higher page limit for faster bulk ingestion

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Main orchestrator method to run the entire Ergast ingestion process.
   */
  public async ingestErgastData() {
    this.logger.log('--- Starting Ergast Historical Data Ingestion (2000-2022) ---');
    
    await this.ingestSeasons();
    await this.ingestCircuits();
    await this.ingestConstructors();
    await this.ingestDrivers();
    await this.ingestRacesAndSessions();
    await this.ingestAllResults();
    await this.ingestAllStandings();
    
    this.logger.log('--- Completed Ergast Historical Data Ingestion ---');
  }

  /**
   * Populates the `seasons` table.
   */
  public async ingestSeasons() {
    this.logger.log('Ingesting Seasons...');
    const seasonsToUpsert: { year: number }[] = [];
    for (let year = this.startYear; year <= this.endYear; year++) {
      seasonsToUpsert.push({ year });
    }

    const { error } = await this.supabaseService.client
      .from('seasons')
      .upsert(seasonsToUpsert, { onConflict: 'year' });

    if (error) {
      this.logger.error('Failed to upsert seasons', error.stack);
      throw new Error('Failed to upsert seasons');
    }

    this.logger.log(`Successfully ingested ${seasonsToUpsert.length} seasons.`);
  }

  /**
   * Populates the `circuits` and `countries` tables.
   */
  public async ingestCircuits() {
    this.logger.log('Ingesting Circuits...');
    const circuits = await this.fetchAllErgastPages<ApiCircuit>('/circuits');
    if (!circuits || circuits.length === 0) {
      this.logger.warn('No circuits found from API. Skipping.');
      return;
    }

    const { data: existingCountries, error: countryError } =
      await this.supabaseService.client.from('countries').select('country_code');
    if (countryError) {
      this.logger.error('Failed to fetch existing countries', countryError);
      throw new Error('Failed to fetch existing countries');
    }
    const countryCodeSet = new Set(existingCountries.map(c => c.country_code));
    const newCountriesToInsert: { country_code: string; country_name: string }[] = [];

    const circuitsToUpsert = circuits.map(circuit => {
      const countryName = circuit.Location.country;
      const countryCode = countryCodeMap[countryName] || countryName.substring(0, 3).toUpperCase();
      
      if (!countryCodeSet.has(countryCode)) {
        countryCodeSet.add(countryCode); 
        newCountriesToInsert.push({ country_code: countryCode, country_name: countryName });
      }

      return {
        name: circuit.circuitName,
        location: circuit.Location.locality,
        country_code: countryCode,
        map_url: circuit.url,
        length_km: null,
        race_distance_km: null,
      };
    });

    if (newCountriesToInsert.length > 0) {
      this.logger.log(`Found ${newCountriesToInsert.length} new countries to insert.`);
      const { error } = await this.supabaseService.client
        .from('countries')
        .insert(newCountriesToInsert);

      if (error) {
        this.logger.error('Failed to insert new countries', { error, newCountriesToInsert });
        throw new Error('Failed to insert new countries');
      }
    }

    const { error } = await this.supabaseService.client
      .from('circuits')
      .upsert(circuitsToUpsert, { onConflict: 'name' });

    if (error) {
      this.logger.error('Failed to upsert circuits. Supabase error:', error); 
      throw new Error('Failed to upsert circuits');
    }

    this.logger.log(`Successfully ingested ${circuitsToUpsert.length} circuits.`);
  }

  public async ingestConstructors() {
    this.logger.log('Ingesting All Unique Constructors...');

    // 1. Make a single, efficient call to get all constructors
    const uniqueConstructors = await this.fetchAllErgastPages<ApiConstructor>(
      '/constructors',
    );

    if (!uniqueConstructors || uniqueConstructors.length === 0) {
      this.logger.error('Could not fetch any constructors from the API. Aborting.');
      throw new Error('Failed to fetch constructors from API.');
    }

    // 2. Transform the API data into the format for our DB
    const constructorsToUpsert = uniqueConstructors
      .filter(c => c && c.name) // Safety filter for bad data
      .map((c) => ({
        name: c.name,
        nationality: c.nationality,
        url: c.url,
      }));

    // 3. Perform a single bulk upsert operation
    const { error } = await this.supabaseService.client
      .from('constructors')
      .upsert(constructorsToUpsert, { onConflict: 'name' });

    if (error) {
      this.logger.error('Failed to upsert constructors. Supabase error:', error);
      throw new Error('Failed to upsert constructors');
    }

    this.logger.log(
      `Successfully ingested ${constructorsToUpsert.length} unique constructors.`,
    );
  }

  public async ingestDrivers() {
    this.logger.log('Ingesting All Unique Drivers...');

    // 1. Fetch all drivers from the API
    const uniqueDrivers = await this.fetchAllErgastPages<ApiDriver>('/drivers');

    if (!uniqueDrivers || uniqueDrivers.length === 0) {
      this.logger.error('Could not fetch any drivers from the API. Aborting.');
      throw new Error('Failed to fetch drivers from API.');
    }
    
    // 2. Transform the API data to match our DB schema
    const driversToUpsert = uniqueDrivers
      .filter(d => d && d.driverId)
      .map((d) => {
        // --- FIX: Use the correct map to look up nationality ---
        const countryCode = nationalityToCountryCodeMap[d.nationality] || null;

        // Log a warning if a nationality from the API can't be mapped
        // This helps identify if we need to add new entries to our map
        if (!countryCode) {
          this.logger.warn(`Could not map nationality "${d.nationality}" to a country code for driver ${d.driverId}.`);
        }

        return {
          ergast_driver_ref: d.driverId,
          driver_number: d.permanentNumber ? parseInt(d.permanentNumber, 10) : null,
          first_name: d.givenName,
          last_name: d.familyName,
          name_acronym: d.code,
          country_code: countryCode, // Use the mapped code
          date_of_birth: d.dateOfBirth,
        };
      });

    // 3. Perform a single bulk upsert for all drivers
    // Note: The logic to dynamically insert new countries has been removed
    // as it's more robust to maintain a complete list in our mapping file.
    const { error } = await this.supabaseService.client
      .from('drivers')
      .upsert(driversToUpsert, { onConflict: 'ergast_driver_ref' });

    if (error) {
      this.logger.error('Failed to upsert drivers. Supabase error:', error);
      throw new Error('Failed to upsert drivers');
    }

    this.logger.log(`Successfully ingested ${driversToUpsert.length} unique drivers.`);
  }

  public async ingestRacesAndSessions() {
    this.logger.log('Ingesting Races and Sessions...');

    // 1. Pre-fetch all seasons and circuits from our DB for efficient lookups
    const { data: seasons } = await this.supabaseService.client.from('seasons').select('id, year');
    const seasonsMap = new Map((seasons ?? []).map(s => [s.year, s.id]));

    const { data: circuits } = await this.supabaseService.client.from('circuits').select('id, name');
    const circuitsMap = new Map((circuits ?? []).map(c => [c.name, c.id]));

    const allRacesToInsert: any[] = [];

    // 2. Loop through each season to fetch its races
    for (let year = this.startYear; year <= this.endYear; year++) {
      this.logger.log(`Fetching races for season ${year}...`);
      const apiRaces = await this.fetchAllErgastPages<ApiRace>(`/${year}/races`);
      
      const seasonId = seasonsMap.get(year);
      if (!seasonId) {
        this.logger.warn(`Could not find season ID for year ${year}. Skipping races.`);
        continue;
      }

      for (const apiRace of apiRaces) {
        // FIX: Add a safety check to ensure apiRace.Circuit exists before using it
        if (!apiRace || !apiRace.Circuit) {
          this.logger.warn(`Skipping a race in season ${year} due to missing Circuit data.`);
          continue; // Skip to the next race
        }

        const circuitDetails = await this.fetchAllErgastPages<ApiCircuit>(`/circuits/${apiRace.Circuit.circuitId}`);
        if (!circuitDetails || circuitDetails.length === 0) continue;

        const circuitName = circuitDetails[0]?.circuitName;
        const circuitId = circuitsMap.get(circuitName);

        if (!circuitId) {
          this.logger.warn(`Could not find circuit ID for circuit '${circuitName}'. Skipping race.`);
          continue;
        }

        allRacesToInsert.push({
          season_id: seasonId,
          circuit_id: circuitId,
          round: parseInt(apiRace.round, 10),
          name: apiRace.raceName,
          date: apiRace.date,
          time: apiRace.time ? apiRace.time.replace('Z', '') : null,
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between seasons
    }

    // 3. Insert all races and get their new IDs back
    const { data: insertedRaces, error: racesError } = await this.supabaseService.client
      .from('races')
      .insert(allRacesToInsert)
      .select();

    if (racesError) {
      this.logger.error('Failed to insert races. Supabase error:', racesError);
      throw new Error('Failed to insert races');
    }
    this.logger.log(`Successfully inserted ${(insertedRaces ?? []).length} races.`);

    // 4. Create session records for each race we just inserted
    const allSessionsToInsert: { race_id: number; type: string }[] = [];
    for (const race of (insertedRaces ?? [])) {
      allSessionsToInsert.push({ race_id: race.id, type: 'QUALIFYING' });
      allSessionsToInsert.push({ race_id: race.id, type: 'RACE' });
    }

    // 5. Insert all sessions
    const { error: sessionsError } = await this.supabaseService.client
      .from('sessions')
      .insert(allSessionsToInsert);

    if (sessionsError) {
      this.logger.error('Failed to insert sessions. Supabase error:', sessionsError);
      throw new Error('Failed to insert sessions');
    }
    this.logger.log(`Successfully inserted ${allSessionsToInsert.length} sessions.`);
  }

  ///////// ----- ***** INGEST ALL RESULTS ***** ----- /////////
  ///////// ----- ***** INGEST ALL RESULTS ***** ----- /////////
  ///////// ----- ***** INGEST ALL RESULTS ***** ----- /////////

  public async ingestAllResults() {
    this.logger.log('Ingesting ALL historical results (Races, Quali, Laps, Pits)...');

    // 1. Pre-fetch all necessary IDs from our DB for efficient lookups.
    const { data: relevantSeasons } = await this.supabaseService.client
      .from('seasons')
      .select('id')
      .gte('year', this.startYear)
      .lte('year', 2022); // HARD-CODED to stop at 2022

    if (!relevantSeasons || relevantSeasons.length === 0) {
        this.logger.error('No seasons found in the database. Cannot ingest results.');
        return;
    }
    const seasonIds = relevantSeasons.map(s => s.id);

    // Step 1b: Fetch all races that belong to those season IDs.
    const { data: races } = await this.supabaseService.client
        .from('races')
        .select('id, round, season:seasons(year)') // We still need the year for the API call
        .in('season_id', seasonIds)
        .order('season_id', { ascending: true })
        .order('round', { ascending: true })
        .returns<any[]>(); // Using a simpler type here


    const { data: sessions } = await this.supabaseService.client.from('sessions').select('id, race_id, type');
    const { data: drivers } = await this.supabaseService.client.from('drivers').select('id, ergast_driver_ref');
    const { data: constructors } = await this.supabaseService.client.from('constructors').select('id, name');

    const sessionMap = new Map<string, number>();
    for (const s of (sessions ?? [])) { sessionMap.set(`${s.race_id}-${s.type}`, s.id); }
    const driverMap = new Map((drivers ?? []).map(d => [d.ergast_driver_ref, d.id]));
    const constructorMap = new Map((constructors ?? []).map(c => [c.name, c.id]));

    // 2. Loop through each race and fetch its detailed results
    for (const race of (races ?? [])) {
      const year = Array.isArray(race.season) ? race.season[0]?.year : race.season?.year;
      const round = race.round;
      this.logger.log(`--- Processing results for ${year} Round ${round}... ---`);

        try {
            const raceSessionId = sessionMap.get(`${race.id}-RACE`);
            const qualiSessionId = sessionMap.get(`${race.id}-QUALIFYING`);

            // DELETE existing data for this race to make the script rerunnable
            if (raceSessionId) await this.supabaseService.client.from('race_results').delete().eq('session_id', raceSessionId);
            if (qualiSessionId) await this.supabaseService.client.from('qualifying_results').delete().eq('session_id', qualiSessionId);
            await this.supabaseService.client.from('laps').delete().eq('race_id', race.id);
            await this.supabaseService.client.from('pit_stops').delete().eq('race_id', race.id);
    
            // Arrays to hold data for THIS RACE ONLY
            const raceResultsToInsert: any[] = [];
            const qualiResultsToInsert: any[] = [];
            const lapsToInsert: any[] = [];
            const pitStopsToInsert: any[] = [];

            // Fetch & Transform Race Results
            if (raceSessionId) {
              
              // // ================== NEW DEBUGGING CODE START ==================
              // this.logger.log(`--- DEBUG: Fetching /results for ${year} R${round}`);
              const apiRaceResultsData = await this.fetchAllErgastPages<any>(`/${year}/${round}/results`);
              
              // this.logger.log(`--- DEBUG: RAW RESPONSE for /results ---`);
              // console.log(JSON.stringify(apiRaceResultsData, null, 2));
              // // =================== NEW DEBUGGING CODE END ===================
            
              const apiRaceResults = apiRaceResultsData[0]?.Results || [];
              if (apiRaceResults.length === 0) {
                this.logger.warn(`--- DEBUG: Received 0 race results. Raw API response for /results:`);
                console.log(JSON.stringify(apiRaceResultsData, null, 2));
              }      
              for (const res of apiRaceResults) {
                  if (!res || !res.Driver || !res.Constructor) continue;
                  raceResultsToInsert.push({
                      session_id: raceSessionId,
                      driver_id: driverMap.get(res.Driver.driverId),
                      constructor_id: constructorMap.get(res.Constructor.name),
                      position: parseInt(res.position, 10),
                      points: parseFloat(res.points),
                      grid: parseInt(res.grid, 10),
                      laps: parseInt(res.laps, 10),
                      status: res.status,
                      // FIX: Add the missing time_ms calculation
                      time_ms: this.laptimeToMilliseconds(res.Time?.time),
                  });
              }
          }
    
            // Fetch & Transform Qualifying Results
            if (qualiSessionId) {
                const apiQualiResultsData = await this.fetchAllErgastPages<any>(`/${year}/${round}/qualifying`);
                const apiQualiResults = apiQualiResultsData[0]?.QualifyingResults || [];
                if (apiQualiResults.length === 0) {
                  this.logger.warn(`--- DEBUG: Received 0 qualifying results. Raw API response for /qualifying:`);
                  console.log(JSON.stringify(apiQualiResultsData, null, 2));
              }
                for (const res of apiQualiResults) {
                    if (!res || !res.Driver || !res.Constructor) continue;
                        qualiResultsToInsert.push({
                            session_id: qualiSessionId,
                            driver_id: driverMap.get(res.Driver.driverId),
                            constructor_id: constructorMap.get(res.Constructor.name),
                            position: parseInt(res.position, 10),
                            q1_time_ms: this.laptimeToMilliseconds(res.Q1),
                            q2_time_ms: this.laptimeToMilliseconds(res.Q2),
                            q3_time_ms: this.laptimeToMilliseconds(res.Q3),
                        });
                }
            }
            
            // Fetch & Transform Lap Times
            const apiLapsData = await this.fetchAllErgastPages<any>(`/${year}/${round}/laps`);
            const apiLaps = apiLapsData[0]?.Laps || [];
            for (const lap of apiLaps) {
                if (!lap || !lap.Timings) continue;
                for (const timing of lap.Timings) {
                    lapsToInsert.push({
                        race_id: race.id,
                        driver_id: driverMap.get(timing.driverId),
                        lap_number: parseInt(lap.number, 10),
                        position: parseInt(timing.position, 10),
                        time_ms: this.laptimeToMilliseconds(timing.time),
                    });
                }
            }
            
            // Fetch & Transform Pit Stops
            const apiPitStopsData = await this.fetchAllErgastPages<any>(`/${year}/${round}/pitstops`);
            const apiPitStops = apiPitStopsData[0]?.PitStops || [];
            for (const stop of apiPitStops) {
                if (!stop || !stop.driverId) continue;
                pitStopsToInsert.push({
                    race_id: race.id,
                    driver_id: driverMap.get(stop.driverId),
                    stop_number: parseInt(stop.stop, 10),
                    lap_number: parseInt(stop.lap, 10),
                    stationary_duration_ms: Math.round(parseFloat(stop.duration) * 1000),
                });
            }

            // 3. Insert the data for THIS RACE with proper logging and error checking
            this.logger.log(`Found ${raceResultsToInsert.length} race results to insert.`);
            if (raceResultsToInsert.length > 0) {
            const { error } = await this.supabaseService.client.from('race_results').insert(raceResultsToInsert);
            if (error) throw new Error(`Race results insert failed: ${JSON.stringify(error)}`);
            }

            this.logger.log(`Found ${qualiResultsToInsert.length} qualifying results to insert.`);
            if (qualiResultsToInsert.length > 0) {
            const { error } = await this.supabaseService.client.from('qualifying_results').insert(qualiResultsToInsert);
            if (error) throw new Error(`Quali results insert failed: ${JSON.stringify(error)}`);
            }
            
            this.logger.log(`Found ${lapsToInsert.length} laps to insert.`);
            if (lapsToInsert.length > 0) {
            const { error } = await this.supabaseService.client.from('laps').insert(lapsToInsert);
            if (error) throw new Error(`Laps insert failed: ${JSON.stringify(error)}`);
            }

            this.logger.log(`Found ${pitStopsToInsert.length} pit stops to insert.`);
            if (pitStopsToInsert.length > 0) {
            const { error } = await this.supabaseService.client.from('pit_stops').insert(pitStopsToInsert);
            if (error) throw new Error(`Pit stops insert failed: ${JSON.stringify(error)}`);
            }

            this.logger.log(`Successfully processed ${year} Round ${round}.`);

        } catch (error) {
            this.logger.error(`Failed to process results for ${year} Round ${round}. Skipping.`, error.stack);
        }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    this.logger.log('--- Successfully ingested all historical results. ---');
  }


  ///////// ----- ***** INGEST ALL STANDINGS ***** ----- /////////
  ///////// ----- ***** INGEST ALL STANDINGS ***** ----- /////////
  ///////// ----- ***** INGEST ALL STANDINGS ***** ----- /////////

  public async ingestAllStandings() {
    this.logger.log('Ingesting All Historical Standings (2000-2022)...');

    // 1. Pre-fetch all necessary IDs from our DB for efficient lookups.
    const { data: drivers } = await this.supabaseService.client.from('drivers').select('id, ergast_driver_ref');
    const { data: constructors } = await this.supabaseService.client.from('constructors').select('id, name');
    const { data: seasons } = await this.supabaseService.client.from('seasons').select('id, year');
    const { data: races } = await this.supabaseService.client.from('races').select('id, round, season_id');

    // === DIAGNOSTIC LOGS START HERE ===
    this.logger.log('--- INSPECTING FETCHED DATA ---');
    if (seasons && seasons.length > 0) {
      this.logger.log(`Found ${seasons.length} seasons. Sample season object:`, JSON.stringify(seasons[0]));
    } else {
      this.logger.error('Could not fetch any seasons from the database!');
    }
    if (races && races.length > 0) {
      this.logger.log(`Found ${races.length} races. Sample race object:`, JSON.stringify(races[0]));
    } else {
      this.logger.error('Could not fetch any races from the database!');
    }
    // === DIAGNOSTIC LOGS END HERE ===

    const driverMap = new Map((drivers ?? []).map(d => [d.ergast_driver_ref, d.id]));
    const constructorMap = new Map((constructors ?? []).map(c => [c.name, c.id]));
    const seasonIdToYearMap = new Map((seasons ?? []).map(s => [s.id, s.year]));
    
    const finalRaceIdMap = new Map<number, number>();
    const latestRoundForYear = new Map<number, number>();

    for (const race of (races ?? [])) {
      const year = seasonIdToYearMap.get(race.season_id);
      if (!year || year < this.startYear || year > this.endYear) continue;

      const currentHighestRound = latestRoundForYear.get(year) || 0;
      if (race.round > currentHighestRound) {
        latestRoundForYear.set(year, race.round);
        finalRaceIdMap.set(year, race.id);
      }
    }
    
    const allDriverStandings: any[] = [];
    const allConstructorStandings: any[] = [];
    
    await this.supabaseService.client.from('driver_standings').delete().gte('id', 0);
    await this.supabaseService.client.from('constructor_standings').delete().gte('id', 0);

    // 3. Loop through each season and fetch its standings
    for (let year = this.startYear; year <= this.endYear; year++) {
      this.logger.log(`Fetching standings for ${year}...`);
      const finalRaceId = finalRaceIdMap.get(year);
      if (!finalRaceId) {
        this.logger.warn(`No final race found for ${year}, skipping standings.`);
        continue;
      }

      // Fetch Driver Standings
      const driverStandingsData = await this.fetchAllErgastPages<any>(`/${year}/driverStandings`);
      if (driverStandingsData && driverStandingsData.length > 0) {
        // FIX: Simplified the data extraction to match the JSON structure
        const apiDriverStandings = driverStandingsData[0]?.DriverStandings || [];
        for (const standing of apiDriverStandings) {
          allDriverStandings.push({
            race_id: finalRaceId,
            driver_id: driverMap.get(standing.Driver.driverId),
            points: parseFloat(standing.points),
            position: parseInt(standing.position, 10),
            wins: parseInt(standing.wins, 10),
          });
        }
      }

      // Fetch Constructor Standings
      const constructorStandingsData = await this.fetchAllErgastPages<any>(`/${year}/constructorStandings`);
      if (constructorStandingsData && constructorStandingsData.length > 0) {
        // FIX: Simplified the data extraction to match the JSON structure
        const apiConstructorStandings = constructorStandingsData[0]?.ConstructorStandings || [];
        for (const standing of apiConstructorStandings) {
          allConstructorStandings.push({
            race_id: finalRaceId,
            constructor_id: constructorMap.get(standing.Constructor.name),
            points: parseFloat(standing.points),
            position: parseInt(standing.position, 10),
            wins: parseInt(standing.wins, 10),
          });
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Perform bulk inserts
    this.logger.log(`Inserting ${allDriverStandings.length} driver standing records...`);
    if (allDriverStandings.length > 0) {
      const { error } = await this.supabaseService.client.from('driver_standings').insert(allDriverStandings);
      if (error) throw new Error(`Driver standings insert failed: ${JSON.stringify(error)}`);
    }

    this.logger.log(`Inserting ${allConstructorStandings.length} constructor standing records...`);
    if (allConstructorStandings.length > 0) {
      const { error } = await this.supabaseService.client.from('constructor_standings').insert(allConstructorStandings);
      if (error) throw new Error(`Constructor standings insert failed: ${JSON.stringify(error)}`);
    }
    
    this.logger.log('Successfully ingested all historical standings.');
  }

  // ///////// ----- ***** FIX MISSING RACE TIMES ***** ----- /////////
  // ///////// ----- ***** FIX MISSING RACE TIMES ***** ----- /////////
  // ///////// ----- ***** FIX MISSING RACE TIMES ***** ----- /////////

  // public async fixMissingRaceTimes() {
  //   this.logger.log('--- Starting: Fix Missing Race Result Times ---');

  //   // 1. Pre-fetch all necessary IDs
  //   const { data: races } = await this.supabaseService.client.from('races').select('id, round, season:seasons(year)').returns<any[]>();
  //   const { data: sessions } = await this.supabaseService.client.from('sessions').select('id, race_id, type');
  //   const { data: drivers } = await this.supabaseService.client.from('drivers').select('id, ergast_driver_ref');
  //   const { data: constructors } = await this.supabaseService.client.from('constructors').select('id, name');

  //   const sessionMap = new Map<string, number>();
  //   (sessions ?? []).forEach(s => sessionMap.set(`${s.race_id}-${s.type}`, s.id));
  //   const driverMap = new Map((drivers ?? []).map(d => [d.ergast_driver_ref, d.id]));
  //   const constructorMap = new Map((constructors ?? []).map(c => [c.name, c.id]));

  //   // 2. Loop through each race, deleting and re-inserting its results
  //   for (const race of (races ?? [])) {
  //     const year = race.season?.year;
  //     const round = race.round;
  //     if (!year || year < this.startYear || year > this.endYear) continue;

  //     this.logger.log(`Fixing race results for ${year} Round ${round}...`);
  //     const raceSessionId = sessionMap.get(`${race.id}-RACE`);

  //     if (!raceSessionId) {
  //       this.logger.warn(`No RACE session found for ${year} Round ${round}. Skipping.`);
  //       continue;
  //     }

  //     try {
  //       // Fetch the results for this specific race
  //       const apiRaceResultsData = await this.fetchAllErgastPages<any>(`/${year}/${round}/results`);
  //       const apiRaceResults = apiRaceResultsData[0]?.Results || [];
        
  //       if (apiRaceResults.length === 0) {
  //           this.logger.log('No results found from API. Nothing to fix.');
  //           continue;
  //       }

  //       const raceResultsToInsert = apiRaceResults
  //         .filter(res => res && res.Driver && res.Constructor)
  //         .map(res => ({
  //           session_id: raceSessionId,
  //           driver_id: driverMap.get(res.Driver.driverId),
  //           constructor_id: constructorMap.get(res.Constructor.name),
  //           position: parseInt(res.position, 10),
  //           points: parseFloat(res.points),
  //           grid: parseInt(res.grid, 10),
  //           laps: parseInt(res.laps, 10),
  //           status: res.status,
  //           time_ms: this.laptimeToMilliseconds(res.Time?.time),
  //         }));

  //       // Perform the safe delete-then-insert operation for this race
  //       await this.supabaseService.client.from('race_results').delete().eq('session_id', raceSessionId);
        
  //       const { error } = await this.supabaseService.client.from('race_results').insert(raceResultsToInsert);
  //       if (error) throw new Error(`Insert failed: ${JSON.stringify(error)}`);

  //       this.logger.log(`Successfully fixed ${raceResultsToInsert.length} results for ${year} Round ${round}.`);

  //     } catch (error) {
  //       this.logger.error(`Failed to fix results for ${year} Round ${round}. Skipping.`, error.stack);
  //     }
      
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //   }

  //   this.logger.log('--- Finished: Race result times have been fixed. ---');
  // }


  // *** HELPER FUNCTIONS *** // // *** HELPER FUNCTIONS *** // // *** HELPER FUNCTIONS *** // // *** HELPER FUNCTIONS *** // 

  private laptimeToMilliseconds(time: string | undefined): number | null {
    if (!time) return null;
    const parts = time.split(/[:.]/);
    if (parts.length < 2) return null;

    let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;

    if (parts.length === 4) { // H:MM:SS.mmm
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseInt(parts[2], 10);
      milliseconds = parseInt(parts[3], 10);
    } else if (parts.length === 3) { // MM:SS.mmm
      minutes = parseInt(parts[0], 10);
      seconds = parseInt(parts[1], 10);
      milliseconds = parseInt(parts[2], 10);
    } else { // SS.mmm
      seconds = parseInt(parts[0], 10);
      milliseconds = parseInt(parts[1], 10);
    }

    return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
  }

  private async fetchAllErgastPages<T>(endpoint: string, attempt = 0): Promise<T[]> {
    const allData: T[] = [];
    let offset = 0;

    while (true) {
      const url = `${this.apiBaseUrl}${endpoint}.json?limit=${this.pageLimit}&offset=${offset}`;
      try {
        const response = await firstValueFrom(this.httpService.get<ErgastApiResponse>(url));
        const mrData = response.data.MRData;

        const tableKey = Object.keys(mrData).find(key => key.endsWith('Table'));
        if (!tableKey) break;

        const dataKey = Object.keys(mrData[tableKey]).find(key => Array.isArray(mrData[tableKey][key]));
        if (!dataKey) break;

        const pageData = mrData[tableKey][dataKey] as T[];
        if (!pageData || pageData.length === 0) break;

        allData.push(...pageData);

        // --- THIS IS THE FIX ---
        // If the endpoint is NOT for laps, we trust the 'total' field and can break early.
        if (!endpoint.includes('/laps')) {
          if (allData.length >= parseInt(mrData.total)) {
            break;
          }
        }
        // If it IS a /laps endpoint, we explicitly ignore the 'total' field
        // (because we know it's broken) and force the loop to continue
        // until the API returns an empty pageData array (the check at the top of the loop).

        offset += this.pageLimit;
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        if (error.response?.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          this.logger.warn(`Rate limited. Waiting ${waitTime.toFixed(0)}ms before retrying...`);
          await new Promise((r) => setTimeout(r, waitTime));
          // Note: We are not incrementing the offset, so this will retry the SAME page
          continue; 
        }

        // --- THIS IS THE FIX ---
        // Instead of returning partial data, throw an error to cancel the operation for this race.
        this.logger.error(
          `A non-429 network error occurred while fetching from ${url}. Aborting fetch for this endpoint. Error: ${error.message}`
        );
        throw new Error(`Failed to fetch complete dataset from ${endpoint} due to network error.`);
      }
    }
    return allData;
  }
}