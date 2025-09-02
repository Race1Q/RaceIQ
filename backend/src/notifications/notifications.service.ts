import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly baseUrl = 'https://lockedin-backsupa.onrender.com/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendRaceUpdateEmail(recipientEmail: string, raceDetails: string): Promise<{ success: boolean; status: number; data?: unknown }> {
    const url = `${this.baseUrl}/invite`;
    const jsonAttempts: Array<Record<string, unknown>> = [
      { recipientEmail, message: raceDetails },
      { email: recipientEmail, message: raceDetails },
      { to: recipientEmail, message: raceDetails },
      { inviteeEmail: recipientEmail, message: raceDetails },
      { recipient: recipientEmail, message: raceDetails },
      { recipientEmail, content: raceDetails },
      { email: recipientEmail, content: raceDetails },
    ];

    const formAttempts: Array<Record<string, string>> = [
      { recipientEmail, message: raceDetails },
      { email: recipientEmail, message: raceDetails },
      { to: recipientEmail, message: raceDetails },
      { inviteeEmail: recipientEmail, message: raceDetails },
      { recipient: recipientEmail, message: raceDetails },
      { recipientEmail, content: raceDetails },
      { email: recipientEmail, content: raceDetails },
    ];

    // Prepare optional auth headers if provided via env
    const bearer = this.configService.get<string>('LOCKEDIN_BEARER_TOKEN');
    const apiKey = this.configService.get<string>('LOCKEDIN_API_KEY');
    const cookie = this.configService.get<string>('LOCKEDIN_COOKIE');
    const extraHeaders: Record<string, string> = {};
    if (bearer) extraHeaders['Authorization'] = `Bearer ${bearer}`;
    if (apiKey) extraHeaders['x-api-key'] = apiKey;
    if (cookie) extraHeaders['Cookie'] = cookie;

    // Try JSON payloads first
    for (let i = 0; i < jsonAttempts.length; i += 1) {
      const payload = jsonAttempts[i];
      try {
        this.logger.log(`Sending race update email try #${i + 1} to ${recipientEmail} with payload keys: ${Object.keys(payload).join(',')}`);
        const response = await firstValueFrom(
          this.httpService.post(url, payload, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...extraHeaders },
            validateStatus: () => true,
            timeout: 15000,
          }),
        );

        const { status, data } = response;
        if (status >= 200 && status < 300) {
          this.logger.log(`Race update email sent successfully to ${recipientEmail} (status ${status}) on attempt #${i + 1}.`);
          return { success: true, status, data };
        }

        this.logger.warn(`JSON attempt #${i + 1} failed for ${recipientEmail}. Status: ${status}. Response: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
        // continue to next attempt
      } catch (error: any) {
        const status = error?.response?.status ?? 500;
        const data = error?.response?.data ?? error?.message ?? 'Unknown error';
        this.logger.warn(`JSON attempt #${i + 1} error for ${recipientEmail}: status=${status} detail=${typeof data === 'string' ? data : JSON.stringify(data)}`);
        // continue to next attempt
      }
    }

    // Try x-www-form-urlencoded payloads
    for (let i = 0; i < formAttempts.length; i += 1) {
      const formObj = formAttempts[i];
      try {
        const searchParams = new URLSearchParams(formObj);
        this.logger.log(`FORM attempt #${i + 1} to ${recipientEmail} with keys: ${Object.keys(formObj).join(',')}`);
        const response = await firstValueFrom(
          this.httpService.post(url, searchParams.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', ...extraHeaders },
            validateStatus: () => true,
            timeout: 15000,
          }),
        );

        const { status, data } = response;
        if (status >= 200 && status < 300) {
          this.logger.log(`Race update email sent successfully to ${recipientEmail} via FORM (status ${status}) on attempt #${i + 1}.`);
          return { success: true, status, data };
        }

        this.logger.warn(`FORM attempt #${i + 1} failed for ${recipientEmail}. Status: ${status}. Response: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
      } catch (error: any) {
        const status = error?.response?.status ?? 500;
        const data = error?.response?.data ?? error?.message ?? 'Unknown error';
        this.logger.warn(`FORM attempt #${i + 1} error for ${recipientEmail}: status=${status} detail=${typeof data === 'string' ? data : JSON.stringify(data)}`);
      }
    }

    this.logger.error(`All attempts to send race update email to ${recipientEmail} failed.`);
    return { success: false, status: 502, data: { message: 'Failed to send via external service' } };
  }
}


