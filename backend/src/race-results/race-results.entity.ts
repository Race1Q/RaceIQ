import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from '../sessions/sessions.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';

@Entity({ name: 'race_results' })
export class RaceResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  session_id: number;

  @Column({ type: 'int', nullable: true })
  driver_id: number;

  @Column({ type: 'int', nullable: true })
  constructor_id: number;

  @Column({ type: 'int', nullable: true })
  position: number;

  @Column({ type: 'numeric', nullable: true })
  points: number;

  @Column({ type: 'int', nullable: true })
  grid: number;

  @Column({ type: 'int', nullable: true })
  laps: number;

  @Column({ type: 'bigint', nullable: true })
  time_ms: number;

  @Column({ type: 'text', nullable: true })
  status: string;

  @Column({ type: 'int', nullable: true })
  fastest_lap_rank: number;

  @Column({ type: 'numeric', default: 0, nullable: true })
  points_for_fastest_lap: number;

  @ManyToOne(() => Session, 'raceResults')
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @ManyToOne(() => Driver, 'raceResults')
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => ConstructorEntity, 'raceResults')
  @JoinColumn({ name: 'constructor_id' })
  team: ConstructorEntity;
}


