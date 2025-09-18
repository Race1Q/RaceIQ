import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Race } from '../races/races.entity';
import { Driver } from '../drivers/drivers.entity';

@Entity({ name: 'laps' })
export class Lap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  race_id: number;

  @Column({ type: 'int', nullable: true })
  driver_id: number;

  @Column({ type: 'int', nullable: true })
  lap_number: number;

  @Column({ type: 'int', nullable: true })
  position: number;

  @Column({ type: 'int', nullable: true })
  time_ms: number;

  @Column({ type: 'int', nullable: true })
  sector_1_ms: number;

  @Column({ type: 'int', nullable: true })
  sector_2_ms: number;

  @Column({ type: 'int', nullable: true })
  sector_3_ms: number;

  @Column({ type: 'boolean', nullable: true })
  is_pit_out_lap: boolean;

  @ManyToOne(() => Race, 'laps')
  @JoinColumn({ name: 'race_id' })
  race: Race;

  @ManyToOne(() => Driver, 'laps')
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}


