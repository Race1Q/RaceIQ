import { Test } from '@nestjs/testing';
import { DriverStandingsService } from './driver-standings.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('DriverStandingsService', () => {
  let service: DriverStandingsService;
  const client = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DriverStandingsService,
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(DriverStandingsService);
    jest.clearAllMocks();
  });

  it('testConnection returns true on success, false on error', async () => {
    client.limit.mockReturnValueOnce({ data: [{}], error: null });
    await expect(service.testConnection()).resolves.toBe(true);

    client.limit.mockReturnValueOnce({ data: null, error: { message: 'boom' } });
    await expect(service.testConnection()).resolves.toBe(false);
  });

  it('getAllDriverStandings returns ordered rows', async () => {
    const rows = [{ race_id: 1, position: 1 }];
    client.order.mockReturnValueOnce({ order: client.order, data: rows, error: null });
    const res = await service.getAllDriverStandings();
    expect(res).toEqual(rows);
  });

  it('getAllDriverStandings throws on error', async () => {
    client.order.mockReturnValueOnce({ order: client.order, data: null, error: { message: 'x' } });
    await expect(service.getAllDriverStandings()).rejects.toThrow('Failed to fetch driver standings');
  });

  it('getDriverStandingsByRace returns rows ordered by position', async () => {
    const rows = [{ race_id: 1, position: 1 }];
    client.order.mockReturnValueOnce({ data: rows, error: null });
    const res = await service.getDriverStandingsByRace(10);
    expect(res).toEqual(rows);
    expect(client.eq).toHaveBeenCalledWith('race_id', 10);
  });

  it('getDriverStandingsByDriver returns rows ordered by season and race_id', async () => {
    const rows = [{ driver_id: 7, season: 2024 }];
    client.order.mockReturnValueOnce({ order: client.order, data: rows, error: null });
    const res = await service.getDriverStandingsByDriver(7);
    expect(res).toEqual(rows);
    expect(client.eq).toHaveBeenCalledWith('driver_id', 7);
  });

  it('getDriverStandingsBySeason returns rows ordered by position', async () => {
    const rows = [{ season: 2024, position: 1 }];
    client.order.mockReturnValueOnce({ data: rows, error: null });
    const res = await service.getDriverStandingsBySeason(2024);
    expect(res).toEqual(rows);
    expect(client.eq).toHaveBeenCalledWith('season', 2024);
  });

  it('searchDriverStandings returns rows ordered by season/position', async () => {
    const rows = [{ season: 2024, position: 1 }];
    client.order.mockReturnValueOnce({ order: client.order, data: rows, error: null });
    const res = await service.searchDriverStandings('2024');
    expect(res).toEqual(rows);
    expect(client.or).toHaveBeenCalled();
  });
});
