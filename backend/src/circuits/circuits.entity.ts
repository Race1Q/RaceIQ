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

  // length_km, race_distance_km, and track_layout columns removed - not in database

  // This links to our existing Country entity
  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_code', referencedColumnName: 'country_code' })
  country: Country;

  // We will uncomment this relation in Phase 2
  // @OneToMany(()n=> Race, (race) => race.circuit)
  // races: Race[];
}