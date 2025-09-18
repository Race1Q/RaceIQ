import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructorEntity } from './constructors.entity';

@Injectable()
export class ConstructorsService {
  constructor(
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,
  ) {}

  async findAll(): Promise<ConstructorEntity[]> {
    return this.constructorRepository.find();
  }

  async findOne(id: number): Promise<ConstructorEntity> {
    const constructor = await this.constructorRepository.findOne({
      where: { id },
    });

    if (!constructor) {
      throw new NotFoundException(`Constructor with ID ${id} not found`);
    }
    return constructor;
  }
}


