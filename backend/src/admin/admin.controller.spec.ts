import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';

describe('AdminController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { sub: 'auth0|1', permissions: ['admin:all'] };
          return true;
        },
      })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /admin/dashboard returns a stats summary', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(expect.objectContaining({
      users: expect.any(Number),
      activeSessions: expect.any(Number),
      apiCallsToday: expect.any(Number),
      status: expect.any(String),
      at: expect.any(String),
    }));
  });

  it('GET /admin/me returns token claim subset', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/me')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(expect.objectContaining({ sub: 'auth0|1' }));
  });
});
