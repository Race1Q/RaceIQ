import React, { useState } from 'react';
import { Container, Flex, Box } from '@chakra-ui/react';
import DriverList from '../components/DriverList/DriverList';
import DashboardGrid from '../components/DashboardGrid/DashboardGrid';
import HeroSection from '../components/HeroSection/HeroSection';

// Mock data for drivers
const mockDrivers = [
  {
    id: 'max_verstappen',
    name: 'Max Verstappen',
    number: '1',
    team: 'Red Bull Racing',
    nationality: 'Dutch',
    wins: 54,
    podiums: 98,
    fastestLaps: 30,
    points: 2586.5,
    image: 'https://via.placeholder.com/150x200/DC0000/FFFFFF?text=MV',
    winsPerSeason: [
      { season: '2021', wins: 10 },
      { season: '2022', wins: 15 },
      { season: '2023', wins: 19 },
      { season: '2024', wins: 10 }
    ],
    lapByLapData: [
      { lap: 1, position: 1 }, { lap: 2, position: 1 }, { lap: 3, position: 1 },
      { lap: 4, position: 1 }, { lap: 5, position: 1 }, { lap: 6, position: 1 },
      { lap: 7, position: 1 }, { lap: 8, position: 1 }, { lap: 9, position: 1 },
      { lap: 10, position: 1 }, { lap: 11, position: 1 }, { lap: 12, position: 1 },
      { lap: 13, position: 1 }, { lap: 14, position: 1 }, { lap: 15, position: 1 },
      { lap: 16, position: 1 }, { lap: 17, position: 1 }, { lap: 18, position: 1 },
      { lap: 19, position: 1 }, { lap: 20, position: 1 }
    ]
  },
  {
    id: 'lewis_hamilton',
    name: 'Lewis Hamilton',
    number: '44',
    team: 'Mercedes',
    nationality: 'British',
    wins: 103,
    podiums: 197,
    fastestLaps: 64,
    points: 4639.5,
    image: 'https://via.placeholder.com/150x200/00D2BE/FFFFFF?text=LH',
    winsPerSeason: [
      { season: '2021', wins: 8 },
      { season: '2022', wins: 0 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 0 }
    ],
    lapByLapData: [
      { lap: 1, position: 3 }, { lap: 2, position: 3 }, { lap: 3, position: 2 },
      { lap: 4, position: 2 }, { lap: 5, position: 2 }, { lap: 6, position: 2 },
      { lap: 7, position: 2 }, { lap: 8, position: 2 }, { lap: 9, position: 2 },
      { lap: 10, position: 2 }, { lap: 11, position: 2 }, { lap: 12, position: 2 },
      { lap: 13, position: 2 }, { lap: 14, position: 2 }, { lap: 15, position: 2 },
      { lap: 16, position: 2 }, { lap: 17, position: 2 }, { lap: 18, position: 2 },
      { lap: 19, position: 2 }, { lap: 20, position: 2 }
    ]
  },
  {
    id: 'charles_leclerc',
    name: 'Charles Leclerc',
    number: '16',
    team: 'Ferrari',
    nationality: 'Monegasque',
    wins: 5,
    podiums: 30,
    fastestLaps: 7,
    points: 1074,
    image: 'https://via.placeholder.com/150x200/DC0000/FFFFFF?text=CL',
    winsPerSeason: [
      { season: '2021', wins: 0 },
      { season: '2022', wins: 3 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 2 }
    ],
    lapByLapData: [
      { lap: 1, position: 2 }, { lap: 2, position: 2 }, { lap: 3, position: 3 },
      { lap: 4, position: 3 }, { lap: 5, position: 3 }, { lap: 6, position: 3 },
      { lap: 7, position: 3 }, { lap: 8, position: 3 }, { lap: 9, position: 3 },
      { lap: 10, position: 3 }, { lap: 11, position: 3 }, { lap: 12, position: 3 },
      { lap: 13, position: 3 }, { lap: 14, position: 3 }, { lap: 15, position: 3 },
      { lap: 16, position: 3 }, { lap: 17, position: 3 }, { lap: 18, position: 3 },
      { lap: 19, position: 3 }, { lap: 20, position: 3 }
    ]
  },
  {
    id: 'lando_norris',
    name: 'Lando Norris',
    number: '4',
    team: 'McLaren',
    nationality: 'British',
    wins: 1,
    podiums: 15,
    fastestLaps: 5,
    points: 633,
    image: 'https://via.placeholder.com/150x200/FF8700/FFFFFF?text=LN',
    winsPerSeason: [
      { season: '2021', wins: 0 },
      { season: '2022', wins: 0 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 1 }
    ],
    lapByLapData: [
      { lap: 1, position: 4 }, { lap: 2, position: 4 }, { lap: 3, position: 4 },
      { lap: 4, position: 4 }, { lap: 5, position: 4 }, { lap: 6, position: 4 },
      { lap: 7, position: 4 }, { lap: 8, position: 4 }, { lap: 9, position: 4 },
      { lap: 10, position: 4 }, { lap: 11, position: 4 }, { lap: 12, position: 4 },
      { lap: 13, position: 4 }, { lap: 14, position: 4 }, { lap: 15, position: 4 },
      { lap: 16, position: 4 }, { lap: 17, position: 4 }, { lap: 18, position: 4 },
      { lap: 19, position: 4 }, { lap: 20, position: 4 }
    ]
  },
  {
    id: 'carlos_sainz',
    name: 'Carlos Sainz',
    number: '55',
    team: 'Ferrari',
    nationality: 'Spanish',
    wins: 2,
    podiums: 18,
    fastestLaps: 3,
    points: 982.5,
    image: 'https://via.placeholder.com/150x200/DC0000/FFFFFF?text=CS',
    winsPerSeason: [
      { season: '2021', wins: 0 },
      { season: '2022', wins: 1 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 1 }
    ],
    lapByLapData: [
      { lap: 1, position: 5 }, { lap: 2, position: 5 }, { lap: 3, position: 5 },
      { lap: 4, position: 5 }, { lap: 5, position: 5 }, { lap: 6, position: 5 },
      { lap: 7, position: 5 }, { lap: 8, position: 5 }, { lap: 9, position: 5 },
      { lap: 10, position: 5 }, { lap: 11, position: 5 }, { lap: 12, position: 5 },
      { lap: 13, position: 5 }, { lap: 14, position: 5 }, { lap: 15, position: 5 },
      { lap: 16, position: 5 }, { lap: 17, position: 5 }, { lap: 18, position: 5 },
      { lap: 19, position: 5 }, { lap: 20, position: 5 }
    ]
  }
];

const DriversDashboardPage: React.FC = () => {
  const [selectedDriverId, setSelectedDriverId] = useState('max_verstappen');

  const selectedDriver = mockDrivers.find(driver => driver.id === selectedDriverId) || mockDrivers[0];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Drivers Dashboard"
        subtitle="Your personalized hub for in-depth driver statistics and performance analytics."
        backgroundImageUrl="https://images.pexels.com/photos/29252132/pexels-photo-29252132.jpeg"
      />
      
      {/* Main Content */}
      <Container maxWidth="1400px" paddingX={['1rem', '2rem', '3rem']} paddingY="2rem">
        <Flex direction={['column', 'column', 'row']} gap={6}>
          <Box width={['100%', '100%', '300px']} flexShrink={0}>
            <DriverList
              drivers={mockDrivers}
              selectedDriverId={selectedDriverId}
              setSelectedDriverId={setSelectedDriverId}
            />
          </Box>
          <Box flex={1}>
            <DashboardGrid driver={selectedDriver} />
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default DriversDashboardPage;
