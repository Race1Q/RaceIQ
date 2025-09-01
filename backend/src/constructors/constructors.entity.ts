import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class Constructor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'nationality', type: 'varchar' })
  nationality: string;


  @Column({ name: 'id', type: 'varchar', unique: true })
  constructorId: string; // e.g. ferrari

  @Column({ name: 'url', type: 'varchar', nullable: true })
  url: string;
}
