import { Test } from '@nestjs/testing';
import { RacesService } from './races.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('RacesService', () => {
  let service: RacesService;
  const client = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RacesService,
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(RacesService);
    jest.clearAllMocks();
  });

  it('findAllRacesFor2025 maps rows to DTOs when season and races exist', async () => {
    client.single.mockReturnValueOnce({ data: { id: 1 }, error: null });
    client.order.mockReturnValueOnce({ data: [{ id: 2, season_id: 1, circuit_id: 3, round: 1, name: 'X', date: '2025-01-01', time: '12:00:00' }], error: null });

    const res = await service.findAllRacesFor2025();
    expect(res).toEqual([
      { id: 2, season_id: 1, circuit_id: 3, round: 1, name: 'X', date: '2025-01-01', time: '12:00:00' },
    ]);
  });

  it('findAllRacesFor2025 throws if season not found', async () => {
    client.single.mockReturnValueOnce({ data: null, error: { message: 'no season' } });
    await expect(service.findAllRacesFor2025()).rejects.toThrow('Could not find season data for 2025');
  });

  it('findAllRacesFor2025 throws if races query errors', async () => {
    client.single.mockReturnValueOnce({ data: { id: 1 }, error: null });
    client.order.mockReturnValueOnce({ data: null, error: { message: 'boom' } });
    await expect(service.findAllRacesFor2025()).rejects.toThrow('Failed to fetch races for 2025');
  });

  it('getRacesBySeason returns races array or empty on missing season or error', async () => {
    // missing season
    client.single.mockReturnValueOnce({ data: null, error: { message: 'no season' } });
    await expect(service.getRacesBySeason('2023')).resolves.toEqual([]);

    // season present, races ok
    client.single.mockReturnValueOnce({ data: { id: 9 }, error: null });
    client.order.mockReturnValueOnce({ data: [{ id: 1 }], error: null });
    await expect(service.getRacesBySeason('2024')).resolves.toEqual([{ id: 1 }]);

    // season present, races error
    client.single.mockReturnValueOnce({ data: { id: 9 }, error: null });
    client.order.mockReturnValueOnce({ data: null, error: { message: 'x' } });
    await expect(service.getRacesBySeason('2022')).resolves.toEqual([]);
  });

  it('getAllRaces returns all or empty on error', async () => {
    client.order.mockReturnValueOnce({ data: [{ id: 1 }], error: null });
    await expect(service.getAllRaces()).resolves.toEqual([{ id: 1 }]);

    client.order.mockReturnValueOnce({ data: null, error: { message: 'z' } });
    await expect(service.getAllRaces()).resolves.toEqual([]);
  });
});
