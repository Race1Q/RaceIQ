import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Season } from '../seasons/seasons.entity';
import { Circuit } from '../circuits/circuits.entity';
import { Session } from '../sessions/sessions.entity';
import { Lap } from '../laps/laps.entity';
import { PitStop } from '../pit-stops/pit-stops.entity';
// import { Lap } from '../laps/laps.entity';
// import { PitStop } from '../pit-stops/pit-stops.entity';

@Entity({ name: 'races' })
export class Race {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  season_id: number;

  @Column({ type: 'int', nullable: true })
  circuit_id: number;

  @Column({ type: 'int' })
  round: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ type: 'time', nullable: true })
  time: string;

  @ManyToOne(() => Season, (season) => (season as any).races)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ManyToOne(() => Circuit, (circuit) => (circuit as any).races)
  @JoinColumn({ name: 'circuit_id' })
  circuit: Circuit;

  @OneToMany(() => Session, (session) => session.race)
  sessions: Session[];

  @OneToMany(() => Lap, 'race')
  laps: Lap[];

  @OneToMany(() => PitStop, 'race')
  pitStops: PitStop[];
}


