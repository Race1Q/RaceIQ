import { Driver } from './driver.entity';

describe('Driver Entity', () => {
  let driver: Driver;

  beforeEach(() => {
    driver = new Driver();
  });

  it('should be defined', () => {
    expect(driver).toBeDefined();
  });

  it('should have the correct properties', () => {
    // Test that all required properties exist
    expect(driver).toHaveProperty('id');
    expect(driver).toHaveProperty('driver_number');
    expect(driver).toHaveProperty('first_name');
    expect(driver).toHaveProperty('last_name');
    expect(driver).toHaveProperty('name_acronym');
    expect(driver).toHaveProperty('country_code');
    expect(driver).toHaveProperty('date_of_birth');
    expect(driver).toHaveProperty('full_name');
  });

  it('should allow setting and getting properties', () => {
    const testDriver = new Driver();
    
    testDriver.id = 1;
    testDriver.driver_number = 44;
    testDriver.first_name = 'Lewis';
    testDriver.last_name = 'Hamilton';
    testDriver.name_acronym = 'HAM';
    testDriver.country_code = 'GB';
    testDriver.date_of_birth = '1985-01-07';
    testDriver.full_name = 'Lewis Hamilton';

    expect(testDriver.id).toBe(1);
    expect(testDriver.driver_number).toBe(44);
    expect(testDriver.first_name).toBe('Lewis');
    expect(testDriver.last_name).toBe('Hamilton');
    expect(testDriver.name_acronym).toBe('HAM');
    expect(testDriver.country_code).toBe('GB');
    expect(testDriver.date_of_birth).toBe('1985-01-07');
    expect(testDriver.full_name).toBe('Lewis Hamilton');
  });

  it('should handle nullable properties correctly', () => {
    const testDriver = new Driver();
    
    testDriver.id = 1;
    testDriver.driver_number = null;
    testDriver.first_name = 'Lewis';
    testDriver.last_name = 'Hamilton';
    testDriver.name_acronym = null;
    testDriver.country_code = null;
    testDriver.date_of_birth = '1985-01-07';
    testDriver.full_name = 'Lewis Hamilton';

    expect(testDriver.driver_number).toBeNull();
    expect(testDriver.name_acronym).toBeNull();
    expect(testDriver.country_code).toBeNull();
  });

  it('should handle optional full_name property', () => {
    const testDriver = new Driver();
    
    testDriver.id = 1;
    testDriver.first_name = 'Lewis';
    testDriver.last_name = 'Hamilton';
    testDriver.date_of_birth = '1985-01-07';
    // full_name is optional, so we don't need to set it

    expect(testDriver.full_name).toBeUndefined();
  });

  it('should create a driver with all properties', () => {
    const testDriver = new Driver();
    
    Object.assign(testDriver, {
      id: 2,
      driver_number: 33,
      first_name: 'Max',
      last_name: 'Verstappen',
      name_acronym: 'VER',
      country_code: 'NL',
      date_of_birth: '1997-09-30',
      full_name: 'Max Verstappen',
    });

    expect(testDriver.id).toBe(2);
    expect(testDriver.driver_number).toBe(33);
    expect(testDriver.first_name).toBe('Max');
    expect(testDriver.last_name).toBe('Verstappen');
    expect(testDriver.name_acronym).toBe('VER');
    expect(testDriver.country_code).toBe('NL');
    expect(testDriver.date_of_birth).toBe('1997-09-30');
    expect(testDriver.full_name).toBe('Max Verstappen');
  });
});
