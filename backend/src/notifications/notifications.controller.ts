import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

class SendRaceUpdateDto {
  recipientEmail!: string;
  raceDetails!: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-race-update')
  async sendRaceUpdate(@Body() body: SendRaceUpdateDto) {
    const { recipientEmail, raceDetails } = body ?? {} as SendRaceUpdateDto;
    if (!recipientEmail || !raceDetails) {
      throw new HttpException('recipientEmail and raceDetails are required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.notificationsService.sendRaceUpdateEmail(recipientEmail, raceDetails);
    if (!result.success) {
      throw new HttpException(result.data ?? 'Failed to send email', result.status || HttpStatus.BAD_GATEWAY);
    }
    return { message: 'Race update email sent', status: result.status, data: result.data };
  }
}


