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

@Entity({ name: 'qualifying_results' })
export class QualifyingResult {
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

  @Column({ type: 'int', nullable: true })
  q1_time_ms: number;

  @Column({ type: 'int', nullable: true })
  q2_time_ms: number;

  @Column({ type: 'int', nullable: true })
  q3_time_ms: number;

  @ManyToOne(() => Session, 'qualifyingResults')
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @ManyToOne(() => Driver, 'qualifyingResults')
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => ConstructorEntity, 'qualifyingResults')
  @JoinColumn({ name: 'constructor_id' })
  team: ConstructorEntity;
}


