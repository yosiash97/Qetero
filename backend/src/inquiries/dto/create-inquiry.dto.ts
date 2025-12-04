import { IsString, IsEnum, IsOptional } from 'class-validator';
import { InquiryStatus } from '../entities/inquiry.entity';

export class CreateInquiryDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  messageAmharic?: string;

  @IsString()
  @IsOptional()
  messageEnglish?: string;

  @IsEnum(InquiryStatus)
  @IsOptional()
  status?: InquiryStatus;

  @IsString()
  @IsOptional()
  originalLanguage?: string;

  @IsString()
  @IsOptional()
  aiAnalysis?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
