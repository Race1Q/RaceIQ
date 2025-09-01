import { DriverResponseDto } from './driver-response.dto';

describe('DriverResponseDto', () => {
  let dto: DriverResponseDto;

  beforeEach(() => {
    dto = new DriverResponseDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should have the correct properties', () => {
    // Test that all required properties exist
    expect(dto).toHaveProperty('id');
    expect(dto).toHaveProperty('driver_number');
    expect(dto).toHaveProperty('first_name');
    expect(dto).toHaveProperty('last_name');
    expect(dto).toHaveProperty('name_acronym');
    expect(dto).toHaveProperty('country_code');
    expect(dto).toHaveProperty('date_of_birth');
    expect(dto).toHaveProperty('full_name');
  });

  it('should allow setting and getting properties', () => {
    const testDto = new DriverResponseDto();
    
    testDto.id = 1;
    testDto.driver_number = 44;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.name_acronym = 'HAM';
    testDto.country_code = 'GB';
    testDto.date_of_birth = '1985-01-07';
    testDto.full_name = 'Lewis Hamilton';

    expect(testDto.id).toBe(1);
    expect(testDto.driver_number).toBe(44);
    expect(testDto.first_name).toBe('Lewis');
    expect(testDto.last_name).toBe('Hamilton');
    expect(testDto.name_acronym).toBe('HAM');
    expect(testDto.country_code).toBe('GB');
    expect(testDto.date_of_birth).toBe('1985-01-07');
    expect(testDto.full_name).toBe('Lewis Hamilton');
  });

  it('should handle nullable properties correctly', () => {
    const testDto = new DriverResponseDto();
    
    testDto.id = 1;
    testDto.driver_number = null;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.name_acronym = null;
    testDto.country_code = null;
    testDto.date_of_birth = '1985-01-07';
    testDto.full_name = 'Lewis Hamilton';

    expect(testDto.driver_number).toBeNull();
    expect(testDto.name_acronym).toBeNull();
    expect(testDto.country_code).toBeNull();
  });

  it('should handle optional full_name property', () => {
    const testDto = new DriverResponseDto();
    
    testDto.id = 1;
    testDto.first_name = 'Lewis';
    testDto.last_name = 'Hamilton';
    testDto.date_of_birth = '1985-01-07';
    // full_name is optional, so we don't need to set it

    expect(testDto.full_name).toBeUndefined();
  });

  it('should create a DTO with all properties', () => {
    const testDto = new DriverResponseDto();
    
    Object.assign(testDto, {
      id: 2,
      driver_number: 33,
      first_name: 'Max',
      last_name: 'Verstappen',
      name_acronym: 'VER',
      country_code: 'NL',
      date_of_birth: '1997-09-30',
      full_name: 'Max Verstappen',
    });

    expect(testDto.id).toBe(2);
    expect(testDto.driver_number).toBe(33);
    expect(testDto.first_name).toBe('Max');
    expect(testDto.last_name).toBe('Verstappen');
    expect(testDto.name_acronym).toBe('VER');
    expect(testDto.country_code).toBe('NL');
    expect(testDto.date_of_birth).toBe('1997-09-30');
    expect(testDto.full_name).toBe('Max Verstappen');
  });

  it('should handle different data types correctly', () => {
    const testDto = new DriverResponseDto();
    
    testDto.id = 999;
    testDto.driver_number = 0;
    testDto.first_name = '';
    testDto.last_name = '';
    testDto.name_acronym = '';
    testDto.country_code = '';
    testDto.date_of_birth = '2000-01-01';
    testDto.full_name = '';

    expect(testDto.id).toBe(999);
    expect(testDto.driver_number).toBe(0);
    expect(testDto.first_name).toBe('');
    expect(testDto.last_name).toBe('');
    expect(testDto.name_acronym).toBe('');
    expect(testDto.country_code).toBe('');
    expect(testDto.date_of_birth).toBe('2000-01-01');
    expect(testDto.full_name).toBe('');
  });
});
