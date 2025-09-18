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
  
  @Entity({ name: 'drivers' })
  export class Driver {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text', unique: true, nullable: true })
    ergast_driver_ref: string;
  
    @Column({ type: 'int', unique: true, nullable: true })
    openf1_driver_ref: number;
  
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
  
    @Column({ type: 'text', nullable: true })
    bio: string; // Will be NULL until Gemini enrichment
  
    @Column({ type: 'text', nullable: true })
    fun_fact: string; // Will be NULL until Gemini enrichment
  
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
  }