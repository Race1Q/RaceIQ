import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { UsersService } from '../users/users.service';

class SendRaceUpdateDto {
  raceDetails!: string; // only need race details from client now
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiExcludeEndpoint()
  @Post('send-race-update')
  async sendRaceUpdate(@AuthUser() authUser: any, @Body() body: SendRaceUpdateDto) {
    const { raceDetails } = body ?? {} as SendRaceUpdateDto;
    if (!raceDetails) {
      throw new HttpException('raceDetails is required', HttpStatus.BAD_REQUEST);
    }
    // Look up user profile to get stored email
    const profile = await this.usersService.getProfile(authUser.sub);
    if (!profile.email) {
      throw new HttpException('No email on file for user', HttpStatus.BAD_REQUEST);
    }
    const result = await this.notificationsService.sendRaceUpdateEmail(profile.email, raceDetails);
    if (!result.success) {
      throw new HttpException(result.data ?? 'Failed to send email', result.status || HttpStatus.BAD_GATEWAY);
    }
    return { message: 'Race update email sent', status: result.status, data: result.data };
  }
}


