import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from './circuits.entity';

@Injectable()
export class CircuitsService {
  constructor(
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
  ) {}

  async findAll(): Promise<Circuit[]> {
    return this.circuitRepository.find({ relations: ['country'] });
  }

  async findOne(id: number): Promise<Circuit> {
    const circuit = await this.circuitRepository.findOne({
      where: { id },
      relations: ['country'],
    });
    if (!circuit) {
      throw new NotFoundException(`Circuit with ID ${id} not found`);
    }
    return circuit;
  }
}
