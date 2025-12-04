import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance, MaintenanceCategory, MaintenancePriority } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import OpenAI from 'openai';

@Injectable()
export class MaintenanceService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
  ) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create(createMaintenanceDto);
    return await this.maintenanceRepository.save(maintenance);
  }

  async findAll(
    hotelId?: string,
    priority?: string,
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Maintenance[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = hotelId ? { hotelId } : {};

    if (priority) {
      where.priority = priority;
    }

    if (category) {
      where.category = category;
    }

    // Default sort order: if no filters are set, sort by createdAt (newest first)
    // Otherwise, sort by status, priority, then createdAt
    const hasFilters = priority || category;
    const orderBy = hasFilters
      ? { status: 'ASC' as const, priority: 'DESC' as const, createdAt: 'DESC' as const }
      : { createdAt: 'DESC' as const };

    const [data, total] = await this.maintenanceRepository.findAndCount({
      where,
      relations: ['hotel', 'room', 'booking', 'user'],
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

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['hotel', 'room', 'booking', 'user'],
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance request ${id} not found`);
    }

    return maintenance;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenance = await this.findOne(id);
    Object.assign(maintenance, updateMaintenanceDto);
    return await this.maintenanceRepository.save(maintenance);
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);
    await this.maintenanceRepository.remove(maintenance);
  }

  async categorizeMessage(message: string): Promise<{
    category: MaintenanceCategory;
    priority: MaintenancePriority;
    summary: string;
    summaryAmharic: string;
    messageAmharic: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a hotel maintenance categorization assistant for Ethiopian hotels. Analyze maintenance requests and categorize them, then translate to Amharic.

Categories:
- hvac: Air conditioning, heating, ventilation issues
- plumbing: Water leaks, toilet problems, shower issues
- electrical: Light problems, outlet issues, power problems
- furniture: Broken furniture, damaged fixtures
- cleaning: Cleaning requests, housekeeping issues
- appliances: TV, fridge, microwave issues
- other: Anything that doesn't fit above

Priority levels:
- urgent: Safety issues, no water/power, severe problems
- high: Significant discomfort but not dangerous
- medium: Moderate issues that need attention
- low: Minor issues, cosmetic problems

Respond in JSON format with:
{
  "category": "...",
  "priority": "...",
  "summary": "...",
  "summaryAmharic": "...",
  "messageAmharic": "..."
}

The summary should be a brief professional description in English (1-2 sentences).
The summaryAmharic should be the same professional summary translated to Amharic.
The messageAmharic should be the original user message translated to Amharic.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response);

      return {
        category: parsed.category as MaintenanceCategory,
        priority: parsed.priority as MaintenancePriority,
        summary: parsed.summary,
        summaryAmharic: parsed.summaryAmharic || parsed.summary,
        messageAmharic: parsed.messageAmharic || message,
      };
    } catch (error) {
      console.error('Error categorizing message:', error);
      // Fallback to default values if OpenAI fails
      return {
        category: MaintenanceCategory.OTHER,
        priority: MaintenancePriority.MEDIUM,
        summary: message.substring(0, 100),
        summaryAmharic: message.substring(0, 100),
        messageAmharic: message,
      };
    }
  }
}
