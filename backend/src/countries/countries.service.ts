// src/countries/countries.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Country } from './countries.entity';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('countries')
        .select('count')
        .limit(1);

      if (error) {
        this.logger.error('Supabase connection test failed:', error);
        return false;
      }
      
      this.logger.log('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test failed:', error);
      return false;
    }
  }

  async getAllCountries(): Promise<Country[]> {
    const { data, error } = await this.supabaseService.client
      .from('countries')
      .select('*')
      .order('country_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch countries', error);
      throw new Error('Failed to fetch countries');
    }

    return data;
  }

  async getCountryByCode(iso3: string): Promise<Country | null> {
    const { data, error } = await this.supabaseService.client
      .from('countries')
      .select('*')
      .eq('iso3', iso3)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch country ${iso3}`, error);
      return null;
    }

    return data;
  }

  async searchCountries(query: string): Promise<Country[]> {
    const { data, error } = await this.supabaseService.client
      .from('countries')
      .select('*')
      .or(`iso3.ilike.%${query}%,country_name.ilike.%${query}%`)
      .order('country_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search countries', error);
      throw new Error('Failed to search countries');
    }

    return data;
  }

  async createCountry(country: Country): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('countries')
      .insert(country);

    if (error) {
      this.logger.error(`Failed to create country ${country.iso3}`, error);
      throw new Error(`Failed to create country: ${error.message}`);
    }
  }

  async updateCountry(iso3: string, country: Partial<Country>): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('countries')
      .update(country)
      .eq('iso3', iso3);

    if (error) {
      this.logger.error(`Failed to update country ${iso3}`, error);
      throw new Error(`Failed to update country: ${error.message}`);
    }
  }

  async deleteCountry(iso3: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('countries')
      .delete()
      .eq('iso3', iso3);

    if (error) {
      this.logger.error(`Failed to delete country ${iso3}`, error);
      throw new Error(`Failed to delete country: ${error.message}`);
    }
  }
}