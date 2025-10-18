import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from '../sessions/sessions.entity';
import { Driver } from '../drivers/drivers.entity';

@Entity({ name: 'tire_stints' })
export class TireStint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  compound: string;

  @Column({ type: 'int', nullable: true })
  start_lap: number;

  @Column({ type: 'int', nullable: true })
  end_lap: number;

  @Column({ type: 'int', nullable: true })
  stint_number: number;

  @Column({ type: 'int', nullable: true })
  tyre_age_at_start: number;

  @ManyToOne(() => Session, (session) => session.tireStints)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @ManyToOne(() => Driver, (driver) => driver.tireStints)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}


