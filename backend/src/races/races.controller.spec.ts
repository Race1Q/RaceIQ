import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

describe('RacesController', () => {
  let app: INestApplication;
  const mockService = { findAllRacesFor2025: jest.fn() } as any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RacesController],
      providers: [{ provide: RacesService, useValue: mockService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /races returns races for 2025', async () => {
    mockService.findAllRacesFor2025.mockResolvedValue([{ id: 1 }]);
    const res = await request(app.getHttpServer())
      .get('/races')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual([{ id: 1 }]);
  });
});
