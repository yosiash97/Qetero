import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingStatus } from './entities/booking.entity';
import { RoomsService } from '../rooms/rooms.service';
import { RoomStatus } from '../rooms/entities/room.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private roomsService: RoomsService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, checkInDate, checkOutDate } = createBookingDto;

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException(
        'Check-in date must be before check-out date',
      );
    }

    // Check if room exists and is available
    const room = await this.roomsService.findOne(roomId);

    // Check for conflicting bookings
    const conflictingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId })
      .andWhere('booking.status != :cancelledStatus', {
        cancelledStatus: BookingStatus.CANCELLED,
      })
      .andWhere(
        'booking.checkInDate < :checkOut AND booking.checkOutDate > :checkIn',
        {
          checkIn: checkInDate,
          checkOut: checkOutDate,
        },
      )
      .getOne();

    if (conflictingBooking) {
      throw new ConflictException(
        'Room is not available for the selected dates',
      );
    }

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      status: BookingStatus.CHECKED_IN, // Auto check-in for walk-in guests
    });
    const savedBooking = await this.bookingRepository.save(booking);

    // Update room status to occupied (since guest is checked in)
    await this.roomsService.updateStatus(roomId, RoomStatus.OCCUPIED);

    return savedBooking;
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ['user', 'room', 'room.hotel'],
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'room', 'room.hotel', 'orders'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { userId },
      relations: ['room', 'room.hotel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRoom(roomId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { roomId },
      relations: ['user'],
      order: { checkInDate: 'ASC' },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    Object.assign(booking, updateBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async checkIn(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only confirmed bookings can be checked in',
      );
    }

    booking.status = BookingStatus.CHECKED_IN;
    await this.roomsService.updateStatus(booking.roomId, RoomStatus.OCCUPIED);

    return await this.bookingRepository.save(booking);
  }

  async checkOut(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Only checked-in bookings can be checked out',
      );
    }

    // Calculate total bill: room charges + orders
    const orders = await this.orderRepository.find({
      where: { bookingId: id },
    });

    const ordersTotal = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );

    // Update booking with final total (room + orders)
    const roomCharges = Number(booking.totalPrice);
    const finalTotal = roomCharges + ordersTotal;
    booking.totalPrice = finalTotal;

    booking.status = BookingStatus.CHECKED_OUT;
    await this.roomsService.updateStatus(booking.roomId, RoomStatus.AVAILABLE);

    return await this.bookingRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (
      booking.status === BookingStatus.CHECKED_OUT ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot cancel a checked-out or already cancelled booking',
      );
    }

    // If room was reserved or occupied, make it available
    if (
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED
    ) {
      await this.roomsService.updateStatus(booking.roomId, RoomStatus.AVAILABLE);
    }

    booking.status = BookingStatus.CANCELLED;

    return await this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }
}
