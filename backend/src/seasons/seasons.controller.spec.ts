import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { SeasonsController } from './seasons.controller';
import { SeasonIngestService } from './seasons-ingest.service';

describe('SeasonsController', () => {
  let app: INestApplication;
  const mockIngest = { ingestSeasons: jest.fn() } as any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SeasonsController],
      providers: [{ provide: SeasonIngestService, useValue: mockIngest }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /seasons/ingest returns 201 and ingestion summary', async () => {
    mockIngest.ingestSeasons.mockResolvedValue({ created: 3, updated: 7 });

    const res = await request(app.getHttpServer())
      .post('/seasons/ingest')
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual({ created: 3, updated: 7 });
  });
});
