import { DriverStandingsResponseDto } from './driver-standings-response.dto';

describe('DriverStandingsResponseDto', () => {
  let dto: DriverStandingsResponseDto;

  beforeEach(() => {
    dto = new DriverStandingsResponseDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have the correct properties', () => {
    // Test that all required properties exist
    expect(dto).toHaveProperty('driver_id');
    expect(dto).toHaveProperty('first_name');
    expect(dto).toHaveProperty('last_name');
    expect(dto).toHaveProperty('driver_number');
    expect(dto).toHaveProperty('constructor_name');
    expect(dto).toHaveProperty('points');
    expect(dto).toHaveProperty('position');
    expect(dto).toHaveProperty('season');
  });

  it('should allow setting and getting properties', () => {
    const testDto = new DriverStandingsResponseDto();
    
    testDto.driver_id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.driver_number = 44;
    testDto.constructor_name = 'Mercedes';
    testDto.points = 100;
    testDto.position = 1;
    testDto.season = 2024;

    expect(testDto.driver_id).toBe(1);
    expect(testDto.first_name).toBe('Lewis');
    expect(testDto.last_name).toBe('Hamilton');
    expect(testDto.driver_number).toBe(44);
    expect(testDto.constructor_name).toBe('Mercedes');
    expect(testDto.points).toBe(100);
    expect(testDto.position).toBe(1);
    expect(testDto.season).toBe(2024);
  });

  it('should handle nullable properties correctly', () => {
    const testDto = new DriverStandingsResponseDto();
    
    testDto.driver_id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.driver_number = null;
    testDto.constructor_name = 'Mercedes';
    testDto.points = 100;
    testDto.position = 1;
    testDto.season = 2024;

    expect(testDto.driver_number).toBeNull();
  });

  it('should create a DTO with all properties', () => {
    const testDto = new DriverStandingsResponseDto();
    
    Object.assign(testDto, {
      driver_id: 2,
      first_name: 'Max',
      last_name: 'Verstappen',
      driver_number: 33,
      constructor_name: 'Red Bull Racing',
      points: 95,
      position: 2,
      season: 2024,
    });

    expect(testDto.driver_id).toBe(2);
    expect(testDto.first_name).toBe('Max');
    expect(testDto.last_name).toBe('Verstappen');
    expect(testDto.driver_number).toBe(33);
    expect(testDto.constructor_name).toBe('Red Bull Racing');
    expect(testDto.points).toBe(95);
    expect(testDto.position).toBe(2);
    expect(testDto.season).toBe(2024);
  });

  it('should handle different data types correctly', () => {
    const testDto = new DriverStandingsResponseDto();
    
    testDto.driver_id = 999;
    testDto.first_name = '';
    testDto.last_name = '';
    testDto.driver_number = 0;
    testDto.constructor_name = '';
    testDto.points = 0;
    testDto.position = 20;
    testDto.season = 2024;

    expect(testDto.driver_id).toBe(999);
    expect(testDto.first_name).toBe('');
    expect(testDto.last_name).toBe('');
    expect(testDto.driver_number).toBe(0);
    expect(testDto.constructor_name).toBe('');
    expect(testDto.points).toBe(0);
    expect(testDto.position).toBe(20);
    expect(testDto.season).toBe(2024);
  });

  it('should handle championship positions correctly', () => {
    const testDto = new DriverStandingsResponseDto();
    
    testDto.driver_id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.driver_number = 44;
    testDto.constructor_name = 'Mercedes';
    testDto.points = 500;
    testDto.position = 1; // World Champion
    testDto.season = 2024;

    expect(testDto.position).toBe(1);
    expect(testDto.points).toBe(500);
    expect(testDto.constructor_name).toBe('Mercedes');
  });
});
