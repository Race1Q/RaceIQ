import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'constructor_standings' })
export class ConstructorStandingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  race_id: number;

  @Column()
  constructor_id: number;

  @Column()
  points: number;

  @Column()
  position: number;

  @Column()
  wins: number;
}