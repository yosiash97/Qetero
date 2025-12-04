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
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InquiryStatus } from './entities/inquiry.entity';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.inquiriesService.findAll(status, pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateInquiryDto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }

  // Twilio WhatsApp webhook endpoint for inquiries (no auth guard)
  @Post('webhook/whatsapp')
  async handleWhatsAppInquiry(@Body() body: any) {
    try {
      const from = body.From; // Phone number in format: whatsapp:+1234567890
      const messageBody = body.Body;
      const profileName = body.ProfileName || 'Guest'; // WhatsApp profile name if available

      // Extract phone number without 'whatsapp:' prefix
      const phoneNumber = from.replace('whatsapp:', '');

      // Use OpenAI to translate and analyze the message
      const analysis = await this.inquiriesService.translateAndAnalyzeMessage(
        messageBody,
        profileName,
      );

      // Create inquiry with translations
      const inquiry = await this.inquiriesService.create({
        name: profileName,
        phoneNumber,
        message: messageBody,
        messageEnglish: analysis.messageEnglish,
        messageAmharic: analysis.messageAmharic,
        status: InquiryStatus.RECEIVED,
        originalLanguage: analysis.originalLanguage,
        aiAnalysis: JSON.stringify({
          summary: analysis.summary,
          originalLanguage: analysis.originalLanguage,
        }),
      });

      return {
        success: true,
        message: 'Thank you for your inquiry! Our team will get back to you shortly.',
        inquiryId: inquiry.id,
      };
    } catch (error) {
      console.error('Error processing WhatsApp inquiry:', error);
      return {
        success: false,
        message: 'Error processing your inquiry. Please try again or contact us directly.',
      };
    }
  }
}
