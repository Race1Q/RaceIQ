// backend/src/constructors/constructor-standings-materialized.entity.ts

import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'constructor_standings_materialized' })
export class ConstructorStandingsMaterialized {
  @PrimaryColumn({ type: 'int', name: 'seasonYear' })
  seasonYear: number;

  @PrimaryColumn({ type: 'bigint', name: 'constructorId' })
  constructorId: number;

  @Column({ type: 'text', name: 'constructorName' })
  constructorName: string;

  @Column({ type: 'numeric', name: 'seasonPoints' })
  seasonPoints: number;

  @Column({ type: 'int', name: 'seasonWins' })
  seasonWins: number;

  @Column({ type: 'int', name: 'position' })
  position: number;

  @Column({ type: 'int', name: 'seasonPodiums' })
  seasonPodiums: number;
}
