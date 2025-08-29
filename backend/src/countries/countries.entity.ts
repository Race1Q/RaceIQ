// src/countries/country.entity.ts
export interface Country {
    iso3: string;
    country_name: string;
  }
  
  export interface ApiCircuit {
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