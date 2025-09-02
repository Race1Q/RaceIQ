import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { DriverStandingsController } from './driverStandings.controller';
import { DriverStandingsService } from './driverStandings.service';
import { DriverStandingIngestService } from './driverStandings-ingest.service';

describe('DriverStandingsController', () => {
  let app: INestApplication;
  const mockService = {
    testConnection: jest.fn(),
    getAllDriverStandings: jest.fn(),
    getDriverStandingsByRace: jest.fn(),
    getDriverStandingsByDriver: jest.fn(),
    getDriverStandingsBySeason: jest.fn(),
    searchDriverStandings: jest.fn(),
  };
  const mockIngest = { ingestAllDriverStandings: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DriverStandingsController],
      providers: [
        { provide: DriverStandingsService, useValue: mockService },
        { provide: DriverStandingIngestService, useValue: mockIngest },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /driver-standings/ingest returns 201 with summary', async () => {
    mockIngest.ingestAllDriverStandings.mockResolvedValue({ created: 1, updated: 2 });
    const res = await request(app.getHttpServer())
      .post('/driver-standings/ingest')
      .expect(HttpStatus.CREATED);
    expect(res.body).toEqual({ created: 1, updated: 2 });
  });

  it('GET /driver-standings/test-connection returns success true/false', async () => {
    mockService.testConnection.mockResolvedValue(true);
    const res = await request(app.getHttpServer())
      .get('/driver-standings/test-connection')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual({ success: true });
  });

  it('GET /driver-standings returns all standings', async () => {
    mockService.getAllDriverStandings.mockResolvedValue([{ race_id: 1 }]);
    const res = await request(app.getHttpServer())
      .get('/driver-standings')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual([{ race_id: 1 }]);
  });

  it('GET /driver-standings/race/:raceId returns standings for a race', async () => {
    mockService.getDriverStandingsByRace.mockResolvedValue([{ race_id: 77 }]);
    const res = await request(app.getHttpServer())
      .get('/driver-standings/race/77')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual([{ race_id: 77 }]);
  });

  it('GET /driver-standings/driver/:driverId returns standings for a driver', async () => {
    mockService.getDriverStandingsByDriver.mockResolvedValue([{ driver_id: 5 }]);
    const res = await request(app.getHttpServer())
      .get('/driver-standings/driver/5')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual([{ driver_id: 5 }]);
  });

  it('GET /driver-standings/season/:season returns standings for a season', async () => {
    mockService.getDriverStandingsBySeason.mockResolvedValue([{ season: 2024 }]);
    const res = await request(app.getHttpServer())
      .get('/driver-standings/season/2024')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual([{ season: 2024 }]);
  });

  it('GET /driver-standings/search?q=term returns search results', async () => {
    mockService.searchDriverStandings.mockResolvedValue([{ season: 2024, position: 1 }]);
    const res = await request(app.getHttpServer())
      .get('/driver-standings/search?q=2024')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual([{ season: 2024, position: 1 }]);
  });
});
