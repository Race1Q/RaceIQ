// backend/src/drivers/wins-per-season-materialized.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'wins_per_season_materialized' })
export class WinsPerSeasonMaterialized {
  @PrimaryColumn({ type: 'int', name: 'driverId' })
  driverId: number;

  @PrimaryColumn({ type: 'int', name: 'seasonYear' })
  seasonYear: number;

  @Column({ type: 'int' })
  wins: number;
}
