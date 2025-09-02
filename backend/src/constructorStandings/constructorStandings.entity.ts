// src/constructor-standings/constructor-standings.entity.ts

export interface ConstructorStandingRecord {
    id: number;
    season: number;
    constructor_id: number;
    position: number;
    points: number;
    wins: number;
  }
  
  export interface ApiConstructor {
    name: string;
    nationality?: string;
    url: string;
  }
  
  export interface ApiConstructorStanding {
    position: number;
    points: number;
    wins: number;
    Constructor: ApiConstructor;
  }
  