import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private bookingsService: BookingsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { bookingId, roomId } = createOrderDto;

    // Verify booking exists and is checked in
    const booking = await this.bookingsService.findOne(bookingId);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Orders can only be placed for checked-in bookings',
      );
    }

    // Verify the booking is for the specified room
    if (booking.roomId !== roomId) {
      throw new BadRequestException(
        'Room ID does not match the booking room',
      );
    }

    const order = this.orderRepository.create(createOrderDto);
    return await this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['booking', 'booking.user', 'room'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['booking', 'booking.user', 'room', 'room.hotel'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByBooking(bookingId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { bookingId },
      relations: ['room'],
      order: { orderedAt: 'DESC' },
    });
  }

  async findByRoom(roomId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { roomId },
      relations: ['booking', 'booking.user'],
      order: { orderedAt: 'DESC' },
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { status },
      relations: ['booking', 'booking.user', 'room'],
      order: { orderedAt: 'ASC' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;

    // Set deliveredAt timestamp when status is delivered
    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return await this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
