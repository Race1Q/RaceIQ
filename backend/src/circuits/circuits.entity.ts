import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Country } from '../countries/countries.entity';
// import { Race } from '../races/races.entity'; // We'll add this later

@Entity({ name: 'circuits' })
export class Circuit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  country_code: string;

  @Column({ type: 'text', nullable: true })
  map_url: string;

  @Column({ type: 'numeric', nullable: true })
  length_km: number;

  @Column({ type: 'numeric', nullable: true })
  race_distance_km: number;

  @Column({ type: 'jsonb', nullable: true })
  track_layout: any; // This is NULL until we run the GeoJSON ingestion

  // This links to our existing Country entity
  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_code', referencedColumnName: 'country_code' })
  country: Country;

  // We will uncomment this relation in Phase 2
  // @OneToMany(()n=> Race, (race) => race.circuit)
  // races: Race[];
}