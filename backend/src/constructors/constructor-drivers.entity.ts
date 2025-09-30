import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from './constructors.entity';
import { Season } from '../seasons/seasons.entity';

@Entity({ name: 'constructor_drivers' })
export class ConstructorDriver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  driver_id: number;

  @Column({ type: 'int' })
  constructor_id: number;

  @Column({ type: 'int' })
  season_id: number;

  @ManyToOne(() => Driver, (driver) => driver.teamEntries)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => ConstructorEntity, (team) => team.constructorDriverEntries)
  @JoinColumn({ name: 'constructor_id' })
  team: ConstructorEntity;

  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  season: Season;
}


