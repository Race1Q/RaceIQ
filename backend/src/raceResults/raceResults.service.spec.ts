import { Test } from '@nestjs/testing';
import { RaceResultsService } from './raceResults.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('RaceResultsService', () => {
  let service: RaceResultsService;
  const client = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RaceResultsService,
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(RaceResultsService);
    jest.clearAllMocks();
  });

  it('returns rows for a session on success', async () => {
    const rows = [{ id: 1, session_id: 10 }];
    client.select.mockReturnValueOnce({
      eq: jest.fn().mockReturnValue({ data: rows, error: null }),
    });

    const result = await service.getBySessionId(10);
    expect(result).toEqual(rows);
    expect(client.from).toHaveBeenCalledWith('race_results');
  });

  it('throws when supabase returns error', async () => {
    client.select.mockReturnValueOnce({
      eq: jest.fn().mockReturnValue({ data: null, error: { message: 'boom' } }),
    });

    await expect(service.getBySessionId(1)).rejects.toThrow('Failed to fetch race_results: boom');
  });
});
