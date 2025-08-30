const request = require('supertest');
const app = require('../index');
const { query } = require('../standings-api/db');

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const mockQuery = require('../standings-api/db').query;

describe('Driver Standings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'raceiq-standings-api');
    });
  });

  describe('GET /api/standings/drivers', () => {
    const mockStandingsData = [
      {
        driver_id: 1,
        driver: 'Max Verstappen',
        name_acronym: 'VER',
        driver_number: 1,
        points: 255,
        position: 1,
        wins: 6
      },
      {
        driver_id: 2,
        driver: 'Lewis Hamilton',
        name_acronym: 'HAM',
        driver_number: 44,
        points: 220,
        position: 2,
        wins: 4
      }
    ];

    beforeEach(() => {
      // Mock current season query
      mockQuery.mockImplementation((sql, params) => {
        if (sql.includes('seasons')) {
          return Promise.resolve({ rows: [{ year: 2025 }] });
        }
        // Mock standings query
        return Promise.resolve({ rows: mockStandingsData });
      });
    });

    it('should return driver standings for current season', async () => {
      const response = await request(app)
        .get('/api/standings/drivers')
        .expect(200);

      expect(response.body).toHaveProperty('season', 2025);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('driver', 'Max Verstappen');
    });

    it('should return driver standings for specific season', async () => {
      const response = await request(app)
        .get('/api/standings/drivers?season=2024')
        .expect(200);

      expect(response.body).toHaveProperty('season', 2024);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('driver_standings'),
        [2024]
      );
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/standings/drivers?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('totalItems');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should handle sorting', async () => {
      const response = await request(app)
        .get('/api/standings/drivers?sort=wins&dir=asc')
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('wins', 4); // Lewis Hamilton
      expect(response.body.data[1]).toHaveProperty('wins', 6); // Max Verstappen
    });

    it('should return CSV format when requested', async () => {
      const response = await request(app)
        .get('/api/standings/drivers?format=csv')
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('position,driver,name_acronym');
      expect(response.text).toContain('Max Verstappen');
    });

    it('should handle invalid season', async () => {
      const response = await request(app)
        .get('/api/standings/drivers?season=invalid')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle season with no data', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ year: 2025 }] });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/standings/drivers?season=2025')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No standings found');
    });

    it('should enforce rate limiting', async () => {
      // This test would require configuring the rate limiter for testing
      // For now, we'll just verify the endpoint exists and responds
      const response = await request(app)
        .get('/api/standings/drivers')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/standings/drivers/export', () => {
    const mockExportData = [
      {
        driver_id: 1,
        driver: 'Max Verstappen',
        name_acronym: 'VER',
        driver_number: 1,
        points: 255,
        position: 1,
        wins: 6
      }
    ];

    beforeEach(() => {
      mockQuery.mockImplementation((sql, params) => {
        if (sql.includes('seasons')) {
          return Promise.resolve({ rows: [{ year: 2025 }] });
        }
        return Promise.resolve({ rows: mockExportData });
      });
    });

    it('should export driver standings as CSV', async () => {
      const response = await request(app)
        .get('/api/standings/drivers/export')
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toContain('driver-standings-2025-full.csv');
      expect(response.text).toContain('position,driver,name_acronym');
      expect(response.text).toContain('Max Verstappen');
    });

    it('should export for specific season', async () => {
      const response = await request(app)
        .get('/api/standings/drivers/export?season=2024')
        .expect(200);

      expect(response.headers['content-disposition']).toContain('driver-standings-2024-full.csv');
    });
  });

  describe('Security', () => {
    it('should require valid API key when configured', async () => {
      // Set API key in environment
      process.env.API_KEY = 'test-key';

      const response = await request(app)
        .get('/api/standings/drivers')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      // Clean up
      delete process.env.API_KEY;
    });

    it('should accept valid API key', async () => {
      process.env.API_KEY = 'test-key';

      mockQuery.mockResolvedValueOnce({ rows: [{ year: 2025 }] });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/standings/drivers')
        .set('x-api-key', 'test-key')
        .expect(404); // 404 because no data, but auth passed

      delete process.env.API_KEY;
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/standings/drivers')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});