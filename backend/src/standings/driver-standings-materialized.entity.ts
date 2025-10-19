// backend/src/standings/driver-standings-materialized.entity.ts

import { ViewEntity, PrimaryColumn, Column } from 'typeorm';

@ViewEntity({ name: 'driver_standings_materialized' })
export class DriverStandingMaterialized {
  @PrimaryColumn({ name: 'seasonYear' })
  seasonYear: number;

  @PrimaryColumn({ name: 'driverId' })
  driverId: number;

  @Column({ type: 'text', name: 'driverFullName' })
  driverFullName: string;

  @Column({ type: 'text', name: 'constructorName' })
  constructorName: string;

  @Column({ type: 'numeric', name: 'seasonPoints' })
  seasonPoints: number;

  @Column({ type: 'int', name: 'seasonWins' })
  seasonWins: number;

  // New fields brought in from drivers table via the materialized view
  @Column({ type: 'int', name: 'driver_number', nullable: true })
  driverNumber: number | null;

  @Column({ type: 'varchar', name: 'country_code', nullable: true })
  countryCode: string | null;

  @Column({ type: 'text', name: 'profile_image_url', nullable: true })
  profileImageUrl: string | null;

  @Column({ type: 'int', name: 'seasonPodiums' })
  seasonPodiums: number;

  // Additional columns for recent form calculations
  @Column({ type: 'numeric', name: 'recentForm', nullable: true })
  recentForm: number | null;

  @Column({ type: 'int', name: 'last5_positions', array: true, nullable: true })
  last5_positions: number[] | null;
}


