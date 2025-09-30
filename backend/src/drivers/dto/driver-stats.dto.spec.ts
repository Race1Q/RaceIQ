import { jest, describe, it, expect } from '@jest/globals';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './driver-stats.dto';

describe('Driver Stats DTOs', () => {
  describe('DriverStatsResponseDto', () => {
    describe('Class Structure', () => {
      it('should be defined', () => {
        expect(DriverStatsResponseDto).toBeDefined();
      });

      it('should be a class', () => {
        expect(typeof DriverStatsResponseDto).toBe('function');
      });

      it('should be instantiable', () => {
        expect(() => new DriverStatsResponseDto()).not.toThrow();
      });
    });

    describe('Instance Creation', () => {
      it('should create instance with driver data', () => {
        const dto = new DriverStatsResponseDto();
        
        dto.driver = {
          id: 1,
          full_name: 'Lewis Hamilton',
          given_name: 'Lewis',
          family_name: 'Hamilton',
          code: 'HAM',
          current_team_name: 'Mercedes',
          image_url: 'https://example.com/lewis.jpg',
          team_color: '#00D2BE',
          country_code: 'GB',
          driver_number: 44,
          date_of_birth: new Date('1985-01-07'),
          bio: 'Seven-time World Champion',
          fun_fact: 'Started racing at age 8',
        };

        expect(dto.driver.id).toBe(1);
        expect(dto.driver.full_name).toBe('Lewis Hamilton');
        expect(dto.driver.given_name).toBe('Lewis');
        expect(dto.driver.family_name).toBe('Hamilton');
        expect(dto.driver.code).toBe('HAM');
        expect(dto.driver.current_team_name).toBe('Mercedes');
        expect(dto.driver.image_url).toBe('https://example.com/lewis.jpg');
        expect(dto.driver.team_color).toBe('#00D2BE');
        expect(dto.driver.country_code).toBe('GB');
        expect(dto.driver.driver_number).toBe(44);
        expect(dto.driver.date_of_birth).toEqual(new Date('1985-01-07'));
        expect(dto.driver.bio).toBe('Seven-time World Champion');
        expect(dto.driver.fun_fact).toBe('Started racing at age 8');
      });

      it('should create instance with career stats', () => {
        const dto = new DriverStatsResponseDto();
        
        dto.careerStats = {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          grandsPrixEntered: 330,
          dnfs: 25,
          highestRaceFinish: 1,
          firstRace: {
            year: 2007,
            event: 'Australian Grand Prix',
          },
          winsPerSeason: [
            { season: 2023, wins: 6 },
            { season: 2022, wins: 0 },
            { season: 2021, wins: 8 },
          ],
        };

        expect(dto.careerStats.wins).toBe(103);
        expect(dto.careerStats.podiums).toBe(197);
        expect(dto.careerStats.fastestLaps).toBe(65);
        expect(dto.careerStats.points).toBe(4639.5);
        expect(dto.careerStats.grandsPrixEntered).toBe(330);
        expect(dto.careerStats.dnfs).toBe(25);
        expect(dto.careerStats.highestRaceFinish).toBe(1);
        expect(dto.careerStats.firstRace.year).toBe(2007);
        expect(dto.careerStats.firstRace.event).toBe('Australian Grand Prix');
        expect(dto.careerStats.winsPerSeason).toHaveLength(3);
        expect(dto.careerStats.winsPerSeason[0].season).toBe(2023);
        expect(dto.careerStats.winsPerSeason[0].wins).toBe(6);
      });

      it('should create instance with current season stats', () => {
        const dto = new DriverStatsResponseDto();
        
        dto.currentSeasonStats = {
          wins: 6,
          podiums: 17,
          fastestLaps: 5,
          standing: 'P3',
        };

        expect(dto.currentSeasonStats.wins).toBe(6);
        expect(dto.currentSeasonStats.podiums).toBe(17);
        expect(dto.currentSeasonStats.fastestLaps).toBe(5);
        expect(dto.currentSeasonStats.standing).toBe('P3');
      });
    });

    describe('Complete DTO Example', () => {
      it('should create complete DTO with all data', () => {
        const dto = new DriverStatsResponseDto();
        
        dto.driver = {
          id: 1,
          full_name: 'Lewis Hamilton',
          given_name: 'Lewis',
          family_name: 'Hamilton',
          code: 'HAM',
          current_team_name: 'Mercedes',
          image_url: 'https://example.com/lewis.jpg',
          team_color: '#00D2BE',
          country_code: 'GB',
          driver_number: 44,
          date_of_birth: new Date('1985-01-07'),
          bio: 'Seven-time World Champion',
          fun_fact: 'Started racing at age 8',
        };

        dto.careerStats = {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          grandsPrixEntered: 330,
          dnfs: 25,
          highestRaceFinish: 1,
          firstRace: {
            year: 2007,
            event: 'Australian Grand Prix',
          },
          winsPerSeason: [
            { season: 2023, wins: 6 },
            { season: 2022, wins: 0 },
            { season: 2021, wins: 8 },
          ],
        };

        dto.currentSeasonStats = {
          wins: 6,
          podiums: 17,
          fastestLaps: 5,
          standing: 'P3',
        };

        // Verify all properties are set correctly
        expect(dto.driver.id).toBe(1);
        expect(dto.careerStats.wins).toBe(103);
        expect(dto.currentSeasonStats.wins).toBe(6);
        expect(dto.careerStats.winsPerSeason).toHaveLength(3);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null values', () => {
        const dto = new DriverStatsResponseDto();
        
        dto.driver = {
          id: 1,
          full_name: 'Test Driver',
          given_name: null,
          family_name: null,
          code: null,
          current_team_name: null,
          image_url: null,
          team_color: null,
          country_code: null,
          driver_number: null,
          date_of_birth: null,
          bio: null,
          fun_fact: null,
        };

        expect(dto.driver.given_name).toBeNull();
        expect(dto.driver.family_name).toBeNull();
        expect(dto.driver.code).toBeNull();
        expect(dto.driver.current_team_name).toBeNull();
        expect(dto.driver.image_url).toBeNull();
        expect(dto.driver.team_color).toBeNull();
        expect(dto.driver.country_code).toBeNull();
        expect(dto.driver.driver_number).toBeNull();
        expect(dto.driver.date_of_birth).toBeNull();
        expect(dto.driver.bio).toBeNull();
        expect(dto.driver.fun_fact).toBeNull();
      });

      it('should handle empty wins per season array', () => {
        const dto = new DriverStatsResponseDto();
        
        dto.careerStats = {
          wins: 0,
          podiums: 0,
          fastestLaps: 0,
          points: 0,
          grandsPrixEntered: 0,
          dnfs: 0,
          highestRaceFinish: 0,
          firstRace: {
            year: 0,
            event: 'N/A',
          },
          winsPerSeason: [],
        };

        expect(dto.careerStats.winsPerSeason).toEqual([]);
        expect(dto.careerStats.winsPerSeason).toHaveLength(0);
      });
    });
  });

  describe('DriverComparisonStatsResponseDto', () => {
    describe('Class Structure', () => {
      it('should be defined', () => {
        expect(DriverComparisonStatsResponseDto).toBeDefined();
      });

      it('should be a class', () => {
        expect(typeof DriverComparisonStatsResponseDto).toBe('function');
      });

      it('should be instantiable', () => {
        expect(() => new DriverComparisonStatsResponseDto()).not.toThrow();
      });
    });

    describe('Instance Creation', () => {
      it('should create instance with career stats only', () => {
        const dto = new DriverComparisonStatsResponseDto();
        
        dto.driverId = 1;
        dto.year = null;
        dto.career = {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        };
        dto.yearStats = null;

        expect(dto.driverId).toBe(1);
        expect(dto.year).toBeNull();
        expect(dto.career.wins).toBe(103);
        expect(dto.career.podiums).toBe(197);
        expect(dto.career.fastestLaps).toBe(65);
        expect(dto.career.points).toBe(4639.5);
        expect(dto.career.dnfs).toBe(25);
        expect(dto.career.sprintWins).toBe(5);
        expect(dto.career.sprintPodiums).toBe(8);
        expect(dto.yearStats).toBeNull();
      });

      it('should create instance with both career and year stats', () => {
        const dto = new DriverComparisonStatsResponseDto();
        
        dto.driverId = 1;
        dto.year = 2023;
        dto.career = {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        };
        dto.yearStats = {
          wins: 6,
          podiums: 17,
          fastestLaps: 5,
          points: 234,
          dnfs: 1,
          sprintWins: 1,
          sprintPodiums: 2,
          poles: 6,
        };

        expect(dto.driverId).toBe(1);
        expect(dto.year).toBe(2023);
        expect(dto.career.wins).toBe(103);
        expect(dto.yearStats.wins).toBe(6);
        expect(dto.yearStats.poles).toBe(6);
      });
    });

    describe('Complete DTO Examples', () => {
      it('should create complete career-only DTO', () => {
        const dto = new DriverComparisonStatsResponseDto();
        
        dto.driverId = 1;
        dto.year = null;
        dto.career = {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        };
        dto.yearStats = null;

        expect(dto.driverId).toBe(1);
        expect(dto.year).toBeNull();
        expect(dto.career).toBeDefined();
        expect(dto.yearStats).toBeNull();
      });

      it('should create complete year-specific DTO', () => {
        const dto = new DriverComparisonStatsResponseDto();
        
        dto.driverId = 2;
        dto.year = 2023;
        dto.career = {
          wins: 54,
          podiums: 95,
          fastestLaps: 28,
          points: 2581.5,
          dnfs: 15,
          sprintWins: 3,
          sprintPodiums: 5,
        };
        dto.yearStats = {
          wins: 19,
          podiums: 21,
          fastestLaps: 9,
          points: 575,
          dnfs: 0,
          sprintWins: 4,
          sprintPodiums: 6,
          poles: 12,
        };

        expect(dto.driverId).toBe(2);
        expect(dto.year).toBe(2023);
        expect(dto.career.wins).toBe(54);
        expect(dto.yearStats.wins).toBe(19);
        expect(dto.yearStats.poles).toBe(12);
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero values', () => {
        const dto = new DriverComparisonStatsResponseDto();
        
        dto.driverId = 1;
        dto.year = 2024;
        dto.career = {
          wins: 0,
          podiums: 0,
          fastestLaps: 0,
          points: 0,
          dnfs: 0,
          sprintWins: 0,
          sprintPodiums: 0,
        };
        dto.yearStats = {
          wins: 0,
          podiums: 0,
          fastestLaps: 0,
          points: 0,
          dnfs: 0,
          sprintWins: 0,
          sprintPodiums: 0,
          poles: 0,
        };

        expect(dto.career.wins).toBe(0);
        expect(dto.yearStats.wins).toBe(0);
        expect(dto.yearStats.poles).toBe(0);
      });

      it('should handle negative values', () => {
        const dto = new DriverComparisonStatsResponseDto();
        
        dto.driverId = 1;
        dto.year = null;
        dto.career = {
          wins: -1,
          podiums: -1,
          fastestLaps: -1,
          points: -1,
          dnfs: -1,
          sprintWins: -1,
          sprintPodiums: -1,
        };
        dto.yearStats = null;

        expect(dto.career.wins).toBe(-1);
        expect(dto.career.podiums).toBe(-1);
        expect(dto.career.fastestLaps).toBe(-1);
      });
    });
  });

  describe('Real-world Examples', () => {
    it('should work with Lewis Hamilton stats', () => {
      const dto = new DriverStatsResponseDto();
      
      dto.driver = {
        id: 44,
        full_name: 'Lewis Hamilton',
        given_name: 'Lewis',
        family_name: 'Hamilton',
        code: 'HAM',
        current_team_name: 'Mercedes',
        image_url: 'https://example.com/lewis.jpg',
        team_color: '#00D2BE',
        country_code: 'GB',
        driver_number: 44,
        date_of_birth: new Date('1985-01-07'),
        bio: 'Seven-time World Champion',
        fun_fact: 'Started racing at age 8',
      };

      dto.careerStats = {
        wins: 103,
        podiums: 197,
        fastestLaps: 65,
        points: 4639.5,
        grandsPrixEntered: 330,
        dnfs: 25,
        highestRaceFinish: 1,
        firstRace: {
          year: 2007,
          event: 'Australian Grand Prix',
        },
        winsPerSeason: [
          { season: 2023, wins: 6 },
          { season: 2022, wins: 0 },
          { season: 2021, wins: 8 },
          { season: 2020, wins: 11 },
          { season: 2019, wins: 11 },
        ],
      };

      dto.currentSeasonStats = {
        wins: 6,
        podiums: 17,
        fastestLaps: 5,
        standing: 'P3',
      };

      expect(dto.driver.full_name).toBe('Lewis Hamilton');
      expect(dto.careerStats.wins).toBe(103);
      expect(dto.currentSeasonStats.wins).toBe(6);
      expect(dto.careerStats.winsPerSeason).toHaveLength(5);
    });

    it('should work with Max Verstappen comparison stats', () => {
      const dto = new DriverComparisonStatsResponseDto();
      
      dto.driverId = 1;
      dto.year = 2023;
      dto.career = {
        wins: 54,
        podiums: 95,
        fastestLaps: 28,
        points: 2581.5,
        dnfs: 15,
        sprintWins: 3,
        sprintPodiums: 5,
      };
      dto.yearStats = {
        wins: 19,
        podiums: 21,
        fastestLaps: 9,
        points: 575,
        dnfs: 0,
        sprintWins: 4,
        sprintPodiums: 6,
        poles: 12,
      };

      expect(dto.driverId).toBe(1);
      expect(dto.year).toBe(2023);
      expect(dto.career.wins).toBe(54);
      expect(dto.yearStats.wins).toBe(19);
      expect(dto.yearStats.poles).toBe(12);
    });
  });

  describe('Data Validation', () => {
    it('should handle different data types correctly', () => {
      const dto = new DriverStatsResponseDto();
      
      dto.driver = {
        id: 1,
        full_name: 'Test Driver',
        given_name: 'Test',
        family_name: 'Driver',
        code: 'TST',
        current_team_name: 'Test Team',
        image_url: 'https://example.com/test.jpg',
        team_color: '#FF0000',
        country_code: 'US',
        driver_number: 99,
        date_of_birth: new Date('1990-01-01'),
        bio: 'Test bio',
        fun_fact: 'Test fact',
      };

      expect(typeof dto.driver.id).toBe('number');
      expect(typeof dto.driver.full_name).toBe('string');
      expect(typeof dto.driver.given_name).toBe('string');
      expect(typeof dto.driver.family_name).toBe('string');
      expect(typeof dto.driver.code).toBe('string');
      expect(typeof dto.driver.current_team_name).toBe('string');
      expect(typeof dto.driver.image_url).toBe('string');
      expect(typeof dto.driver.team_color).toBe('string');
      expect(typeof dto.driver.country_code).toBe('string');
      expect(typeof dto.driver.driver_number).toBe('number');
      expect(dto.driver.date_of_birth).toBeInstanceOf(Date);
      expect(typeof dto.driver.bio).toBe('string');
      expect(typeof dto.driver.fun_fact).toBe('string');
    });

    it('should handle comparison stats data types correctly', () => {
      const dto = new DriverComparisonStatsResponseDto();
      
      dto.driverId = 1;
      dto.year = 2023;
      dto.career = {
        wins: 10,
        podiums: 20,
        fastestLaps: 5,
        points: 250.5,
        dnfs: 2,
        sprintWins: 1,
        sprintPodiums: 3,
      };
      dto.yearStats = {
        wins: 5,
        podiums: 10,
        fastestLaps: 2,
        points: 125.5,
        dnfs: 1,
        sprintWins: 0,
        sprintPodiums: 1,
        poles: 3,
      };

      expect(typeof dto.driverId).toBe('number');
      expect(typeof dto.year).toBe('number');
      expect(typeof dto.career.wins).toBe('number');
      expect(typeof dto.career.podiums).toBe('number');
      expect(typeof dto.career.fastestLaps).toBe('number');
      expect(typeof dto.career.points).toBe('number');
      expect(typeof dto.career.dnfs).toBe('number');
      expect(typeof dto.career.sprintWins).toBe('number');
      expect(typeof dto.career.sprintPodiums).toBe('number');
      expect(typeof dto.yearStats.wins).toBe('number');
      expect(typeof dto.yearStats.poles).toBe('number');
    });
  });
});
