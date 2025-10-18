import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './sessions.entity';
import { RacesModule } from '../races/races.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    forwardRef(() => RacesModule), // Provides Race (circular dependency)
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class SessionsModule {}


