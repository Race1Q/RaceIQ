import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StandingsService {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    // Determine the SSL configuration based on the environment
    const isLocal = this.configService.get<string>('NODE_ENV') === 'development';
    const sslConfig = isLocal 
      ? { rejectUnauthorized: false } // For local development, ignore self-signed certs
      : true; // For production, require valid certs

    // Initialize the PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
      ssl: sslConfig,
    });
  }

  async getDriverStandings(season: string) {
    const DRIVER_STANDINGS_QUERY = `
      SELECT
        d.first_name || ' ' || d.last_name AS driver,
        ds.points::float AS points,
        ds.position,
        ds.wins::int AS wins
      FROM driver_standings ds
      JOIN drivers d ON d.id = ds.driver_id
      WHERE ds.season = $1
      ORDER BY ds.position ASC;
    `;
    const result = await this.pool.query(DRIVER_STANDINGS_QUERY, [season]);
    return result.rows;
  }

  async getCurrentSeason() {
    const CURRENT_SEASON_QUERY = `SELECT MAX(season) AS year FROM driver_standings;`;
    const result = await this.pool.query(CURRENT_SEASON_QUERY);
    return result.rows[0]?.year;
  }
}
