import { DriverPerformanceResponseDto } from './driver-performance-response.dto';

describe('DriverPerformanceResponseDto', () => {
  let dto: DriverPerformanceResponseDto;

  beforeEach(() => {
    dto = new DriverPerformanceResponseDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have the correct properties', () => {
    // Test that all required properties exist
    expect(dto).toHaveProperty('driver_id');
    expect(dto).toHaveProperty('season');
    expect(dto).toHaveProperty('races');
    expect(dto).toHaveProperty('wins');
    expect(dto).toHaveProperty('podiums');
    expect(dto).toHaveProperty('points');
    expect(dto).toHaveProperty('position');
    expect(dto).toHaveProperty('constructor_name');
    expect(dto).toHaveProperty('best_finish');
    expect(dto).toHaveProperty('fastest_laps');
    expect(dto).toHaveProperty('pole_positions');
  });

  it('should allow setting and getting properties', () => {
    const testDto = new DriverPerformanceResponseDto();
    
    testDto.driver_id = 1;
    testDto.season = '2024';
    testDto.races = 10;
    testDto.wins = 2;
    testDto.podiums = 5;
    testDto.points = 150;
    testDto.position = 3;
    testDto.constructor_name = 'Mercedes';
    testDto.best_finish = 2;
    testDto.fastest_laps = 1;
    testDto.pole_positions = 1;

    expect(testDto.driver_id).toBe(1);
    expect(testDto.season).toBe('2024');
    expect(testDto.races).toBe(10);
    expect(testDto.wins).toBe(2);
    expect(testDto.podiums).toBe(5);
    expect(testDto.points).toBe(150);
    expect(testDto.position).toBe(3);
    expect(testDto.constructor_name).toBe('Mercedes');
    expect(testDto.best_finish).toBe(2);
    expect(testDto.fastest_laps).toBe(1);
    expect(testDto.pole_positions).toBe(1);
  });

  it('should create a DTO with all properties', () => {
    const testDto = new DriverPerformanceResponseDto();
    
    Object.assign(testDto, {
      driver_id: 2,
      season: '2024',
      races: 12,
      wins: 8,
      podiums: 10,
      points: 300,
      position: 1,
      constructor_name: 'Red Bull Racing',
      best_finish: 1,
      fastest_laps: 3,
      pole_positions: 2,
    });

    expect(testDto.driver_id).toBe(2);
    expect(testDto.season).toBe('2024');
    expect(testDto.races).toBe(12);
    expect(testDto.wins).toBe(8);
    expect(testDto.podiums).toBe(10);
    expect(testDto.points).toBe(300);
    expect(testDto.position).toBe(1);
    expect(testDto.constructor_name).toBe('Red Bull Racing');
    expect(testDto.best_finish).toBe(1);
    expect(testDto.fastest_laps).toBe(3);
    expect(testDto.pole_positions).toBe(2);
  });

  it('should handle different data types correctly', () => {
    const testDto = new DriverPerformanceResponseDto();
    
    testDto.driver_id = 999;
    testDto.season = '2024';
    testDto.races = 0;
    testDto.wins = 0;
    testDto.podiums = 0;
    testDto.points = 0;
    testDto.position = 20;
    testDto.constructor_name = '';
    testDto.best_finish = 0;
    testDto.fastest_laps = 0;
    testDto.pole_positions = 0;

    expect(testDto.driver_id).toBe(999);
    expect(testDto.season).toBe('2024');
    expect(testDto.races).toBe(0);
    expect(testDto.wins).toBe(0);
    expect(testDto.podiums).toBe(0);
    expect(testDto.points).toBe(0);
    expect(testDto.position).toBe(20);
    expect(testDto.constructor_name).toBe('');
    expect(testDto.best_finish).toBe(0);
    expect(testDto.fastest_laps).toBe(0);
    expect(testDto.pole_positions).toBe(0);
  });

  it('should handle season statistics correctly', () => {
    const testDto = new DriverPerformanceResponseDto();
    
    testDto.driver_id = 1;
    testDto.season = '2024';
    testDto.races = 10;
    testDto.wins = 2;
    testDto.podiums = 5;
    testDto.points = 150;
    testDto.position = 3;
    testDto.constructor_name = 'Mercedes';
    testDto.best_finish = 2;
    testDto.fastest_laps = 1;
    testDto.pole_positions = 1;

    expect(testDto.season).toBe('2024');
    expect(testDto.races).toBe(10);
    expect(testDto.wins).toBe(2);
    expect(testDto.podiums).toBe(5);
    expect(testDto.points).toBe(150);
    expect(testDto.position).toBe(3);
    expect(testDto.constructor_name).toBe('Mercedes');
    expect(testDto.best_finish).toBe(2);
    expect(testDto.fastest_laps).toBe(1);
    expect(testDto.pole_positions).toBe(1);
  });

  it('should handle different seasons correctly', () => {
    const testDto = new DriverPerformanceResponseDto();
    
    testDto.driver_id = 1;
    testDto.season = '2023';
    testDto.races = 22;
    testDto.wins = 0;
    testDto.podiums = 6;
    testDto.points = 234;
    testDto.position = 3;
    testDto.constructor_name = 'Mercedes';
    testDto.best_finish = 2;
    testDto.fastest_laps = 1;
    testDto.pole_positions = 1;

    expect(testDto.season).toBe('2023');
    expect(testDto.races).toBe(22);
    expect(testDto.wins).toBe(0);
    expect(testDto.podiums).toBe(6);
    expect(testDto.points).toBe(234);
    expect(testDto.position).toBe(3);
    expect(testDto.constructor_name).toBe('Mercedes');
    expect(testDto.best_finish).toBe(2);
    expect(testDto.fastest_laps).toBe(1);
    expect(testDto.pole_positions).toBe(1);
  });
});
