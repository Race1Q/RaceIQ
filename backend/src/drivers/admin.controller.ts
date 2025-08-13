import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestService } from './ingest.service';

@Controller('admin')
export class AdminController {
  constructor(private cfg: ConfigService, private ingest: IngestService) {}

  @Post('refresh-drivers')
  async refreshDrivers(
    @Headers('x-admin-token') token: string,
    @Body() body: { year?: string; meeting_key?: string } = {}
  ) {
    if (!token || token !== this.cfg.get<string>('ADMIN_TOKEN')) {
      throw new UnauthorizedException('Invalid admin token');
    }
    return this.ingest.run({ year: body.year, meeting_key: body.meeting_key });
  }
}
