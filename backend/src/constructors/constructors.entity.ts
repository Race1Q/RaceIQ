import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { ConstructorDriver } from './constructor-drivers.entity';

@Entity({ name: 'constructors' })
export class ConstructorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  nationality: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'boolean', nullable: false })
  is_active: boolean;

  @OneToMany(() => RaceResult, 'team')
  raceResults: RaceResult[];

  @OneToMany(() => QualifyingResult, 'team')
  qualifyingResults: QualifyingResult[];

  @OneToMany(() => ConstructorDriver, (cd) => cd.team)
  constructorDriverEntries: ConstructorDriver[];
}


