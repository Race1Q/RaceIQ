import { DriverDetailsResponseDto } from './driver-details-response.dto';

describe('DriverDetailsResponseDto', () => {
  let dto: DriverDetailsResponseDto;

  beforeEach(() => {
    dto = new DriverDetailsResponseDto();
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
    expect(dto).toHaveProperty('country_name');
    expect(dto).toHaveProperty('date_of_birth');
    expect(dto).toHaveProperty('total_races');
    expect(dto).toHaveProperty('total_wins');
    expect(dto).toHaveProperty('total_podiums');
    expect(dto).toHaveProperty('total_points');
    expect(dto).toHaveProperty('world_championships');
    expect(dto).toHaveProperty('current_constructor');
  });

  it('should allow setting and getting properties', () => {
    const testDto = new DriverDetailsResponseDto();
    
    testDto.driver_id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.driver_number = 44;
    testDto.country_name = 'Great Britain';
    testDto.date_of_birth = '1985-01-07';
    testDto.total_races = 300;
    testDto.total_wins = 103;
    testDto.total_podiums = 197;
    testDto.total_points = 4639.5;
    testDto.world_championships = 7;
    testDto.current_constructor = 'Mercedes';

    expect(testDto.driver_id).toBe(1);
    expect(testDto.first_name).toBe('Lewis');
    expect(testDto.last_name).toBe('Hamilton');
    expect(testDto.driver_number).toBe(44);
    expect(testDto.country_name).toBe('Great Britain');
    expect(testDto.date_of_birth).toBe('1985-01-07');
    expect(testDto.total_races).toBe(300);
    expect(testDto.total_wins).toBe(103);
    expect(testDto.total_podiums).toBe(197);
    expect(testDto.total_points).toBe(4639.5);
    expect(testDto.world_championships).toBe(7);
    expect(testDto.current_constructor).toBe('Mercedes');
  });

  it('should handle nullable properties correctly', () => {
    const testDto = new DriverDetailsResponseDto();
    
    testDto.driver_id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.driver_number = null;
    testDto.country_name = 'Great Britain';
    testDto.date_of_birth = '1985-01-07';
    testDto.total_races = 300;
    testDto.total_wins = 103;
    testDto.total_podiums = 197;
    testDto.total_points = 4639.5;
    testDto.world_championships = 7;
    testDto.current_constructor = 'Mercedes';

    expect(testDto.driver_number).toBeNull();
  });

  it('should create a DTO with all properties', () => {
    const testDto = new DriverDetailsResponseDto();
    
    Object.assign(testDto, {
      driver_id: 2,
      first_name: 'Max',
      last_name: 'Verstappen',
      driver_number: 33,
      country_name: 'Netherlands',
      date_of_birth: '1997-09-30',
      total_races: 150,
      total_wins: 45,
      total_podiums: 80,
      total_points: 2500,
      world_championships: 3,
      current_constructor: 'Red Bull Racing',
    });

    expect(testDto.driver_id).toBe(2);
    expect(testDto.first_name).toBe('Max');
    expect(testDto.last_name).toBe('Verstappen');
    expect(testDto.driver_number).toBe(33);
    expect(testDto.country_name).toBe('Netherlands');
    expect(testDto.date_of_birth).toBe('1997-09-30');
    expect(testDto.total_races).toBe(150);
    expect(testDto.total_wins).toBe(45);
    expect(testDto.total_podiums).toBe(80);
    expect(testDto.total_points).toBe(2500);
    expect(testDto.world_championships).toBe(3);
    expect(testDto.current_constructor).toBe('Red Bull Racing');
  });

  it('should handle different data types correctly', () => {
    const testDto = new DriverDetailsResponseDto();
    
    testDto.driver_id = 999;
    testDto.first_name = '';
    testDto.last_name = '';
    testDto.driver_number = 0;
    testDto.country_name = '';
    testDto.date_of_birth = '2000-01-01';
    testDto.total_races = 0;
    testDto.total_wins = 0;
    testDto.total_podiums = 0;
    testDto.total_points = 0;
    testDto.world_championships = 0;
    testDto.current_constructor = '';

    expect(testDto.driver_id).toBe(999);
    expect(testDto.first_name).toBe('');
    expect(testDto.last_name).toBe('');
    expect(testDto.driver_number).toBe(0);
    expect(testDto.country_name).toBe('');
    expect(testDto.date_of_birth).toBe('2000-01-01');
    expect(testDto.total_races).toBe(0);
    expect(testDto.total_wins).toBe(0);
    expect(testDto.total_podiums).toBe(0);
    expect(testDto.total_points).toBe(0);
    expect(testDto.world_championships).toBe(0);
    expect(testDto.current_constructor).toBe('');
  });

  it('should handle career statistics correctly', () => {
    const testDto = new DriverDetailsResponseDto();
    
    testDto.driver_id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.driver_number = 44;
    testDto.country_name = 'Great Britain';
    testDto.date_of_birth = '1985-01-07';
    testDto.total_races = 300;
    testDto.total_wins = 103;
    testDto.total_podiums = 197;
    testDto.total_points = 4639.5;
    testDto.world_championships = 7;
    testDto.current_constructor = 'Mercedes';

    expect(testDto.total_races).toBe(300);
    expect(testDto.total_wins).toBe(103);
    expect(testDto.total_podiums).toBe(197);
    expect(testDto.total_points).toBe(4639.5);
    expect(testDto.world_championships).toBe(7);
    expect(testDto.current_constructor).toBe('Mercedes');
  });
});
