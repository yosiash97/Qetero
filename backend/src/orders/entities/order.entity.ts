import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum OrderType {
  FOOD = 'food',
  BEVERAGE = 'beverage',
  COMBO = 'combo',
  OTHER = 'other',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @Column()
  roomId: string;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.FOOD,
  })
  orderType: OrderType;

  @Column({ type: 'jsonb' })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Booking, (booking) => booking.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => Room, (room) => room.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @CreateDateColumn()
  orderedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
