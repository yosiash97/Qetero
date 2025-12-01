import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = this.hotelRepository.create(createHotelDto);
    return await this.hotelRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return await this.hotelRepository.find({
      relations: ['rooms'],
    });
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['rooms'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async findByCity(city: string): Promise<Hotel[]> {
    return await this.hotelRepository.find({
      where: { city },
      relations: ['rooms'],
    });
  }

  async update(id: string, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    const hotel = await this.findOne(id);
    Object.assign(hotel, updateHotelDto);
    return await this.hotelRepository.save(hotel);
  }

  async remove(id: string): Promise<void> {
    const hotel = await this.findOne(id);
    await this.hotelRepository.remove(hotel);
  }
}
