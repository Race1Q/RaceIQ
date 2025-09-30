import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { OpenF1Service } from './openf1.service';
import { of, throwError } from 'rxjs';

describe('OpenF1Service', () => {
  let service: OpenF1Service;
  let httpService: jest.Mocked<HttpService>;
  let supabaseService: jest.Mocked<SupabaseService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockSupabaseService = {
      client: {
        from: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenF1Service,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<OpenF1Service>(OpenF1Service);
    httpService = module.get(HttpService);
    supabaseService = module.get(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of OpenF1Service', () => {
      expect(service).toBeInstanceOf(OpenF1Service);
    });

    it('should have all required methods', () => {
      expect(typeof service.ingestSessionsAndWeather).toBe('function');
      expect(typeof service.ingestGranularData).toBe('function');
      expect(typeof service.ingestModernResultsAndLaps).toBe('function');
      expect(typeof service.ingestTrackLayouts).toBe('function');
    });
  });

  describe('fetchOpenF1Data', () => {
    it('should fetch data successfully', async () => {
      const mockData = [{ session_key: 12345 }];
      httpService.get.mockReturnValue(of({ data: mockData } as any));

      const result = await service['fetchOpenF1Data']('/sessions?year=2023');

      expect(result).toEqual(mockData);
      expect(httpService.get).toHaveBeenCalledWith('https://api.openf1.org/v1/sessions?year=2023');
    });

    it('should return empty array on error', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('API Error')));

      const result = await service['fetchOpenF1Data']('/sessions?year=2023');

      expect(result).toEqual([]);
    });

    it('should handle rate limiting with retry', async () => {
      const error = { response: { status: 429 } };
      const mockData = [{ session_key: 12345 }];
      
      httpService.get
        .mockReturnValueOnce(throwError(() => error))
        .mockReturnValueOnce(of({ data: mockData } as any));

      const result = await service['fetchOpenF1Data']('/sessions?year=2023', 0);

      expect(result).toEqual(mockData);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('timeStringToMs', () => {
    it('should convert minutes:seconds format', () => {
      expect(service['timeStringToMs']('1:30.123')).toBe(90123);
    });

    it('should convert seconds only format', () => {
      expect(service['timeStringToMs']('30.123')).toBe(30123);
    });

    it('should handle null input', () => {
      expect(service['timeStringToMs'](null)).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(service['timeStringToMs']('invalid:format:string')).toBeNull();
    });
  });

  describe('mapSessionType', () => {
    it('should map session types correctly', () => {
      expect(service['mapSessionType']('Practice 1')).toBe('PRACTICE');
      expect(service['mapSessionType']('Qualifying')).toBe('QUALIFYING');
      expect(service['mapSessionType']('Sprint')).toBe('SPRINT');
      expect(service['mapSessionType']('Race')).toBe('RACE');
      expect(service['mapSessionType']('Unknown')).toBe('UNKNOWN');
    });

    it('should handle case insensitivity', () => {
      expect(service['mapSessionType']('practice 1')).toBe('PRACTICE');
      expect(service['mapSessionType']('QUALIFYING')).toBe('QUALIFYING');
    });
  });

  describe('ingestSessionsAndWeather', () => {
    it('should return early if season not found', async () => {
      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      await service.ingestSessionsAndWeather(2023);

      expect(supabaseService.client.from).toHaveBeenCalledWith('seasons');
    });

    it('should return early if no races found', async () => {
      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [] }),
          }),
        };
      });

      await service.ingestSessionsAndWeather(2023);
      expect(supabaseService.client.from).toHaveBeenCalledWith('races');
    });

    it('should return early if no OpenF1 sessions found', async () => {
      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Test GP' }] }),
            }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: [] } as any);
        if (url.includes('/sessions')) return of({ data: [] } as any);
        return of({ data: [] } as any);
      });

      await service.ingestSessionsAndWeather(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should skip session if meeting not found', async () => {
      const mockRaces = [{ id: 1, name: 'Bahrain Grand Prix' }];
      const mockMeetings = [{ meeting_key: 9999, meeting_name: 'Different GP' }];
      const mockSessions = [{
        session_key: 5678,
        session_name: 'Race',
        meeting_key: 1234,
        date_start: '2023-03-05T15:00:00',
      }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        return of({ data: [] } as any);
      });

      await service.ingestSessionsAndWeather(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should skip session if race not found in map', async () => {
      const mockRaces = [{ id: 1, name: 'Bahrain Grand Prix' }];
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Monaco Grand Prix' }];
      const mockSessions = [{
        session_key: 5678,
        session_name: 'Race',
        meeting_key: 1234,
        date_start: '2023-05-28T15:00:00',
      }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        return of({ data: [] } as any);
      });

      await service.ingestSessionsAndWeather(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should handle Sao Paulo name mismatch', async () => {
      const mockRaces = [{ id: 1, name: 'São Paulo Grand Prix' }];
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Sao Paulo Grand Prix' }];
      const mockSessions = [{
        session_key: 5678,
        session_name: 'Race',
        meeting_key: 1234,
        date_start: '2023-11-05T18:00:00',
      }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        if (url.includes('/weather')) return of({ data: [] } as any);
        return of({ data: [] } as any);
      });

      await service.ingestSessionsAndWeather(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should successfully ingest sessions with weather data', async () => {
      const mockRaces = [{ id: 1, name: 'Bahrain Grand Prix' }];
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Bahrain Grand Prix' }];
      const mockSessions = [{
        session_key: 5678,
        session_name: 'Race',
        meeting_key: 1234,
        date_start: '2023-03-05T15:00:00',
      }];
      const mockWeather = [{ air_temperature: 25, track_temperature: 35 }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        if (url.includes('/weather')) return of({ data: mockWeather } as any);
        return of({ data: [] } as any);
      });

      await service.ingestSessionsAndWeather(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should handle insert error gracefully', async () => {
      const mockRaces = [{ id: 1, name: 'Bahrain Grand Prix' }];
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Bahrain Grand Prix' }];
      const mockSessions = [{
        session_key: 5678,
        session_name: 'Race',
        meeting_key: 1234,
        date_start: '2023-03-05T15:00:00',
      }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({ error: 'Insert failed' }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        if (url.includes('/weather')) return of({ data: [] } as any);
        return of({ data: [] } as any);
      });

      await service.ingestSessionsAndWeather(2023);
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  describe('ingestGranularData', () => {
    it('should return early if no OpenF1 sessions', async () => {
      httpService.get.mockReturnValue(of({ data: [] } as any));
      await service.ingestGranularData(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should return early if season not found', async () => {
      httpService.get.mockReturnValue(of({ data: [{ session_key: 1 }] } as any));
      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      await service.ingestGranularData(2023);
      expect(supabaseService.client.from).toHaveBeenCalledWith('seasons');
    });

    it('should return early if no race session for driver mapping', async () => {
      const mockSessions = [{ session_key: 1, session_name: 'Practice 1', meeting_key: 100 }];
      const mockMeetings = [{ meeting_key: 100, meeting_name: 'Test Grand Prix' }];
      
      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/sessions?')) return of({ data: mockSessions } as any);
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        return of({ data: [] } as any);
      });

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Test GP' }] }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [] }),
            }),
          };
        }
      });

      await service.ingestGranularData(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should successfully ingest tire stints and race events', async () => {
      const mockSessions = [{ 
        session_key: 5678, 
        session_name: 'Race', 
        meeting_key: 1234, 
        year: 2023 
      }];
      const mockDbSessions = [{ id: 1, type: 'RACE', race_id: 1 }];
      const mockStints = [{
        stint_number: 1,
        lap_start: 1,
        lap_end: 20,
        driver_number: 44,
        compound: 'SOFT',
        tyre_age_at_start: 0,
      }];
      const mockEvents = [{
        date: '2023-03-05T15:30:00',
        category: 'Flag',
        flag: 'YELLOW',
        message: 'Yellow flag',
      }];

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/sessions?')) return of({ data: mockSessions } as any);
        if (url.includes('/meetings')) return of({ data: [{ meeting_key: 1234, meeting_name: 'Test' }] } as any);
        if (url.includes('/drivers?')) return of({ data: [{ driver_number: 44, name_acronym: 'HAM' }] } as any);
        if (url.includes('/stints')) return of({ data: mockStints } as any);
        if (url.includes('/race_control')) return of({ data: mockEvents } as any);
        return of({ data: [] } as any);
      });

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Test GP' }] }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockDbSessions }),
            }),
          };
        }
        if (table === 'drivers') {
          return {
            select: jest.fn().mockResolvedValue({ data: [{ id: 1, name_acronym: 'HAM' }] }),
          };
        }
        if (table === 'tire_stints' || table === 'race_events') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      await service.ingestGranularData(2023);
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  describe('ingestModernResultsAndLaps', () => {
    it('should return early if season not found', async () => {
      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      await service.ingestModernResultsAndLaps(2023);
      expect(supabaseService.client.from).toHaveBeenCalledWith('seasons');
    });

    it('should ingest qualifying results successfully', async () => {
      const mockRaces = [{ id: 1, name: 'Bahrain Grand Prix', round: 1 }];
      const mockSessions = [
        { id: 1, type: 'QUALIFYING', race_id: 1, openf1_session_key: 5678 },
      ];
      const mockDrivers = [{ id: 1, name_acronym: 'HAM', ergast_driver_ref: 'hamilton' }];
      const mockConstructors = [{ id: 1, name: 'Mercedes' }];
      const mockQualiData = {
        MRData: {
          RaceTable: {
            Races: [{
              QualifyingResults: [{
                position: '1',
                Driver: { driverId: 'hamilton' },
                Constructor: { name: 'Mercedes' },
                Q1: '1:30.123',
                Q2: '1:29.456',
                Q3: '1:28.789',
              }],
            }],
          },
        },
      };

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions }),
            }),
          };
        }
        if (table === 'drivers') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockDrivers }),
          };
        }
        if (table === 'constructors') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockConstructors }),
          };
        }
        if (table === 'qualifying_results') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('qualifying.json')) {
          return of({ data: mockQualiData } as any);
        }
        return of({ data: [] } as any);
      });

      await service.ingestModernResultsAndLaps(2023);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should ingest race results and laps successfully', async () => {
      const mockRaces = [{ id: 1, name: 'Bahrain Grand Prix', round: 1 }];
      const mockSessions = [
        { id: 2, type: 'RACE', race_id: 1, openf1_session_key: 5679 },
      ];
      const mockDrivers = [{ id: 1, name_acronym: 'HAM', ergast_driver_ref: 'hamilton' }];
      const mockConstructors = [{ id: 1, name: 'Mercedes' }];
      const mockRaceData = {
        MRData: {
          RaceTable: {
            Races: [{
              Results: [{
                position: '1',
                points: '25',
                grid: '1',
                laps: '57',
                status: 'Finished',
                Driver: { driverId: 'hamilton' },
                Constructor: { name: 'Mercedes' },
                Time: { time: '1:30:45.123' },
              }],
            }],
          },
        },
      };
      const mockLaps = [{
        driver_number: 44,
        lap_number: 1,
        position: 1,
        lap_duration: 90.5,
        is_pit_out_lap: false,
        duration_sector_1: 30.1,
        duration_sector_2: 30.2,
        duration_sector_3: 30.2,
      }];
      const mockPits = [{
        driver_number: 44,
        lap_number: 20,
        pit_duration: 2.5,
        duration: 25.0,
      }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces }),
            }),
          };
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions }),
            }),
          };
        }
        if (table === 'drivers') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockDrivers }),
          };
        }
        if (table === 'constructors') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockConstructors }),
          };
        }
        if (table === 'race_results' || table === 'laps' || table === 'pit_stops') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({}),
            }),
            insert: jest.fn().mockResolvedValue({}),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('results.json')) {
          return of({ data: mockRaceData } as any);
        }
        if (url.includes('/laps')) {
          return of({ data: mockLaps } as any);
        }
        if (url.includes('/pit')) {
          return of({ data: mockPits } as any);
        }
        if (url.includes('/drivers')) {
          return of({ data: [{ driver_number: 44, name_acronym: 'HAM' }] } as any);
        }
        return of({ data: [] } as any);
      });

      await service.ingestModernResultsAndLaps(2023);
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  describe('ingestTrackLayouts', () => {
    it('should return early if season not found', async () => {
      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      await service.ingestTrackLayouts();
      expect(supabaseService.client.from).toHaveBeenCalledWith('seasons');
    });

    it('should return early if latest race not found', async () => {
      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      httpService.get.mockReturnValue(of({ data: [] } as any));

      await service.ingestTrackLayouts();
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should return early if OpenF1 meeting not found', async () => {
      const mockRace = { circuit_id: 1, name: 'Monaco Grand Prix' };
      const mockMeetings = [{ meeting_key: 9999, meeting_name: 'Different GP' }];
      const mockSessions = [{ session_key: 5678, meeting_key: 1234 }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockRace }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        return of({ data: [] } as any);
      });

      await service.ingestTrackLayouts();
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should return early if OpenF1 session not found', async () => {
      const mockRace = { circuit_id: 1, name: 'Monaco Grand Prix' };
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Monaco Grand Prix' }];
      const mockSessions = [{ session_key: 5678, meeting_key: 9999 }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockRace }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        return of({ data: [] } as any);
      });

      await service.ingestTrackLayouts();
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should return early if no location data', async () => {
      const mockRace = { circuit_id: 1, name: 'Monaco Grand Prix' };
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Monaco Grand Prix' }];
      const mockSessions = [{ session_key: 5678, meeting_key: 1234 }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockRace }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        if (url.includes('/location')) return of({ data: [] } as any);
        return of({ data: [] } as any);
      });

      await service.ingestTrackLayouts();
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should successfully ingest layout', async () => {
      const mockRace = { circuit_id: 1, name: 'Monaco Grand Prix' };
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Monaco Grand Prix' }];
      const mockSessions = [{ session_key: 5678, meeting_key: 1234 }];
      const mockLocation = [
        { driver_number: 44, x: 100, y: 200, z: 0 },
        { driver_number: 44, x: 101, y: 201, z: 0 },
        { driver_number: 44, x: 102, y: 202, z: 0 },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockRace }),
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'circuits') {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({}),
            }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        if (url.includes('/location')) return of({ data: mockLocation } as any);
        return of({ data: [] } as any);
      });

      await service.ingestTrackLayouts();
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should handle update error gracefully', async () => {
      const mockRace = { circuit_id: 1, name: 'Monaco Grand Prix' };
      const mockMeetings = [{ meeting_key: 1234, meeting_name: 'Monaco Grand Prix' }];
      const mockSessions = [{ session_key: 5678, meeting_key: 1234 }];
      const mockLocation = [
        { driver_number: 44, x: 100, y: 200, z: 0 },
        { driver_number: 44, x: 101, y: 201, z: 0 },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 2023 } }),
              }),
            }),
          };
        }
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockRace }),
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'circuits') {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: 'Update failed' }),
            }),
          };
        }
      });

      httpService.get.mockImplementation((url: string) => {
        if (url.includes('/meetings')) return of({ data: mockMeetings } as any);
        if (url.includes('/sessions')) return of({ data: mockSessions } as any);
        if (url.includes('/location')) return of({ data: mockLocation } as any);
        return of({ data: [] } as any);
      });

      await service.ingestTrackLayouts();
      expect(httpService.get).toHaveBeenCalled();
    });
  });
});
