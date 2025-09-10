import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';
import { RaceResultsIngestionService } from './race-results-ingestion.service';

describe('RaceResultsController', () => {
  let app: INestApplication;
  const mockService = { getBySessionId: jest.fn() };
  const mockIngest = { ingestOnly2024And2025: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RaceResultsController],
      providers: [
        { provide: RaceResultsService, useValue: mockService },
        { provide: RaceResultsIngestionService, useValue: mockIngest },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /race-results/session/:id returns rows', async () => {
    mockService.getBySessionId.mockResolvedValue([{ id: 1, session_id: 77 }]);

    const res = await request(app.getHttpServer())
      .get('/race-results/session/77')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual([{ id: 1, session_id: 77 }]);
    expect(mockService.getBySessionId).toHaveBeenCalledWith(77);
  });

  it('POST /race-results/ingest triggers ingestion and returns summary', async () => {
    mockIngest.ingestOnly2024And2025.mockResolvedValue({ created: 5, updated: 2 });

    const res = await request(app.getHttpServer())
      .post('/race-results/ingest')
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual({ created: 5, updated: 2 });
  });
});
