import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ConstructorStandingsController } from './constructorStandings.controller';
import { ConstructorStandingsIngestService } from './constructorStandings-ingest.service';
import { ConstructorStandingsService } from './constructorStandings.service';

describe('ConstructorStandingsController', () => {
  let app: INestApplication;
  const mockIngest = { ingestAllConstructorStandings: jest.fn() };
  const mockService = {} as Partial<ConstructorStandingsService> as any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ConstructorStandingsController],
      providers: [
        { provide: ConstructorStandingsIngestService, useValue: mockIngest },
        { provide: ConstructorStandingsService, useValue: mockService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /constructor-standings/ingest returns 201 and summary', async () => {
    mockIngest.ingestAllConstructorStandings.mockResolvedValue({ created: 1, updated: 0, skipped: 0 });

    const res = await request(app.getHttpServer())
      .post('/constructor-standings/ingest')
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual({ created: 1, updated: 0, skipped: 0 });
  });

  it('GET /constructor-standings/:season returns summary (proxied to ingest per implementation)', async () => {
    mockIngest.ingestAllConstructorStandings.mockResolvedValue({ created: 2, updated: 3, skipped: 4 });

    const res = await request(app.getHttpServer())
      .get('/constructor-standings/2024')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({ created: 2, updated: 3, skipped: 4 });
  });
});
