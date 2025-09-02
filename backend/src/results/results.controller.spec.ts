import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ResultsController } from './results.controller';
import { ResultsIngestService } from './results-ingest.service';

describe('ResultsController', () => {
  let app: INestApplication;
  const mockIngest = { ingestAllRaceResults: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ResultsController],
      providers: [{ provide: ResultsIngestService, useValue: mockIngest }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /results/ingest returns 201 and summary', async () => {
    mockIngest.ingestAllRaceResults.mockResolvedValue({ created: 10, updated: 5 });

    const res = await request(app.getHttpServer())
      .post('/results/ingest')
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual({ created: 10, updated: 5 });
  });
});
