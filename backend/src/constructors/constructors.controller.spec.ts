import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ConstructorsController } from './constructors.controller';
import { ConstructorsService } from './constructors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';

describe('ConstructorsController', () => {
  let app: INestApplication;
  const mockService = {
    ingestConstructors: jest.fn(),
    getAllConstructors: jest.fn(),
    findByApiId: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ConstructorsController],
      providers: [{ provide: ConstructorsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /constructors/ingest returns 201 and starts ingestion', async () => {
    mockService.ingestConstructors.mockResolvedValue({ count: 2 });

    const res = await request(app.getHttpServer())
      .post('/constructors/ingest')
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual({ message: 'Constructor ingestion started in the background.' });
  });

  it('GET /constructors returns list', async () => {
    mockService.getAllConstructors.mockResolvedValue([{ name: 'Ferrari' }]);

    const res = await request(app.getHttpServer())
      .get('/constructors')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual([{ name: 'Ferrari' }]);
  });

  it('GET /constructors/by-api-id/:id returns one constructor', async () => {
    mockService.findByApiId.mockResolvedValue({ constructor_id: 'rb' });

    const res = await request(app.getHttpServer())
      .get('/constructors/by-api-id/rb')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({ constructor_id: 'rb' });
  });
});
