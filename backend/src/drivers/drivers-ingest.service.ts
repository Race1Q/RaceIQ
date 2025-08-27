// src/drivers/drivers-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

interface ApiDriver {
  driverId: string;
  url: string;
  givenName: string;
  familyName: string;
  permanentNumber?: string;
  code: string;
  nationality?: string;
  dateOfBirth: string;
}

interface ApiResponse {
  MRData: {
    DriverTable: {
      Drivers: ApiDriver[];
    };
    total: string;
    limit: string;
    offset: string;
  };
}

@Injectable()
export class DriversIngestService {
  private readonly logger = new Logger(DriversIngestService.name);
  private readonly pageLimit = 30; // API default page size

  private readonly countryCodeMap: Record<string, string> = {
    Australia: 'AUS',
    Austria: 'AUT',
    Azerbaijan: 'AZE',
    Bahrain: 'BHR',
    Belgium: 'BEL',
    Brazil: 'BRA',
    Canada: 'CAN',
    China: 'CHN',
    France: 'FRA',
    Germany: 'DEU',
    Hungary: 'HUN',
    India: 'IND',
    Italy: 'ITA',
    Japan: 'JPN',
    Malaysia: 'MYS',
    Mexico: 'MEX',
    Monaco: 'MCO',
    Netherlands: 'NLD',
    Portugal: 'PRT',
    Russia: 'RUS',
    'Saudi Arabia': 'SAU',
    Singapore: 'SGP',
    Spain: 'ESP',
    Turkey: 'TUR',
    UAE: 'ARE',
    UK: 'GBR',
    USA: 'USA',
    'United States': 'USA',
    'United Kingdom': 'GBR',
    'United Arab Emirates': 'ARE',
    'South Africa': 'ZAF',
    Argentina: 'ARG',
    Morocco: 'MAR',
    Sweden: 'SWE',
    Korea: 'KOR',
    'San Marino': 'SMR',
    Vietnam: 'VNM',
    Europe: 'EUR',
    Qatar: 'QAT',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private getCountryCode(nationality?: string): string | null {
    if (!nationality) return null;
    return this.countryCodeMap[nationality] ?? nationality.substring(0, 3).toUpperCase();
  }

  private async fetchDriversPage(season: number, offset: number, attempt = 0): Promise<ApiDriver[]> {
    const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/drivers/?format=json&limit=${this.pageLimit}&offset=${offset}`;
    try {
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      return response.data.MRData.DriverTable.Drivers;
    } catch (err: any) {
      if (err.response?.status === 429) {
        // exponential backoff on rate limit
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        this.logger.warn(`Rate limited. Waiting ${waitTime.toFixed(0)}ms before retrying season ${season} page ${offset / this.pageLimit + 1}`);
        await new Promise((r) => setTimeout(r, waitTime));
        return this.fetchDriversPage(season, offset, attempt + 1);
      }
      this.logger.error(`Failed to fetch drivers for season ${season} page ${offset / this.pageLimit + 1}`, err.message);
      return [];
    }
  }

  private async fetchAllDriversForSeason(season: number): Promise<ApiDriver[]> {
    const allDrivers: ApiDriver[] = [];
    let offset = 0;
    while (true) {
      const pageDrivers = await this.fetchDriversPage(season, offset);
      if (!pageDrivers.length) break;
      allDrivers.push(...pageDrivers);
      if (pageDrivers.length < this.pageLimit) break; // last page
      offset += this.pageLimit;
      // small delay to respect burst limit
      await new Promise((r) => setTimeout(r, 250));
    }
    return allDrivers;
  }

  async ingestDrivers(): Promise<{ created: number; updated: number }> {
    const startYear = 1950;
    const endYear = 2025;

    this.logger.log('Starting drivers ingestion');
    const uniqueDrivers = new Map<string, ApiDriver>();

    for (let season = startYear; season <= endYear; season++) {
      const seasonDrivers = await this.fetchAllDriversForSeason(season);
      for (const driver of seasonDrivers) {
        if (!uniqueDrivers.has(driver.driverId)) {
          uniqueDrivers.set(driver.driverId, driver);
        }
      }
    }

    let created = 0;
    let updated = 0;

    for (const driver of uniqueDrivers.values()) {
      const countryCode = this.getCountryCode(driver.nationality);

      // Ensure country exists
      if (countryCode) {
        const { data: existingCountry, error: countrySelectError } =
          await this.supabaseService.client
            .from('countries')
            .select('country_code')
            .eq('country_code', countryCode)
            .single();

        if (countrySelectError && countrySelectError.code !== 'PGRST116') {
          this.logger.error(`Country select error for ${countryCode}`, countrySelectError.message);
          throw new Error(`Country select failed: ${countrySelectError.message}`);
        }

        if (!existingCountry) {
          const { error: countryInsertError } = await this.supabaseService.client
            .from('countries')
            .insert({ country_code: countryCode, country_name: driver.nationality });
          if (countryInsertError) {
            this.logger.error(`Country insert error for ${driver.nationality}`, countryInsertError.message);
            throw new Error(`Country insert failed: ${countryInsertError.message}`);
          }
          this.logger.log(`Created new country: ${driver.nationality} (${countryCode})`);
        }
      }

      const driverData = {
        driver_number: driver.permanentNumber ? parseInt(driver.permanentNumber) : null,
        first_name: driver.givenName,
        last_name: driver.familyName,
        name_acronym: driver.code,
        country_code: countryCode,
        date_of_birth: driver.dateOfBirth,
      };

      const { data: existingDriver, error: selectError } =
        await this.supabaseService.client
          .from('drivers')
          .select('*')
          .eq('first_name', driverData.first_name)
          .eq('last_name', driverData.last_name)
          .single();

      if (selectError && selectError.code !== 'PGRST116') {
        this.logger.error(`Driver select error for ${driverData.first_name} ${driverData.last_name}`, selectError.message);
        throw new Error(`Driver select failed: ${selectError.message}`);
      }

      if (existingDriver) {
        const { error: updateError } = await this.supabaseService.client
          .from('drivers')
          .update(driverData)
          .eq('id', existingDriver.id);
        if (updateError) {
          this.logger.error(`Failed to update driver ${driverData.first_name} ${driverData.last_name}`, updateError.message);
          throw new Error(`Driver update failed: ${updateError.message}`);
        }
        updated++;
      } else {
        const { error: insertError } = await this.supabaseService.client
          .from('drivers')
          .insert(driverData);
        if (insertError) {
          this.logger.error(`Failed to create driver ${driverData.first_name} ${driverData.last_name}`, insertError.message);
          throw new Error(`Driver creation failed: ${insertError.message}`);
        }
        created++;
      }
    }

    this.logger.log(`Ingestion completed: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}






