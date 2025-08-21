// src/circuits/circuits.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Circuit, ApiCircuit } from './circuits.entity';

interface ApiResponse {
  MRData: {
    CircuitTable: {
      Circuits: ApiCircuit[];
    };
  };
}

@Injectable()
export class CircuitsService {
  private readonly logger = new Logger(CircuitsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async fetchCircuitsFromAPI(): Promise<ApiCircuit[]> {
    try {
      const apiUrl = 'https://api.jolpi.ca/ergast/f1/circuits/?format=json';
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      
      this.logger.log('API Response received');
      const circuits = response.data.MRData.CircuitTable.Circuits;
      this.logger.log(`Number of circuits: ${circuits.length}`);
      
      if (circuits.length > 0) {
        this.logger.log('First circuit:', circuits[0]);
      }
      
      return circuits;
    } catch (error) {
      this.logger.error('Failed to fetch circuits from API', error);
      throw new Error('Failed to fetch circuits data');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('circuits')
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

  async getAllCircuits(): Promise<Circuit[]> {
    const { data, error } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch circuits', error);
      throw new Error('Failed to fetch circuits');
    }

    return data;
  }

  async getCircuitById(id: number): Promise<Circuit | null> {
    const { data, error } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch circuit ID ${id}`, error);
      return null;
    }

    return data;
  }

  async getCircuitByName(name: string): Promise<Circuit | null> {
    const { data, error } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .ilike('name', name)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch circuit ${name}`, error);
      return null;
    }

    return data;
  }

  async searchCircuits(query: string): Promise<Circuit[]> {
    const { data, error } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,country_code.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search circuits', error);
      throw new Error('Failed to search circuits');
    }

    return data;
  }

  async getCircuitsByCountry(countryCode: string): Promise<Circuit[]> {
    const { data, error } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .ilike('country_code', countryCode)
      .order('name', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch circuits for country ${countryCode}`, error);
      throw new Error('Failed to fetch circuits by country');
    }

    return data;
  }
}