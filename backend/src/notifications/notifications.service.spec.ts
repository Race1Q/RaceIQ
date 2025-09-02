import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let httpService: { post: jest.Mock };

  beforeEach(async () => {
    httpService = { post: jest.fn() } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it('returns success=true when a later attempt succeeds (retry across attempts)', async () => {
    // First call returns 500; second call returns 200
    httpService.post
      .mockReturnValueOnce(of({ status: 500, data: { error: 'bad' } }))
      .mockReturnValueOnce(of({ status: 201, data: { ok: true } }));

    const res = await service.sendRaceUpdateEmail('test@example.com', 'Race X starts at 1PM');

    expect(res.success).toBe(true);
    expect(res.status).toBe(201);
    expect(httpService.post).toHaveBeenCalledTimes(2);
    expect(httpService.post.mock.calls[0][0]).toContain('/invite');
  });

  it('returns success=false after exhausting all attempts', async () => {
    // Always non-2xx status to force failure over all attempts
    httpService.post.mockReturnValue(of({ status: 400, data: { error: 'bad request' } }));

    const res = await service.sendRaceUpdateEmail('nobody@example.com', 'Race details');

    expect(res.success).toBe(false);
    expect(res.status).toBe(502);
    // 7 JSON attempts + 7 FORM attempts = 14
    expect(httpService.post.mock.calls.length).toBeGreaterThanOrEqual(14);
  });
});
