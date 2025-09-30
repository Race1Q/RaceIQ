import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      const port = Number(this.config.get<string>('SMTP_PORT')) || 587;
      const secure = this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;
      const user = this.config.get<string>('SMTP_USER');
      const pass = this.config.get<string>('SMTP_PASS');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user ? { user, pass } : undefined,
      });
      this.logger.log(`SMTP transport initialized host=${host} port=${port} secure=${secure}`);
    } else {
      this.logger.warn('SMTP_HOST not set; operating in mock email mode.');
    }
  }

  async sendRaceUpdateEmail(recipientEmail: string, raceDetails: string): Promise<{ success: boolean; status: number; data?: unknown }> {
    const overrideTo = this.config.get<string>('NOTIFICATIONS_OVERRIDE_TO');
    const to = overrideTo || recipientEmail;
    const from = this.config.get<string>('NOTIFICATIONS_FROM_EMAIL') || this.config.get<string>('SMTP_USER') || 'no-reply@raceiq.local';

    if (!this.transporter) {
      this.logger.log(`[EMAIL MOCK]\nFROM: ${from}\nTO: ${to}\nSUBJECT: RaceIQ Upcoming Races\nBODY:\n${raceDetails}`);
      return { success: true, status: 200, data: { mock: true } };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'RaceIQ Upcoming Races',
        text: raceDetails,
        html: `<pre style="font-family:monospace;white-space:pre-wrap">${raceDetails}</pre>`
      });
      this.logger.log(`Email sent to ${to} messageId=${info.messageId}`);
      return { success: true, status: 200, data: { messageId: info.messageId } };
    } catch (e: any) {
      this.logger.error(`SMTP send failed: ${e.message}`);
      return { success: false, status: 502, data: { error: 'SMTP send failed', detail: e.message } };
    }
  }
}


