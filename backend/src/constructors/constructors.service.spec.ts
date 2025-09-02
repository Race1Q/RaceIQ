import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { ConstructorsService } from './constructors.service';

function mockErgastResponse(constructors: Array<{ constructorId: string; name: string; nationality: string; url: string }>) {
  return of({ data: { MRData: { ConstructorTable: { Constructors: constructors } } } });
}

describe('ConstructorsService', () => {
  let service: ConstructorsService;
  const http = { get: jest.fn() } as any;
  const client = {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConstructorsService,
        { provide: HttpService, useValue: http },
        { provide: SupabaseService, useValue: { client } },
      ],
    }).compile();

    service = moduleRef.get(ConstructorsService);
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
    // Immediately run setTimeout callbacks to skip delays in service
    jest.spyOn(global, 'setTimeout' as any).mockImplementation((fn: any) => {
      fn();
      return 0 as any;
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    (setTimeout as unknown as jest.Mock)?.mockRestore?.();
  });

  it('ingestConstructors fetches seasons, dedups, and upserts', async () => {
    // Simulate two seasons with overlap
    http.get
      .mockReturnValueOnce(mockErgastResponse([
        { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: 'u1' },
      ]))
      .mockReturnValueOnce(mockErgastResponse([
        { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: 'u1' },
        { constructorId: 'rb', name: 'Red Bull', nationality: 'Austrian', url: 'u2' },
      ]));

    // Short-circuit the long loop by constraining end year to 1951
    const endSpy = jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(1951 as any);

    client.upsert.mockReturnValueOnce({ error: null });

    const res = await service.ingestConstructors();
    expect(res.count).toBe(2); // ferrari, rb
    expect(client.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ constructor_id: 'ferrari' }),
        expect.objectContaining({ constructor_id: 'rb' }),
      ]),
      { onConflict: 'constructor_id' },
    );

    endSpy.mockRestore();
  });

  it('getAllConstructors returns ordered list', async () => {
    const rows = [{ name: 'A' }, { name: 'B' }];
    client.order.mockReturnValueOnce({ data: rows, error: null });
    const res = await service.getAllConstructors();
    expect(res).toEqual(rows);
    expect(client.from).toHaveBeenCalledWith('constructors');
  });

  it('findByApiId returns found constructor or throws if not found', async () => {
    client.order.mockReturnValueOnce({ data: [{ constructor_id: 'rb' }], error: null });
    await expect(service.findByApiId('rb')).resolves.toEqual({ constructor_id: 'rb' });

    client.order.mockReturnValueOnce({ data: [{ constructor_id: 'fer' }], error: null });
    await expect(service.findByApiId('missing')).rejects.toThrow('Constructor missing not found');
  });
});
