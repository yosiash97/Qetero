import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room, RoomStatus } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    return await this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find({
      relations: ['hotel'],
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['hotel', 'bookings'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async findByHotel(hotelId: string): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { hotelId },
      relations: ['hotel'],
    });
  }

  async findAvailable(
    hotelId?: string,
    checkIn?: Date,
    checkOut?: Date,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Room[]; total: number; page: number; totalPages: number }> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('room.bookings', 'booking')
      .where('room.status = :status', { status: RoomStatus.AVAILABLE });

    if (hotelId) {
      query.andWhere('room.hotelId = :hotelId', { hotelId });
    }

    // If dates provided, exclude rooms with conflicting bookings
    if (checkIn && checkOut) {
      query.andWhere(
        `(booking.id IS NULL OR booking.status = 'cancelled' OR NOT (
          booking.checkInDate < :checkOut AND booking.checkOutDate > :checkIn
        ))`,
        { checkIn, checkOut },
      );
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const data = await query.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    return await this.roomRepository.save(room);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }
}
