import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Driver } from '../drivers/drivers.entity';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryColumn({ type: 'varchar' })
  country_code: string;

  @Column({ type: 'text' })
  country_name: string;

  // Define the other side of the relationship
  @OneToMany(() => Driver, (driver) => driver.country)
  drivers: Driver[];
}