// backend/src/standings/driver-standings-materialized.entity.ts

import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'driver_standings_materialized' })
export class DriverStandingMaterialized {
  @PrimaryColumn({ type: 'int', name: 'seasonYear' })
  seasonYear: number;

  @PrimaryColumn({ type: 'int', name: 'driverId' })
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
}


