/**
 * Circuit background images and key stats data
 * Background images are stored in /public/circuits/backgrounds/
 * These are high-quality, wide-screen images for header backgrounds
 */

export interface CircuitKeyStats {
  length: string;
  laps: number;
  corners: number;
  drsZones: number;
  recordLap?: string;
  firstRace?: number;
  elevation?: string;
  averageSpeed?: string;
}

export interface CircuitBackground {
  image: string;
  gradient: string;
  keyStats: CircuitKeyStats;
}

export const circuitBackgroundMap: Record<number, CircuitBackground> = {
  // Australian Grand Prix - Albert Park
  4: {
    image: '/circuits/backgrounds/australia-albert-bg.webp',
    gradient: 'linear-gradient(135deg, #1e40af 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.278 km',
      laps: 58,
      corners: 14,
      drsZones: 2,
      recordLap: '1:20.235',
      firstRace: 1996,
      elevation: '5m',
      averageSpeed: '205 km/h'
    }
  },
  
  // United States Grand Prix - Circuit of the Americas
  5: {
    image: '/circuits/backgrounds/usa-austin-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.513 km',
      laps: 56,
      corners: 20,
      drsZones: 2,
      recordLap: '1:36.169',
      firstRace: 2012,
      elevation: '133m',
      averageSpeed: '197 km/h'
    }
  },
  
  // Bahrain Grand Prix
  8: {
    image: '/circuits/backgrounds/bahrain-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.412 km',
      laps: 57,
      corners: 15,
      drsZones: 3,
      recordLap: '1:31.447',
      firstRace: 2004,
      elevation: '7m',
      averageSpeed: '210 km/h'
    }
  },
  
  // Azerbaijan Grand Prix - Baku City Circuit
  9: {
    image: '/circuits/backgrounds/azerbaijan-baku-bg.webp',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '6.003 km',
      laps: 51,
      corners: 20,
      drsZones: 2,
      recordLap: '1:43.009',
      firstRace: 2016,
      elevation: '26m',
      averageSpeed: '206 km/h'
    }
  },
  
  // Spanish Grand Prix - Barcelona
  14: {
    image: '/circuits/backgrounds/spain-barcelona-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.675 km',
      laps: 66,
      corners: 16,
      drsZones: 2,
      recordLap: '1:18.149',
      firstRace: 1991,
      elevation: '127m',
      averageSpeed: '197 km/h'
    }
  },
  
  // Hungarian Grand Prix - Hungaroring
  26: {
    image: '/circuits/backgrounds/hungary-hungaroring-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.381 km',
      laps: 70,
      corners: 14,
      drsZones: 1,
      recordLap: '1:16.627',
      firstRace: 1986,
      elevation: '264m',
      averageSpeed: '195 km/h'
    }
  },
  
  // Emilia Romagna Grand Prix - Imola
  27: {
    image: '/circuits/backgrounds/italy-imola-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.909 km',
      laps: 63,
      corners: 19,
      drsZones: 2,
      recordLap: '1:15.484',
      firstRace: 1980,
      elevation: '37m',
      averageSpeed: '200 km/h'
    }
  },
  
  // São Paulo Grand Prix - Interlagos
  29: {
    image: '/circuits/backgrounds/brazil-interlagos-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.309 km',
      laps: 71,
      corners: 15,
      drsZones: 2,
      recordLap: '1:10.540',
      firstRace: 1973,
      elevation: '785m',
      averageSpeed: '203 km/h'
    }
  },
  
  // Saudi Arabian Grand Prix - Jeddah
  33: {
    image: '/circuits/backgrounds/saudi-jeddah-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '6.174 km',
      laps: 50,
      corners: 27,
      drsZones: 3,
      recordLap: '1:28.149',
      firstRace: 2021,
      elevation: '12m',
      averageSpeed: '252 km/h'
    }
  },
  
  // Qatar Grand Prix - Lusail
  39: {
    image: '/circuits/backgrounds/qatar-lusail-bg.webp',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.419 km',
      laps: 57,
      corners: 16,
      drsZones: 2,
      recordLap: '1:23.196',
      firstRace: 2021,
      elevation: '5m',
      averageSpeed: '209 km/h'
    }
  },
  
  // Singapore Grand Prix - Marina Bay
  41: {
    image: '/circuits/backgrounds/singapore-marina-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.063 km',
      laps: 61,
      corners: 23,
      drsZones: 2,
      recordLap: '1:41.905',
      firstRace: 2008,
      elevation: '18m',
      averageSpeed: '175 km/h'
    }
  },
  
  // Miami Grand Prix
  42: {
    image: '/circuits/backgrounds/usa-miami-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.412 km',
      laps: 57,
      corners: 19,
      drsZones: 3,
      recordLap: '1:29.708',
      firstRace: 2022,
      elevation: '1m',
      averageSpeed: '223 km/h'
    }
  },
  
  // Monaco Grand Prix
  43: {
    image: '/circuits/backgrounds/monaco-monaco-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '3.337 km',
      laps: 78,
      corners: 19,
      drsZones: 1,
      recordLap: '1:12.909',
      firstRace: 1950,
      elevation: '7m',
      averageSpeed: '157 km/h'
    }
  },
  
  // Italian Grand Prix - Monza
  46: {
    image: '/circuits/backgrounds/italy-monza-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.793 km',
      laps: 53,
      corners: 11,
      drsZones: 2,
      recordLap: '1:21.046',
      firstRace: 1950,
      elevation: '162m',
      averageSpeed: '264 km/h'
    }
  },
  
  // Austrian Grand Prix - Red Bull Ring
  56: {
    image: '/circuits/backgrounds/austria-redbullring-bg.webp',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.318 km',
      laps: 71,
      corners: 10,
      drsZones: 2,
      recordLap: '1:05.619',
      firstRace: 1970,
      elevation: '678m',
      averageSpeed: '229 km/h'
    }
  },
  
  // Mexico City Grand Prix - Hermanos Rodríguez
  60: {
    image: '/circuits/backgrounds/mexico-hermanos-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.304 km',
      laps: 71,
      corners: 17,
      drsZones: 2,
      recordLap: '1:17.774',
      firstRace: 1963,
      elevation: '2240m',
      averageSpeed: '185 km/h'
    }
  },
  
  // Chinese Grand Prix - Shanghai
  63: {
    image: '/circuits/backgrounds/china-shanghai-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.451 km',
      laps: 56,
      corners: 16,
      drsZones: 2,
      recordLap: '1:32.238',
      firstRace: 2004,
      elevation: '14m',
      averageSpeed: '205 km/h'
    }
  },
  
  // British Grand Prix - Silverstone
  64: {
    image: '/circuits/backgrounds/britain-silverstone-bg.webp',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.891 km',
      laps: 52,
      corners: 18,
      drsZones: 2,
      recordLap: '1:27.097',
      firstRace: 1950,
      elevation: '153m',
      averageSpeed: '245 km/h'
    }
  },
  
  // Belgian Grand Prix - Spa-Francorchamps
  66: {
    image: '/circuits/backgrounds/belgium-spa-bg.webp',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '7.004 km',
      laps: 44,
      corners: 19,
      drsZones: 2,
      recordLap: '1:46.286',
      firstRace: 1950,
      elevation: '401m',
      averageSpeed: '238 km/h'
    }
  },
  
  // Japanese Grand Prix - Suzuka
  67: {
    image: '/circuits/backgrounds/japan-suzuka-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.807 km',
      laps: 53,
      corners: 18,
      drsZones: 2,
      recordLap: '1:30.983',
      firstRace: 1987,
      elevation: '45m',
      averageSpeed: '220 km/h'
    }
  },
  
  // Las Vegas Grand Prix
  70: {
    image: '/circuits/backgrounds/usa-lasvegas-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '6.201 km',
      laps: 50,
      corners: 17,
      drsZones: 3,
      recordLap: '1:35.490',
      firstRace: 2023,
      elevation: '620m',
      averageSpeed: '212 km/h'
    }
  },
  
  // Canadian Grand Prix - Montreal
  71: {
    image: '/circuits/backgrounds/canada-montreal-bg.webp',
    gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.361 km',
      laps: 70,
      corners: 14,
      drsZones: 2,
      recordLap: '1:13.078',
      firstRace: 1978,
      elevation: '13m',
      averageSpeed: '205 km/h'
    }
  },
  
  // Abu Dhabi Grand Prix - Yas Marina
  73: {
    image: '/circuits/backgrounds/abudhabi-yas-bg.webp',
    gradient: 'linear-gradient(135deg, #059669 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '5.281 km',
      laps: 58,
      corners: 16,
      drsZones: 2,
      recordLap: '1:26.103',
      firstRace: 2009,
      elevation: '9m',
      averageSpeed: '198 km/h'
    }
  },
  
  // Dutch Grand Prix - Zandvoort
  75: {
    image: '/circuits/backgrounds/dutch-zandvoort-bg.webp',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, rgba(0,0,0,0.7) 100%)',
    keyStats: {
      length: '4.259 km',
      laps: 72,
      corners: 14,
      drsZones: 2,
      recordLap: '1:11.097',
      firstRace: 1952,
      elevation: '1m',
      averageSpeed: '206 km/h'
    }
  }
};

/**
 * Gets the background configuration for a given circuit ID
 * @param circuitId - The database circuit ID
 * @returns CircuitBackground or null if not found
 */
export const getCircuitBackground = (circuitId: number): CircuitBackground | null => {
  return circuitBackgroundMap[circuitId] || null;
};

/**
 * Fallback background for circuits without specific backgrounds
 */
export const getDefaultCircuitBackground = (): CircuitBackground => ({
  image: '/circuits/backgrounds/default-f1-bg.webp',
  gradient: 'linear-gradient(135deg, #dc2626 0%, rgba(0,0,0,0.7) 100%)',
  keyStats: {
    length: 'N/A',
    laps: 0,
    corners: 0,
    drsZones: 0
  }
});
