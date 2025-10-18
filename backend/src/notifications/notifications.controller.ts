import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { UsersService } from '../users/users.service';
import { ApiErrorDto } from '../common/dto/api-error.dto';

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
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., DTO validation failed, raceDetails is required).',
    type: ApiErrorDto,
  })
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


