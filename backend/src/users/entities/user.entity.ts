// backend/src/users/entities/user.entity.ts

import { Entity, PrimaryColumn, Column, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConstructorEntity } from '../../constructors/constructors.entity';
import { Driver } from '../../drivers/drivers.entity';

// This decorator is crucial for TypeORM to recognize this class as a table.
@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column({ type: 'text', unique: true })
  auth0_sub: string;

  @Column({ type: 'text', unique: true, nullable: true })
  username: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'bigint', nullable: true })
  favorite_constructor_id: number;

  @Column({ type: 'bigint', nullable: true })
  favorite_driver_id: number;

  @Column({ type: 'text', default: 'dark' })
  theme_preference: 'dark' | 'light';

  @Column({ type: 'boolean', default: true })
  use_custom_team_color: boolean;

  @Column({ type: 'jsonb', nullable: true })
  dashboard_visibility: object;

  @Column({ type: 'jsonb', nullable: true })
  dashboard_layouts: object;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  widget_settings: Record<string, any>;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Relationships (optional but good practice)
  @ManyToOne(() => ConstructorEntity)
  @JoinColumn({ name: 'favorite_constructor_id' })
  favoriteConstructor: ConstructorEntity;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'favorite_driver_id' })
  favoriteDriver: Driver;
}