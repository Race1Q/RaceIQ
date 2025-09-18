import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructorEntity } from './constructors.entity';
import { ConstructorsController } from './constructors.controller';
import { ConstructorsService } from './constructors.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructorEntity])],
  controllers: [ConstructorsController],
  providers: [ConstructorsService],
  exports: [ConstructorsService, TypeOrmModule],
})
export class ConstructorsModule {}


