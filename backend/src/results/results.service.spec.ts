import { Test } from '@nestjs/testing';
import { ResultsService } from './results.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('ResultsService', () => {
  let service: ResultsService;
  const client = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ResultsService,
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(ResultsService);
    jest.clearAllMocks();
  });

  it('returns results for a session on success', async () => {
    const rows = [{ id: 1, session_id: 99 }];
    client.eq.mockReturnValueOnce({ data: rows, error: null });

    const res = await service.getRaceResultsBySessionId(99);
    expect(res).toEqual(rows);
    expect(client.from).toHaveBeenCalledWith('race_results');
  });

  it('throws with message on error', async () => {
    client.eq.mockReturnValueOnce({ data: null, error: { message: 'boom' } });
    await expect(service.getRaceResultsBySessionId(1)).rejects.toThrow('Failed to fetch race results: boom');
  });
});
