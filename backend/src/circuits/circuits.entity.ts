// src/circuits/circuit.entity.ts
export interface Circuit {
    id?: number;
    name: string;
    location: string;
    country_code: string;
    map_url: string;
  }
  
  export interface ApiCircuit {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
    url: string;
  }