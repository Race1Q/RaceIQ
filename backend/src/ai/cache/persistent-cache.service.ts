import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class PersistentCacheService implements OnModuleInit {
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly logger = new Logger(PersistentCacheService.name);
  private readonly cacheDir = process.env.NODE_ENV === 'production' 
    ? join('/home', '.cache')
    : join(process.cwd(), '.cache');
  private readonly cacheFile = join(this.cacheDir, 'ai-cache.json');

  // Load cache from disk when the module initializes
  async onModuleInit() {
    if (existsSync(this.cacheFile)) {
      try {
        const data = await readFile(this.cacheFile, 'utf-8');
        const entries = JSON.parse(data);
        
        let loadedCount = 0;
        let expiredCount = 0;
        
        Object.entries(entries).forEach(([key, value]) => {
          const entry = value as CacheEntry<any>;
          // Only load non-expired entries
          if (entry.expiresAt > Date.now()) {
            this.cache.set(key, entry);
            loadedCount++;
          } else {
            expiredCount++;
          }
        });
        
        this.logger.log(
          `Loaded ${loadedCount} cached AI responses from disk (${expiredCount} expired entries skipped)`
        );
      } catch (err) {
        console.error('SERVICE FAILED:', err);
        this.logger.warn(`Failed to load cache from disk: ${err.message}`);
      }
    } else {
      this.logger.log('No existing cache file found, starting with empty cache');
    }
  }

  /**
   * Set a value in the cache with TTL
   * @param key Cache key
   * @param value Data to cache
   * @param ttlSeconds Time-to-live in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    
    this.logger.debug(`Cached key: ${key} (TTL: ${ttlSeconds}s)`);
    
    // Persist to disk asynchronously (don't await to avoid blocking)
    this.persistToDisk().catch(err => {
      this.logger.error(`Failed to persist cache to disk: ${err.message}`);
    });
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @param ignoreExpiry If true, return even expired entries
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string, ignoreExpiry = false): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check expiry
    if (!ignoreExpiry && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache key expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key}`);
    return entry.data as T;
  }

  // Check if a key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Delete a specific key
  delete(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Deleted cache key: ${key}`);
  }

  // Clear all cache entries
  async clear(): Promise<void> {
    this.cache.clear();
    await this.persistToDisk();
    this.logger.log('Cache cleared');
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Persist cache to disk
  private async persistToDisk(): Promise<void> {
    try {
      // Create cache directory if it doesn't exist
      if (!existsSync(this.cacheDir)) {
        await mkdir(this.cacheDir, { recursive: true });
      }

      // Convert Map to plain object for JSON serialization
      const entries = Object.fromEntries(this.cache);
      
      // Write to file
      await writeFile(this.cacheFile, JSON.stringify(entries, null, 2));
      
      this.logger.debug(`Persisted ${this.cache.size} cache entries to disk`);
    } catch (err) {
      console.error('SERVICE FAILED:', err);
      this.logger.error(`Failed to persist cache to disk: ${err.message}`);
    }
  }
}

