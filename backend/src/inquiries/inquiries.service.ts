import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from './entities/inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import OpenAI from 'openai';

@Injectable()
export class InquiriesService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async create(createInquiryDto: CreateInquiryDto): Promise<Inquiry> {
    const inquiry = this.inquiryRepository.create(createInquiryDto);
    return await this.inquiryRepository.save(inquiry);
  }

  async findAll(
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Inquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Default sort order: if no filters are set, sort by createdAt (newest first)
    // Otherwise, sort by status, then createdAt
    const hasFilters = status;
    const orderBy = hasFilters
      ? { status: 'ASC' as const, createdAt: 'DESC' as const }
      : { createdAt: 'DESC' as const };

    const [data, total] = await this.inquiryRepository.findAndCount({
      where,
      order: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }

    return inquiry;
  }

  async update(id: string, updateInquiryDto: UpdateInquiryDto): Promise<Inquiry> {
    const inquiry = await this.findOne(id);

    // If status is being changed to addressed, set addressedAt
    if (updateInquiryDto.status === InquiryStatus.ADDRESSED && inquiry.status !== InquiryStatus.ADDRESSED) {
      inquiry.addressedAt = new Date();
    }

    Object.assign(inquiry, updateInquiryDto);
    return await this.inquiryRepository.save(inquiry);
  }

  async remove(id: string): Promise<void> {
    const inquiry = await this.findOne(id);
    await this.inquiryRepository.remove(inquiry);
  }

  async translateAndAnalyzeMessage(
    message: string,
    name: string,
  ): Promise<{
    messageEnglish: string;
    messageAmharic: string;
    originalLanguage: string;
    summary: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a hotel inquiry assistant for Ethiopian hotels.
You receive messages from potential guests who want to inquire about booking rooms, services, pricing, or general information.

Your tasks:
1. Detect the original language of the message
2. Translate the message to English (if not already in English)
3. Translate the message to Amharic (if not already in Amharic)
4. Create a brief summary of the inquiry in English

Respond in JSON format with:
{
  "messageEnglish": "...",
  "messageAmharic": "...",
  "originalLanguage": "...",
  "summary": "..."
}

The summary should be a brief professional description in English (1-2 sentences) of what the person is inquiring about.
The originalLanguage should be the detected language code (e.g., "en", "am", "es", etc.).`,
          },
          {
            role: 'user',
            content: `Name: ${name}\nMessage: ${message}`,
          },
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response);

      return {
        messageEnglish: parsed.messageEnglish || message,
        messageAmharic: parsed.messageAmharic || message,
        originalLanguage: parsed.originalLanguage || 'unknown',
        summary: parsed.summary || message.substring(0, 100),
      };
    } catch (error) {
      console.error('Error translating and analyzing message:', error);
      // Fallback to default values if OpenAI fails
      return {
        messageEnglish: message,
        messageAmharic: message,
        originalLanguage: 'unknown',
        summary: message.substring(0, 100),
      };
    }
  }
}
