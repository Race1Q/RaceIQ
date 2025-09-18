import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './sessions.entity';
import { RacesModule } from '../races/races.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    RacesModule,
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class SessionsModule {}


