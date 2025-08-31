// src/drivers/entities/driver.entity.ts
export class Driver {
  id: number;
  driver_number: number | null;
  first_name: string;
  last_name: string;
  name_acronym: string | null;
  country_code: string | null;
  date_of_birth: string;
  full_name: string; // This is always computed by the service
  team_name?: string | null; // Current team name
  nationality?: string | null; // Driver nationality
  car_number?: number | null; // Current car number
}