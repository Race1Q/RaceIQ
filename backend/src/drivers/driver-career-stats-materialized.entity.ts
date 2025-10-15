// backend/src/drivers/driver-career-stats-materialized.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'driver_career_stats_materialized' })
export class DriverCareerStatsMaterialized {
  @PrimaryColumn({ type: 'int', name: 'driverId' })
  driverId: number;

  @Column({ type: 'text', name: 'driverFullName' })
  driverFullName: string;

  @Column({ type: 'int', name: 'totalWins' })
  totalWins: number;

  @Column({ type: 'int', name: 'totalPodiums' })
  totalPodiums: number;

  @Column({ type: 'int', name: 'totalFastestLaps' })
  totalFastestLaps: number;

  @Column({ type: 'numeric', name: 'totalPoints' })
  totalPoints: number;

  @Column({ type: 'int', name: 'grandsPrixEntered' })
  grandsPrixEntered: number;

  @Column({ type: 'int', name: 'dnfs' })
  dnfs: number;

  @Column({ type: 'int', name: 'highestRaceFinish' })
  highestRaceFinish: number;

  @Column({ type: 'int', name: 'championships' })
  championships: number;
}
