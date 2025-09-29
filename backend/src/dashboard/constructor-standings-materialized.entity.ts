import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'constructor_standings_materialized' })
export class ConstructorStandingMaterialized {
  @PrimaryColumn({ type: 'int' })
  seasonYear: number;

  @PrimaryColumn({ type: 'bigint' })
  constructorId: number;

  @Column({ type: 'text' })
  constructorName: string;

  @Column({ type: 'numeric' })
  seasonPoints: number;

  @Column({ type: 'int' })
  seasonWins: number;

  @Column({ type: 'int' })
  position: number;
}


