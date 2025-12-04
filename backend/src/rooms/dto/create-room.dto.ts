import {
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';
import { RoomType, RoomStatus } from '../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  roomNumber: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  beds?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsNumber()
  @IsOptional()
  floor?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  hotelId: string;
}
