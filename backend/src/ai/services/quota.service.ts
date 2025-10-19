import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QuotaService {
  private dailyCount = 0;
  private minuteCount = 0;
  private lastReset = new Date().toDateString();
  private lastMinuteReset = Date.now();
  private readonly logger = new Logger(QuotaService.name);
  private readonly DAILY_LIMIT = 1500; // Gemini 2.0 Flash free tier limit
  private readonly MINUTE_LIMIT = 15; // Gemini 2.0 Flash free tier limit

  /**
   * Increment the API call counters (both daily and minute)
   */
  increment(): void {
    this.checkResets();
    this.dailyCount++;
    this.minuteCount++;
    
    // Log every 10 calls to monitor usage
    if (this.dailyCount % 10 === 0) {
      this.logger.log(`API calls today: ${this.dailyCount}/${this.DAILY_LIMIT} (Free Tier)`);
    }

    // Warn when approaching daily limit
    if (this.dailyCount >= this.DAILY_LIMIT * 0.8) {
      this.logger.warn(`Approaching daily quota limit: ${this.dailyCount}/${this.DAILY_LIMIT}`);
    }

    // Warn when approaching minute limit
    if (this.minuteCount >= this.MINUTE_LIMIT * 0.8) {
      this.logger.warn(`Approaching minute quota limit: ${this.minuteCount}/${this.MINUTE_LIMIT}`);
    }
  }

  /**
   * Get remaining API calls for today
   */
  getRemaining(): number {
    this.checkResets();
    return Math.max(0, this.DAILY_LIMIT - this.dailyCount);
  }

  /**
   * Get remaining API calls for this minute
   */
  getRemainingThisMinute(): number {
    this.checkResets();
    return Math.max(0, this.MINUTE_LIMIT - this.minuteCount);
  }

  /**
   * Check if we have quota available (both daily and minute)
   */
  hasQuota(): boolean {
    this.checkResets();
    return this.dailyCount < this.DAILY_LIMIT && this.minuteCount < this.MINUTE_LIMIT;
  }

  /**
   * Get current usage stats
   */
  getStats(): { 
    daily: { used: number; remaining: number; limit: number; resetDate: string };
    minute: { used: number; remaining: number; limit: number };
  } {
    this.checkResets();
    return {
      daily: {
        used: this.dailyCount,
        remaining: this.getRemaining(),
        limit: this.DAILY_LIMIT,
        resetDate: this.lastReset,
      },
      minute: {
        used: this.minuteCount,
        remaining: this.getRemainingThisMinute(),
        limit: this.MINUTE_LIMIT,
      },
    };
  }

  /**
   * Check if we need to reset the daily and minute counters
   */
  private checkResets(): void {
    const now = Date.now();
    const today = new Date().toDateString();
    
    // Reset daily counter if it's a new day
    if (today !== this.lastReset) {
      this.logger.log(`Daily quota reset. Yesterday's usage: ${this.dailyCount}/${this.DAILY_LIMIT}`);
      this.dailyCount = 0;
      this.lastReset = today;
    }
    
    // Reset minute counter if it's been more than a minute
    if (now - this.lastMinuteReset >= 60000) {
      this.logger.debug(`Minute quota reset. Previous minute's usage: ${this.minuteCount}/${this.MINUTE_LIMIT}`);
      this.minuteCount = 0;
      this.lastMinuteReset = now;
    }
  }
}

