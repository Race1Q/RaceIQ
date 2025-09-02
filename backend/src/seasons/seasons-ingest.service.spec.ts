import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { SeasonIngestService } from './seasons-ingest.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('SeasonIngestService', () => {
  let service: SeasonIngestService;
  const http = { get: jest.fn() } as any;
  const client = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SeasonIngestService,
        { provide: HttpService, useValue: http },
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(SeasonIngestService);
    jest.clearAllMocks();
  });

  it('fetchSeasonsFromAPI handles pagination and returns all seasons', async () => {
    http.get
      .mockReturnValueOnce(of({ data: { MRData: { total: '40', SeasonTable: { Seasons: [{ season: '2000' }] } } } }))
      .mockReturnValueOnce(of({ data: { MRData: { total: '40', SeasonTable: { Seasons: [{ season: '2001' }] } } } }))
      .mockReturnValueOnce(of({ data: { MRData: { total: '40', SeasonTable: { Seasons: [] } } } }));

    const seasons = await service.fetchSeasonsFromAPI();
    expect(seasons).toEqual([{ season: '2000' }, { season: '2001' }]);
  });

  it('ingestSeasons processes seasons as created or updated', async () => {
    // Stub fetchSeasonsFromAPI to bypass network
    jest.spyOn(service as any, 'fetchSeasonsFromAPI').mockResolvedValue([
      { season: '1999' },
      { season: '2000' },
    ]);

    // First: not existing -> insert -> created
    client.single
      .mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } })
      // Second: existing -> updated
      .mockReturnValueOnce({ data: { id: 1, year: 2000 }, error: null });

    client.insert.mockReturnValueOnce({ error: null });

    const res = await service.ingestSeasons();
    expect(res).toEqual({ created: 1, updated: 1 });
  });
});
