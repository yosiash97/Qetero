import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateHotelDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;
}
