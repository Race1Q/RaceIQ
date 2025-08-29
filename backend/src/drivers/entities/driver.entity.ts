// src/drivers/entities/driver.entity.ts
export class Driver {
  id: number;
  driver_number: number | null;
  first_name: string;
  last_name: string;
  name_acronym: string | null;
  country_code: string | null;
  date_of_birth: string;
  full_name?: string; // This will be a computed property from the service
}