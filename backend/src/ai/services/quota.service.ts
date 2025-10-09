import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QuotaService {
  private dailyCount = 0;
  private lastReset = new Date().toDateString();
  private readonly logger = new Logger(QuotaService.name);
  private readonly DAILY_LIMIT = 1500; // Gemini Flash free tier limit

  /**
   * Increment the daily API call counter
   */
  increment(): void {
    this.checkReset();
    this.dailyCount++;
    
    // Log every 10 calls to monitor usage
    if (this.dailyCount % 10 === 0) {
      this.logger.log(`API calls today: ${this.dailyCount}/${this.DAILY_LIMIT} (Free Tier)`);
    }

    // Warn when approaching limit
    if (this.dailyCount >= this.DAILY_LIMIT * 0.8) {
      this.logger.warn(`Approaching daily quota limit: ${this.dailyCount}/${this.DAILY_LIMIT}`);
    }
  }

  /**
   * Get remaining API calls for today
   */
  getRemaining(): number {
    this.checkReset();
    return Math.max(0, this.DAILY_LIMIT - this.dailyCount);
  }

  /**
   * Check if we have quota available
   */
  hasQuota(): boolean {
    this.checkReset();
    return this.dailyCount < this.DAILY_LIMIT;
  }

  /**
   * Get current usage stats
   */
  getStats(): { used: number; remaining: number; limit: number; resetDate: string } {
    this.checkReset();
    return {
      used: this.dailyCount,
      remaining: this.getRemaining(),
      limit: this.DAILY_LIMIT,
      resetDate: this.lastReset,
    };
  }

  /**
   * Check if we need to reset the daily counter
   */
  private checkReset(): void {
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.logger.log(`Daily quota reset. Yesterday's usage: ${this.dailyCount}/${this.DAILY_LIMIT}`);
      this.dailyCount = 0;
      this.lastReset = today;
    }
  }
}

