import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InquiryStatus {
  RECEIVED = 'received',
  ADDRESSED = 'addressed',
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  messageAmharic: string;

  @Column({ type: 'text', nullable: true })
  messageEnglish: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.RECEIVED,
  })
  status: InquiryStatus;

  @Column({ type: 'text', nullable: true })
  originalLanguage: string;

  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  addressedAt: Date;
}
