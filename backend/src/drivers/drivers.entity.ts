/* backend/src/drivers/drivers.entity.ts */

import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { Country } from '../countries/countries.entity'; // We'll create this module later
  import { RaceResult } from '../race-results/race-results.entity';
  import { Lap } from '../laps/laps.entity';
  import { PitStop } from '../pit-stops/pit-stops.entity';
  import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
  import { TireStint } from '../tire-stints/tire-stints.entity';
  import { ConstructorDriver } from '../constructors/constructor-drivers.entity';
  
  @Entity({ name: 'drivers' })
  export class Driver {
    @PrimaryGeneratedColumn()
    id: number;
  
  @Column({ type: 'text', unique: true, nullable: true })
  ergast_driver_ref: string;

  @Column({ type: 'int', nullable: true })
  driver_number: number;
  
    @Column({ type: 'text', nullable: true })
    first_name: string;
  
    @Column({ type: 'text', nullable: true })
    last_name: string;
  
    @Column({ type: 'varchar', nullable: true })
    name_acronym: string;
  
    @Column({ type: 'varchar', nullable: true })
    country_code: string;
  
    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;
  
  @Column({ type: 'text', nullable: true })
  profile_image_url: string;

  // Define the relationship to the Country table
    // We haven't created the Country entity yet, but we define the relation
    @ManyToOne(() => Country)
    @JoinColumn({ name: 'country_code', referencedColumnName: 'country_code' })
    country: Country;

    @OneToMany(() => RaceResult, 'driver')
    raceResults: RaceResult[];

    @OneToMany(() => Lap, 'driver')
    laps: Lap[];

    @OneToMany(() => PitStop, 'driver')
    pitStops: PitStop[];

    @OneToMany(() => QualifyingResult, 'driver')
    qualifyingResults: QualifyingResult[];

    @OneToMany(() => TireStint, 'driver')
    tireStints: TireStint[];

    @OneToMany(() => ConstructorDriver, (constructorDriver) => constructorDriver.driver)
    teamEntries: ConstructorDriver[];

    // Computed property for full name
    get full_name(): string {
      if (this.first_name && this.last_name) {
        return `${this.first_name} ${this.last_name}`;
      }
      return this.first_name || this.last_name || this.name_acronym || `Driver ${this.id}`;
    }

    // Additional getters for compatibility with frontend expectations
    get given_name(): string | null {
      return this.first_name;
    }

    get family_name(): string | null {
      return this.last_name;
    }

    get code(): string | null {
      return this.name_acronym;
    }

    get current_team_name(): string | null {
      // This would need to be populated by a service method
      // For now, return null and let the service handle team info
      return null;
    }

    get image_url(): string | null {
      return this.profile_image_url;
    }

    get team_color(): string | null {
      // This would need to be populated by a service method
      return null;
    }
  }