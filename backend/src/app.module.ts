import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { ConstructorsModule } from './constructors/constructors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.back' }),
    ScheduleModule.forRoot(),
    AuthModule,
    DriversModule,
    AdminModule,
    UsersModule,
    ConstructorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
