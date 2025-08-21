import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { ConstructorService } from './constructors.service';
import { Constructor } from './constructors.entity';

@Controller('constructors')
export class ConstructorController {
  private readonly logger = new Logger(ConstructorController.name);

  constructor(private readonly constructorService: ConstructorService) {}

  @Post('ingest')
  async ingestConstructors() {
    this.logger.log('Starting constructors ingestion');
    const result = await this.constructorService.ingestConstructors();
    return {
      message: 'Constructors ingestion completed',
      result,
    };
  }

  @Get()
  async getAllConstructors(): Promise<Constructor[]> {
    return this.constructorService.getAllConstructors();
  }

  @Get('search')
  async searchConstructors(@Query('q') query: string): Promise<Constructor[]> {
    if (!query) {
      return this.constructorService.getAllConstructors();
    }
    return this.constructorService.searchConstructors(query);
  }

  @Get(':id')
  async getConstructorById(@Query('id') constructorId: string): Promise<Constructor | null> {
    return this.constructorService.getConstructorById(constructorId);
  }
}

