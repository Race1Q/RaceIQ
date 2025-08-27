// backend/src/drivers/entities/driver.entity.ts

export class Driver {
  id?: number;
  full_name: string;
  first_name: string;
  last_name: string;
  country_code: string | null;
  name_acronym: string | null;
  driver_number: number | null;
  broadcast_name: string | null;
  headshot_url: string | null;
  team_name: string | null;
  team_colour: string | null;
  season_year: number;
  is_active: boolean;
}