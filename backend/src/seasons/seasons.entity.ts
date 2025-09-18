import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
// import { Race } from '../races/races.entity';

@Entity({ name: 'seasons' })
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  year: number;

//   @OneToMany(() => Race, (race) => race.season)
//   races: Race[];
}


