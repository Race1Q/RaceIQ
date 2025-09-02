import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let app: INestApplication;
  const mockService = {
    sendRaceUpdateEmail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('400 when body is missing recipientEmail or raceDetails', async () => {
    await request(app.getHttpServer())
      .post('/notifications/send-race-update')
      .send({})
      .expect(HttpStatus.BAD_REQUEST);

    await request(app.getHttpServer())
      .post('/notifications/send-race-update')
      .send({ recipientEmail: 'a@b.com' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('201 when service returns success', async () => {
    mockService.sendRaceUpdateEmail.mockResolvedValue({ success: true, status: 202, data: { ok: true } });

    const res = await request(app.getHttpServer())
      .post('/notifications/send-race-update')
      .send({ recipientEmail: 'ok@ex.com', raceDetails: 'Race today' })
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(expect.objectContaining({ message: 'Race update email sent', status: 202 }));
  });

  it('propagates error status when service fails', async () => {
    mockService.sendRaceUpdateEmail.mockResolvedValue({ success: false, status: 502, data: { msg: 'fail' } });

    await request(app.getHttpServer())
      .post('/notifications/send-race-update')
      .send({ recipientEmail: 'bad@ex.com', raceDetails: 'Race' })
      .expect(502);
  });
});
