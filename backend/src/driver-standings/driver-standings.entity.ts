
export interface DriverStanding {
    id?: number;
    race_id: number;
    driver_id: number;
    points: number;
    position: number;
    season: number;
    wins: number;
  }
  
  export interface ApiDriverStanding {
    position: string;
    positionText: string;
    points: string;
    wins: string;
    Driver: {
      driverId: string;
      permanentNumber: string;
      code: string;
      url: string;
      givenName: string;
      familyName: string;
      dateOfBirth: string;
      nationality: string;
    };
    Constructors: Array<{
      constructorId: string;
      url: string;
      name: string;
      nationality: string;
    }>;
  }
  
  export interface ApiResponse {
    MRData: {
      StandingsTable: {
        StandingsLists: Array<{
          season: string;
          round: string;
          DriverStandings: ApiDriverStanding[];
        }>;
      };
    };
  }