// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import Throttler
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { ConstructorsModule } from './constructors/constructors.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.back' }),
    ScheduleModule.forRoot(),
    // Configure Throttler: 10 requests per second per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    DriversModule,
    AdminModule,
    UsersModule,
    ConstructorsModule,
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Set the ThrottlerGuard as a global guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
