import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Comma-separated tags (e.g., "math,calculus,semester1")
  @Column({ type: 'text', nullable: true })
  tags?: string;

  // Stored file info
  @Column()
  fileName: string;        // saved name on disk

  @Column()
  originalName: string;    // original user file name

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  // moderation + analytics (will use in later steps)
  @Column({ default: false })
  approved: boolean;

  @Column({ default: 0 })
  downloads: number;

  // uploader
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @CreateDateColumn()
  createdAt: Date;
  
}
