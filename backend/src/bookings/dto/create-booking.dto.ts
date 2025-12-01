import {
  IsUUID,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roomId: string;

  @IsDate()
  @Type(() => Date)
  checkInDate: Date;

  @IsDate()
  @Type(() => Date)
  checkOutDate: Date;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  @IsOptional()
  specialRequests?: string;
}
