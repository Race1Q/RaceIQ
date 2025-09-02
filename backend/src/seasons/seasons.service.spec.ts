import { Test } from '@nestjs/testing';
import { SeasonsService } from './seasons.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('SeasonsService', () => {
  let service: SeasonsService;
  const client = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SeasonsService,
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(SeasonsService);
    jest.clearAllMocks();
  });

  it('testConnection returns true when data exists', async () => {
    client.select.mockReturnValueOnce({
      limit: jest.fn().mockReturnValue({ data: [{}] }),
    });
    const ok = await service.testConnection();
    expect(ok).toBe(true);
  });

  it('getAllSeasons returns data ordered by year', async () => {
    const rows = [{ year: 2024 }, { year: 2025 }];
    client.order.mockReturnValueOnce({ data: rows, error: null });
    const res = await service.getAllSeasons();
    expect(res).toEqual(rows);
    expect(client.from).toHaveBeenCalledWith('seasons');
  });

  it('getAllSeasons throws on error', async () => {
    client.order.mockReturnValueOnce({ data: null, error: { message: 'boom' } });
    await expect(service.getAllSeasons()).rejects.toThrow('Failed to fetch all seasons');
  });

  it('getSeasonByYear returns a single season on success', async () => {
    client.single.mockReturnValueOnce({ data: { year: 2024 }, error: null });
    const season = await service.getSeasonByYear('2024');
    expect(season).toEqual({ year: 2024 });
  });

  it('getSeasonByYear returns null for PGRST116 (not found)', async () => {
    client.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
    const season = await service.getSeasonByYear('1990');
    expect(season).toBeNull();
  });

  it('getSeasonByYear throws for other errors', async () => {
    client.single.mockReturnValueOnce({ data: null, error: { code: 'X', message: 'oops' } });
    await expect(service.getSeasonByYear('2000')).rejects.toThrow('Failed to fetch season by year: oops');
  });
});
