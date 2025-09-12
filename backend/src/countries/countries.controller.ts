// src/countries/countries.controller.ts
import { Controller, Get, Post, Query, Param, Delete, Body, Put } from '@nestjs/common';
import { CountriesService } from './countries.service';
import type { Country } from './countries.entity';

@Controller('countries')
export class CountriesController {
  constructor(
    private readonly countriesService: CountriesService,
  ) {}


  @Get()
  async getAllCountries(): Promise<Country[]> {
    return this.countriesService.getAllCountries();
  }

  @Get('test-connection')
  async testConnection() {
    const result = await this.countriesService.testConnection();
    return { success: result };
  }

  @Get('search')
  async searchCountries(@Query('q') query: string): Promise<Country[]> {
    return this.countriesService.searchCountries(query);
  }

  @Get(':iso3')
  async getCountryByCode(@Param('iso3') iso3: string): Promise<Country | null> {
    return this.countriesService.getCountryByCode(iso3);
  }

  @Post()
  async createCountry(@Body() country: Country): Promise<void> {
    return this.countriesService.createCountry(country);
  }

  @Put(':iso3')
  async updateCountry(
    @Param('iso3') iso3: string,
    @Body() country: Partial<Country>,
  ): Promise<void> {
    return this.countriesService.updateCountry(iso3, country);
  }

  @Delete(':iso3')
  async deleteCountry(@Param('iso3') iso3: string): Promise<void> {
    return this.countriesService.deleteCountry(iso3);
  }
}