import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { MaintenanceStatus } from './entities/maintenance.entity';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('hotelId') hotelId?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.maintenanceService.findAll(hotelId, priority, category, pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }

  // Twilio WhatsApp webhook endpoint (no auth guard)
  @Post('webhook/whatsapp')
  async handleWhatsAppMessage(@Body() body: any) {
    try {
      const from = body.From; // Phone number in format: whatsapp:+1234567890
      const messageBody = body.Body;

      // Extract phone number without 'whatsapp:' prefix
      const phoneNumber = from.replace('whatsapp:', '');

      // Look up user by phone number
      const user = await this.userRepository.findOne({
        where: { phone: phoneNumber },
      });

      if (!user) {
        console.error(`User not found for phone number: ${phoneNumber}`);
        return {
          success: false,
          message: 'User not found. Please contact hotel reception.',
        };
      }

      // Find active booking for this user
      const activeBooking = await this.bookingRepository.findOne({
        where: {
          userId: user.id,
          status: 'checked_in' as any,
        },
        relations: ['room', 'room.hotel'],
        order: { checkInDate: 'DESC' },
      });

      if (!activeBooking) {
        console.error(`No active booking found for user: ${user.id}`);
        return {
          success: false,
          message: 'No active booking found. Please contact hotel reception.',
        };
      }

      // Use OpenAI to categorize the message and translate to Amharic
      const categorization = await this.maintenanceService.categorizeMessage(messageBody);

      // Create maintenance request with translations
      const maintenance = await this.maintenanceService.create({
        hotelId: activeBooking.room.hotelId,
        roomId: activeBooking.roomId,
        bookingId: activeBooking.id,
        userId: user.id,
        description: categorization.summary,
        descriptionAmharic: categorization.summaryAmharic,
        category: categorization.category,
        priority: categorization.priority,
        status: MaintenanceStatus.PENDING,
        phoneNumber,
        originalMessage: messageBody,
        originalMessageAmharic: categorization.messageAmharic,
        aiAnalysis: JSON.stringify(categorization),
      });

      return {
        success: true,
        message: 'Maintenance request received. Hotel staff will assist you shortly.',
        requestId: maintenance.id,
      };
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return {
        success: false,
        message: 'Error processing your request. Please contact hotel reception.',
      };
    }
  }
}
