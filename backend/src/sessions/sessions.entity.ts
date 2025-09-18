import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Race } from '../races/races.entity';
import { OneToMany } from 'typeorm';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { TireStint } from '../tire-stints/tire-stints.entity';
import { RaceEvent } from '../race-events/race-events.entity';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  race_id: number;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'timestamptz', nullable: true })
  start_time: Date;

  @Column({ type: 'jsonb', nullable: true })
  weather: any;

  @ManyToOne(() => Race, (race) => race.sessions)
  @JoinColumn({ name: 'race_id' })
  race: Race;

  @OneToMany(() => RaceResult, 'session')
  raceResults: RaceResult[];

  @OneToMany(() => QualifyingResult, 'session')
  qualifyingResults: QualifyingResult[];

  @OneToMany(() => TireStint, 'session')
  tireStints: TireStint[];

  @OneToMany(() => RaceEvent, 'session')
  raceEvents: RaceEvent[];
}


