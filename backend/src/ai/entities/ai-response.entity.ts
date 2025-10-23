import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('ai_responses')
@Index('idx_ai_responses_lookup', ['responseType', 'entityType', 'entityId', 'season', 'eventId', 'generatedAt'])
export class AiResponse {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'response_type' })
  responseType: string;

  @Column({ type: 'integer', nullable: true, name: 'entity_id' })
  entityId: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'entity_type' })
  entityType: string | null;

  @Column({ type: 'integer', nullable: true })
  season: number | null;

  @Column({ type: 'integer', nullable: true, name: 'event_id' })
  eventId: number | null;

  @Column({ type: 'jsonb', name: 'response_data', nullable: false })
  responseData: any;

  @Column({ type: 'timestamp', nullable: true, name: 'generated_at' })
  generatedAt: Date | null;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'is_fallback' })
  isFallback: boolean | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ai_attribution' })
  aiAttribution: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
