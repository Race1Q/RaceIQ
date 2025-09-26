// backend/src/dashboard/race-fastest-laps-materialized.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'race_fastest_laps_materialized' })
export class RaceFastestLapMaterialized {
  @PrimaryColumn({ type: 'int', name: 'raceId' })
  raceId: number;

  @Column({ type: 'int', name: 'driverId' })
  driverId: number;

  @Column({ type: 'text', name: 'driverFullName' })
  driverFullName: string;

  @Column({ type: 'int', name: 'lapTimeMs' })
  lapTimeMs: number;
}
