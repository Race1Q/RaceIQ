import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Season } from '../seasons/seasons.entity';
import { ConstructorEntity } from './constructors.entity';
import { Driver } from '../drivers/drivers.entity';

@Entity('constructor_drivers')
export class ConstructorDriver {
  // --- Composite primary key ---
  @PrimaryColumn({ type: 'int' })
  season_id: number;

  @PrimaryColumn({ type: 'bigint' })
  constructor_id: number;

  @PrimaryColumn({ type: 'bigint' })
  driver_id: number;

  // --- Relations ---
  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ManyToOne(() => ConstructorEntity)
  @JoinColumn({ name: 'constructor_id' })
  team: ConstructorEntity;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}