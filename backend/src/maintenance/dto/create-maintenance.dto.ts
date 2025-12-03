import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
} from '../entities/maintenance.entity';

export class CreateMaintenanceDto {
  @IsUUID()
  hotelId: string;

  @IsUUID()
  roomId: string;

  @IsUUID()
  bookingId: string;

  @IsUUID()
  userId: string;

  @IsString()
  description: string;

  @IsEnum(MaintenanceCategory)
  @IsOptional()
  category?: MaintenanceCategory;

  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  originalMessage?: string;

  @IsString()
  @IsOptional()
  aiAnalysis?: string;

  @IsString()
  @IsOptional()
  descriptionAmharic?: string;

  @IsString()
  @IsOptional()
  originalMessageAmharic?: string;
}
