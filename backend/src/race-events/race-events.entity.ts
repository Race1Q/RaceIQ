import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from '../sessions/sessions.entity';

@Entity({ name: 'race_events' })
export class RaceEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  session_id: number;

  @Column({ type: 'int', nullable: true })
  lap_number: number;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Session, 'raceEvents')
  @JoinColumn({ name: 'session_id' })
  session: Session;
}


