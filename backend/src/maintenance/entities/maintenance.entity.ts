import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { User } from '../../users/entities/user.entity';

export enum MaintenanceCategory {
  HVAC = 'hvac',
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  FURNITURE = 'furniture',
  CLEANING = 'cleaning',
  APPLIANCES = 'appliances',
  OTHER = 'other',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('maintenance_requests')
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  hotelId: string;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;

  @Column({ type: 'uuid' })
  roomId: string;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: MaintenanceCategory,
    default: MaintenanceCategory.OTHER,
  })
  category: MaintenanceCategory;

  @Column({
    type: 'enum',
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.PENDING,
  })
  status: MaintenanceStatus;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  originalMessage: string;

  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({ type: 'text', nullable: true })
  descriptionAmharic: string;

  @Column({ type: 'text', nullable: true })
  originalMessageAmharic: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;
}
