import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;
  private useExternal = false;

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

    // Determine if external API should be used
    this.useExternal = ((this.config.get<string>('ENABLE_EXTERNAL_API') || process.env.ENABLE_EXTERNAL_API || '').toLowerCase() === 'true');
    this.logger.log(`NotificationsService usingExternal=${this.useExternal} mode=${this.transporter ? 'smtp' : 'mock'}`);
  }

  async sendRaceUpdateEmail(recipientEmail: string, raceDetails: string): Promise<{ success: boolean; status: number; data?: unknown }> {
    const overrideTo = this.config.get<string>('NOTIFICATIONS_OVERRIDE_TO');
    const to = overrideTo || recipientEmail;
    const from = this.config.get<string>('NOTIFICATIONS_FROM_EMAIL') || this.config.get<string>('SMTP_USER') || 'no-reply@raceiq.local';

    // Parse boolean flag strictly to decide on external API usage
  const useExternal = ((this.config.get<string>('ENABLE_EXTERNAL_API') || '').toLowerCase() === 'true');

    // When enabled, try sending via external API first; on any failure, fall back to SMTP/mock
    if (useExternal) {
      const baseUrl = this.config.get<string>('EXTERNAL_API_BASE_URL');
      const apiKey = this.config.get<string>('EXTERNAL_API_KEY');

      if (!baseUrl) {
        this.logger.warn('ENABLE_EXTERNAL_API=true but EXTERNAL_API_BASE_URL is not set; falling back to SMTP/mock');
      } else {
        try {
          const url = `${baseUrl.replace(/\/$/, '')}/api/email/send`;

          // Parse race data to extract username and races
          let races: any[] = [];
          let username = 'RaceIQ User';
          try {
            const parsed = JSON.parse(raceDetails);
            races = Array.isArray(parsed?.races) ? parsed.races : [];
            username = parsed?.username || (to && typeof to === 'string' && to.includes('@') ? to.split('@')[0] : 'RaceIQ User');
          } catch {
            // If parse fails, use fallback
          }

          // Build race list for content_goal field
          const raceList = races.length > 0 
            ? races.slice(0, 3).map((r: any, i: number) => 
                `${i + 1}. ${r.grandPrix} (${r.date})`
              ).join('\n')
            : 'Check out the latest F1 race updates on RaceIQ!';

          // Build payload using their new template parameter mapping
          // Required fields: to, subject, message (these are mandatory)
          // Optional template fields: recipient_name, topic, session_time, venue, time_goal, content_goal, organizer
          const payload: Record<string, string> = {
            to,
            subject: this.config.get<string>('NOTIFICATIONS_SUBJECT') || 'RaceIQ Upcoming Races',
            message: raceList, // Required field - use race list as main message
            recipient_name: username,
            topic: 'Formula 1 Race Updates',
            session_time: new Date().toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            venue: 'RaceIQ Platform',
            time_goal: 'Stay updated with live race data',
            content_goal: raceList, // Also populate content_goal for template
            organizer: 'RaceIQ Team',
          };

          // Remove undefined or empty optional fields
          Object.keys(payload).forEach((k) => {
            if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
              delete payload[k];
            }
          });

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

          this.logger.debug(`[EMAIL EXT] Sending to ${url} with payload: ${JSON.stringify(payload, null, 2)}`);

          const resp = await axios.post(url, payload, {
            headers,
            timeout: 10000,
          });

          if (resp.status === 200 && resp.data?.success !== false) {
            this.logger.log(`[EMAIL EXT] Sent via external API for ${to}`);
            return { success: true, status: 200, data: { via: 'external-api' } };
          }

          this.logger.warn(`[EMAIL EXT] Non-200 (${resp.status}) for ${to}; falling back to SMTP/mock`);
        } catch (err: any) {
          const detail = err?.message ?? String(err);
          const responseData = err?.response?.data ? JSON.stringify(err.response.data) : 'no response data';
          this.logger.error(`[EMAIL EXT] Failed for ${to}: ${detail}; Response: ${responseData}; falling back to SMTP/mock`);
        }
      }
    }

    // Parse raceDetails as JSON if possible, fallback to string
    let races: any[] = [];
    let username = 'Racer';
    try {
      const parsed = JSON.parse(raceDetails);
      if (Array.isArray(parsed.races)) races = parsed.races;
      if (parsed.username) username = parsed.username;
    } catch {
      // fallback: treat as plain text
    }

    // Build HTML table rows (text only; no images)
    const raceRows = races.map(race => `
      <tr>
        <td class="round">
          <span style="display:inline-block;background:#e8f1ff;color:#0b5ed7;border:1px solid #cfe2ff;border-radius:999px;padding:4px 10px;font-weight:700;">Round ${race.round}</span>
        </td>
        <td class="gp">${race.grandPrix}</td>
        <td class="date"><span style="color:#2ecc40;font-weight:600;">${race.date}</span></td>
      </tr>
    `).join('');

    const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>RaceIQ Upcoming Races</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px #e0e0e0; padding: 32px; }
          .header { text-align: center; }
          .brand { color:#6c217e; font-weight:800; letter-spacing:0.3px; }
          .greeting { font-size: 1.2em; margin-bottom: 18px; color: #333; }
          .race-table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          .race-table th, .race-table td { padding: 12px 8px; text-align: left; }
          .race-table th { background: #eaf0fb; color: #2d3e50; font-size: 1em; }
          .race-table tr { border-bottom: 1px solid #f0f0f0; }
          .race-table td.round { font-weight: bold; color: #0074d9; }
          .race-table td.gp { font-weight: 500; }
          .race-table td.date { color: #2ecc40; font-size: 1em; }
          .footer { text-align: center; margin-top: 32px; color: #888; font-size: 0.95em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 class="brand">Upcoming Formula 1 Races</h2>
          </div>
          <div class="greeting">
            Hi <strong>${username}</strong>,<br>
            Here are the next 3 Formula 1 races, brought to you by <span style="color:#0074d9;font-weight:bold;">RaceIQ</span>!
          </div>
          <table class="race-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Grand Prix</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${raceRows}
            </tbody>
          </table>
          <div class="footer">
            Enjoy the races!<br>
            &mdash; The RaceIQ Team
          </div>
        </div>
      </body>
    </html>
    `;

    if (!this.transporter) {
      this.logger.log(`[EMAIL MOCK]\nFROM: ${from}\nTO: ${to}\nSUBJECT: RaceIQ Upcoming Races\nBODY:\n${htmlBody}`);
      return { success: true, status: 200, data: { via: 'mock' } };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'RaceIQ Upcoming Races',
        text: `Hi ${username},\nHere are the next 3 Formula 1 races:\n` + races.map(r => `${r.round}. ${r.grandPrix} (${r.date})`).join('\n'),
        html: htmlBody
      });
  this.logger.log(`Email sent to ${to} messageId=${info.messageId}`);
  return { success: true, status: 200, data: { via: 'smtp', messageId: info.messageId } };
    } catch (e: any) {
      this.logger.error(`SMTP send failed: ${e.message}`);
      return { success: false, status: 502, data: { error: 'SMTP send failed', detail: e.message } };
    }
  }
}


