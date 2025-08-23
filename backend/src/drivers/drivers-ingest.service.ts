// src/drivers/drivers-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { DriverRow } from './drivers.service';

interface ApiDriver {
  driverId: string;
  url: string;
  givenName: string;
  familyName: string;
  permanentNumber?: string;
  code: string;
  nationality: string;
  dateOfBirth: string;
}

interface ApiResponse {
  MRData: {
    DriverTable: {
      Drivers: ApiDriver[];
    };
  };
}

@Injectable()
export class DriversIngestService {
  private readonly logger = new Logger(DriversIngestService.name);

  // Mapping from full country names to 3-letter country codes
  private readonly countryCodeMap = {
    'British': 'GBR',
    'Dutch': 'NLD',
    'Mexican': 'MEX',
    'Monegasque': 'MCO',
    'Spanish': 'ESP',
    'French': 'FRA',
    'German': 'DEU',
    'Finnish': 'FIN',
    'Australian': 'AUS',
    'Japanese': 'JPN',
    'Thai': 'THA',
    'Canadian': 'CAN',
    'American': 'USA',
    'Danish': 'DNK',
    'Chinese': 'CHN',
    'New Zealander': 'NZL',
    'Swiss': 'CHE',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async fetchDriversFromAPI(): Promise<ApiDriver[]> {
    try {
      this.logger.log('Fetching drivers from API');
      const apiUrl = 'https://api.jolpi.ca/ergast/f1/2025/drivers.json';
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));

      const drivers = response.data.MRData.DriverTable.Drivers;
      this.logger.log(`Number of drivers: ${drivers.length}`);

      return drivers;
    } catch (error) {
      this.logger.error('Failed to fetch drivers from API', error.message);
      throw new Error('Failed to fetch drivers data');
    }
  }

  async ingestDrivers(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    const apiDrivers = await this.fetchDriversFromAPI();

    for (const apiDriver of apiDrivers) {
      const countryCode = this.countryCodeMap[apiDriver.nationality] || null;

      // Check if the country code exists in the 'countries' table
      if (countryCode) {
        const { data: existingCountry, error: countrySelectError } = await this.supabaseService.client
          .from('countries')
          .select('country_code')
          .eq('country_code', countryCode)
          .single();

        if (countrySelectError && countrySelectError.code !== 'PGRST116') {
          this.logger.error(`Error checking country code ${countryCode}:`, countrySelectError.message);
          throw new Error(`Country check failed: ${countrySelectError.message}`);
        }

        // If the country does not exist, create it
        if (!existingCountry) {
          const { error: countryInsertError } = await this.supabaseService.client
            .from('countries')
            .insert({ country_code: countryCode, country_name: apiDriver.nationality });
          
          if (countryInsertError) {
            this.logger.error(`Failed to create country ${apiDriver.nationality}:`, countryInsertError.message);
            throw new Error(`Country creation failed: ${countryInsertError.message}`);
          }
          this.logger.log(`Created new country: ${apiDriver.nationality} (${countryCode})`);
        }
      }

      const driverData = {
        driver_number: apiDriver.permanentNumber ? parseInt(apiDriver.permanentNumber) : null,
        first_name: apiDriver.givenName,
        last_name: apiDriver.familyName,
        name_acronym: apiDriver.code,
        country_code: countryCode,
      };

      const { data: existingDriver, error: selectError } = await this.supabaseService.client
        .from('drivers')
        .select('*')
        .eq('first_name', driverData.first_name)
        .eq('last_name', driverData.last_name)
        .eq('driver_number', driverData.driver_number)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        this.logger.error(`Select error for ${driverData.first_name} ${driverData.last_name}:`, selectError.message);
        throw new Error(`Select error: ${selectError.message}`);
      }

      if (existingDriver) {
        this.logger.log(`Updating existing driver: ${driverData.first_name} ${driverData.last_name}`);
        const { error } = await this.supabaseService.client
          .from('drivers')
          .update(driverData)
          .eq('first_name', existingDriver.first_name)
          .eq('last_name', existingDriver.last_name)
          .eq('driver_number', existingDriver.driver_number); // Added driver_number to the where clause for a more precise update
        
        if (error) {
          this.logger.error(`Failed to update driver ${driverData.first_name} ${driverData.last_name}`, error.message);
          throw new Error(`Update failed: ${error.message}`);
        }
        updated++;
      } else {
        this.logger.log(`Creating new driver: ${driverData.first_name} ${driverData.last_name}`);
        const { error } = await this.supabaseService.client
          .from('drivers')
          .insert(driverData);
        
        if (error) {
          this.logger.error(`Failed to create driver ${driverData.first_name} ${driverData.last_name}`, error.message);
          throw new Error(`Creation failed: ${error.message}`);
        }
        created++;
      }
    }
    this.logger.log(`Ingestion completed: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}
