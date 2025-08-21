// src/countries/country-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Country } from './countries.entity';

interface ApiCircuit {
  circuitId: string;
  circuitName: string;
  Location: {
    locality: string;
    country: string;
    lat: string;
    long: string;
  };
  url: string;
}

interface ApiResponse {
  MRData: {
    CircuitTable: {
      Circuits: ApiCircuit[];
    };
    total: string;
    limit: string;
    offset: string;
  };
}

@Injectable()
export class CountryIngestService {
  private readonly logger = new Logger(CountryIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async fetchAllCircuitsFromAPI(): Promise<ApiCircuit[]> {
    const allCircuits: ApiCircuit[] = [];
    let offset = 0;
    const limit = 30; // API returns 30 circuits per page
    let hasMore = true;

    try {
      while (hasMore) {
        const apiUrl = `https://api.jolpi.ca/ergast/f1/circuits/?format=json&offset=${offset}&limit=${limit}`;
        this.logger.log(`Fetching circuits from offset: ${offset}`);
        
        const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
        const circuits = response.data.MRData.CircuitTable.Circuits;
        
        this.logger.log(`Received ${circuits.length} circuits from offset ${offset}`);
        
        if (circuits.length > 0) {
          allCircuits.push(...circuits);
          
          // Check if we have more circuits to fetch
          const total = parseInt(response.data.MRData.total);
          const currentOffset = parseInt(response.data.MRData.offset);
          const currentLimit = parseInt(response.data.MRData.limit);
          
          if (currentOffset + currentLimit >= total) {
            hasMore = false;
          } else {
            offset += limit;
          }
        } else {
          hasMore = false;
        }

        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.logger.log(`Total circuits fetched: ${allCircuits.length}`);
      
      if (allCircuits.length > 0) {
        this.logger.log('First circuit:', allCircuits[0]);
        this.logger.log('Last circuit:', allCircuits[allCircuits.length - 1]);
      }
      
      return allCircuits;
    } catch (error) {
      this.logger.error('Failed to fetch circuits from API', error);
      throw new Error('Failed to fetch circuits data');
    }
  }

  private getCountryCode(country: string): string {
    // Map full country names to 3-letter country codes
    const countryMap: { [key: string]: string } = {
      'Australia': 'AUS',
      'Austria': 'AUT',
      'Azerbaijan': 'AZE',
      'Bahrain': 'BHR',
      'Belgium': 'BEL',
      'Canada': 'CAN',
      'China': 'CHN',
      'France': 'FRA',
      'Germany': 'DEU',
      'Hungary': 'HUN',
      'India': 'IND',
      'Italy': 'ITA',
      'Japan': 'JPN',
      'Malaysia': 'MYS',
      'Mexico': 'MEX',
      'Monaco': 'MCO',
      'Netherlands': 'NLD',
      'Portugal': 'PRT',
      'Russia': 'RUS',
      'Saudi Arabia': 'SAU',
      'Singapore': 'SGP',
      'Spain': 'ESP',
      'Turkey': 'TUR',
      'UAE': 'ARE',
      'UK': 'GBR',
      'USA': 'USA',
      'United States': 'USA',
      'United Kingdom': 'GBR',
      'United Arab Emirates': 'ARE',
      'South Africa': 'ZAF',
      'Argentina': 'ARG',
      'Morocco': 'MAR',
      'Sweden': 'SWE',
      'Korea': 'KOR',  // South Korea
      'San Marino': 'SMR',
      'Vietnam': 'VNM',
  
      // ✅ From your full circuits list (extra additions for uniqueness)
      'Brazil': 'BRA',
      'Qatar': 'QAT',
      'Europe': 'EUR', // Generic code for European circuits
    };
  
    return countryMap[country] || country.substring(0, 3).toUpperCase();
  }
  

  async ingestCountries(): Promise<{ created: number; updated: number }> {
    const apiCircuits = await this.fetchAllCircuitsFromAPI();
    let created = 0;
    let updated = 0;

    this.logger.log(`Processing countries from ${apiCircuits.length} circuits`);

    // Get unique countries from all circuits across all pages
    const uniqueCountries = new Map<string, string>();
    for (const apiCircuit of apiCircuits) {
      const countryCode = this.getCountryCode(apiCircuit.Location.country);
      uniqueCountries.set(countryCode, apiCircuit.Location.country);
    }

    this.logger.log(`Found ${uniqueCountries.size} unique countries from all pages`);
    this.logger.log('Unique countries:', Array.from(uniqueCountries.entries()));

    for (const [iso3, countryName] of uniqueCountries) {
      try {
        const result = await this.processCountry(iso3, countryName);
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (error) {
        this.logger.error(`Failed to process country ${iso3}:`, error);
      }
    }

    this.logger.log(`Ingested countries: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  private async processCountry(iso3: string, countryName: string): Promise<'created' | 'updated'> {
    this.logger.log(`Processing country: ${iso3} - ${countryName}`);

    const countryData: Country = {
      iso3,
      country_name: countryName
    };

    // Check if country exists
    const { data: existingCountry, error: selectError } = await this.supabaseService.client
      .from('countries')
      .select('*')
      .eq('iso3', iso3)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for ${iso3}:`, selectError);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingCountry) {
      this.logger.log(`Updating existing country: ${iso3}`);
      // Update existing country if the name is different
      if (existingCountry.country_name !== countryName) {
        const { error } = await this.supabaseService.client
          .from('countries')
          .update({ country_name: countryName })
          .eq('iso3', iso3);

        if (error) {
          this.logger.error(`Failed to update country ${iso3}`, error);
          throw new Error(`Update failed: ${error.message}`);
        }
        return 'updated';
      } else {
        this.logger.log(`Country ${iso3} already exists with same name, skipping update`);
        return 'updated'; // Considered "updated" even if no changes were made
      }
    } else {
      this.logger.log(`Creating new country: ${iso3}`);
      // Create new country
      const { error } = await this.supabaseService.client
        .from('countries')
        .insert(countryData);

      if (error) {
        this.logger.error(`Failed to create country ${iso3}`, error);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }

  // Additional method to get all countries from database for verification
  async verifyCountries(): Promise<void> {
    const { data: dbCountries, error } = await this.supabaseService.client
      .from('countries')
      .select('*')
      .order('iso3', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch countries from database:', error);
      return;
    }

    this.logger.log(`Database contains ${dbCountries.length} countries:`);
    dbCountries.forEach(country => {
      this.logger.log(`- ${country.iso3}: ${country.country_name}`);
    });
  }
}