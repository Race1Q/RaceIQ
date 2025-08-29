import React, { useEffect } from 'react';
import { Container, Flex, Box, Button, Text, VStack } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import HeroSection from '../../components/HeroSection/HeroSection';
import { useTheme } from '../../context/ThemeContext';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import { teamColors } from '../../lib/teamColors';
import styles from './DriverDetailPage.module.css';

const mockDrivers = [
  {
    id: 'max_verstappen',
    name: 'Max Verstappen',
    number: '1',
    team: 'Red Bull Racing',
    nationality: 'Dutch',
    country_code: 'NL',
    wins: 54,
    podiums: 98,
    fastestLaps: 30,
    points: 2586.5,
    image:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
    dob: '30 September 1997',
    age: 27,
    championshipStanding: 'P1',
    teamLogoUrl:
      'https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/team%20logos/red%20bull.png',
    teamLogoWhiteUrl:
      'https://www.redbullracing.com/assets/images/red-bull-racing-logo-white.svg',
    firstRace: '2015 Australian GP',
    winsPerSeason: [
      { season: '2021', wins: 10 },
      { season: '2022', wins: 15 },
      { season: '2023', wins: 19 },
      { season: '2024', wins: 10 },
    ],
    lapByLapData: [
      { lap: 1, position: 1 },
      { lap: 2, position: 1 },
      { lap: 3, position: 1 },
      { lap: 4, position: 1 },
      { lap: 5, position: 1 },
      { lap: 6, position: 1 },
      { lap: 7, position: 1 },
      { lap: 8, position: 1 },
      { lap: 9, position: 1 },
      { lap: 10, position: 1 },
      { lap: 11, position: 1 },
      { lap: 12, position: 1 },
      { lap: 13, position: 1 },
      { lap: 14, position: 1 },
      { lap: 15, position: 1 },
      { lap: 16, position: 1 },
      { lap: 17, position: 1 },
      { lap: 18, position: 1 },
      { lap: 19, position: 1 },
      { lap: 20, position: 1 },
    ],
  },
  {
    id: 'lewis_hamilton',
    name: 'Lewis Hamilton',
    number: '44',
    team: 'Mercedes',
    nationality: 'British',
    country_code: 'GB',
    wins: 103,
    podiums: 197,
    fastestLaps: 64,
    points: 4639.5,
    image:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png',
    dob: '07 January 1985',
    age: 40,
    championshipStanding: 'P3',
    teamLogoUrl:
      'https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/team%20logos/mercedes.png',
    teamLogoWhiteUrl:
      'https://www.mercedes-amg-f1.com/wp-content/themes/mercedes-amg-f1/img/logo-mercedes-amg-f1.svg',
    firstRace: '2007 Australian GP',
    winsPerSeason: [
      { season: '2021', wins: 8 },
      { season: '2022', wins: 0 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 0 },
    ],
    lapByLapData: [
      { lap: 1, position: 3 },
      { lap: 2, position: 3 },
      { lap: 3, position: 2 },
      { lap: 4, position: 2 },
      { lap: 5, position: 2 },
      { lap: 6, position: 2 },
      { lap: 7, position: 2 },
      { lap: 8, position: 2 },
      { lap: 9, position: 2 },
      { lap: 10, position: 2 },
      { lap: 11, position: 2 },
      { lap: 12, position: 2 },
      { lap: 13, position: 2 },
      { lap: 14, position: 2 },
      { lap: 15, position: 2 },
      { lap: 16, position: 2 },
      { lap: 17, position: 2 },
      { lap: 18, position: 2 },
      { lap: 19, position: 2 },
      { lap: 20, position: 2 },
    ],
  },
  {
    id: 'charles_leclerc',
    name: 'Charles Leclerc',
    number: '16',
    team: 'Ferrari',
    nationality: 'Monegasque',
    country_code: 'MC',
    wins: 5,
    podiums: 30,
    fastestLaps: 7,
    points: 1074,
    image:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png',
    dob: '16 October 1997',
    age: 27,
    championshipStanding: 'P2',
    teamLogoUrl:
      'https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/team%20logos/ferrari.png',
    teamLogoWhiteUrl:
      'https://www.ferrari.com/etc.clientlibs/ferrari/clientlibs/clientlib-common/resources/img/ferrari_logo.svg',
    firstRace: '2018 Australian GP',
    winsPerSeason: [
      { season: '2021', wins: 0 },
      { season: '2022', wins: 3 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 2 },
    ],
    lapByLapData: [
      { lap: 1, position: 2 },
      { lap: 2, position: 2 },
      { lap: 3, position: 3 },
      { lap: 4, position: 3 },
      { lap: 5, position: 3 },
      { lap: 6, position: 3 },
      { lap: 7, position: 3 },
      { lap: 8, position: 3 },
      { lap: 9, position: 3 },
      { lap: 10, position: 3 },
      { lap: 11, position: 3 },
      { lap: 12, position: 3 },
      { lap: 13, position: 3 },
      { lap: 14, position: 3 },
      { lap: 15, position: 3 },
      { lap: 16, position: 3 },
      { lap: 17, position: 3 },
      { lap: 18, position: 3 },
      { lap: 19, position: 3 },
      { lap: 20, position: 3 },
    ],
  },
  {
    id: 'lando_norris',
    name: 'Lando Norris',
    number: '4',
    team: 'McLaren',
    nationality: 'British',
    country_code: 'GB',
    wins: 1,
    podiums: 15,
    fastestLaps: 5,
    points: 633,
    image:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png',
    dob: '13 November 1999',
    age: 25,
    championshipStanding: 'P4',
    teamLogoUrl:
      'https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/team%20logos/mclaren.png',
    teamLogoWhiteUrl:
      'https://www.mclaren.com/themes/custom/mclarentheme/images/logo.svg',
    firstRace: '2019 Australian GP',
    winsPerSeason: [
      { season: '2021', wins: 0 },
      { season: '2022', wins: 0 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 1 },
    ],
    lapByLapData: [
      { lap: 1, position: 4 },
      { lap: 2, position: 4 },
      { lap: 3, position: 4 },
      { lap: 4, position: 4 },
      { lap: 5, position: 4 },
      { lap: 6, position: 4 },
      { lap: 7, position: 4 },
      { lap: 8, position: 4 },
      { lap: 9, position: 4 },
      { lap: 10, position: 4 },
      { lap: 11, position: 4 },
      { lap: 12, position: 4 },
      { lap: 13, position: 4 },
      { lap: 14, position: 4 },
      { lap: 15, position: 4 },
      { lap: 16, position: 4 },
      { lap: 17, position: 4 },
      { lap: 18, position: 4 },
      { lap: 19, position: 4 },
      { lap: 20, position: 4 },
    ],
  },
  {
    id: 'carlos_sainz',
    name: 'Carlos Sainz',
    number: '55',
    team: 'Ferrari',
    nationality: 'Spanish',
    country_code: 'ES',
    wins: 2,
    podiums: 18,
    fastestLaps: 3,
    points: 982.5,
    image:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png',
    dob: '01 September 1994',
    age: 31,
    championshipStanding: 'P5',
    teamLogoUrl:
      'https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/team%20logos/ferrari.png',
    teamLogoWhiteUrl:
      'https://www.ferrari.com/etc.clientlibs/ferrari/clientlibs/clientlib-common/resources/img/ferrari_logo.svg',
    firstRace: '2015 Australian GP',
    winsPerSeason: [
      { season: '2021', wins: 0 },
      { season: '2022', wins: 1 },
      { season: '2023', wins: 0 },
      { season: '2024', wins: 1 },
    ],
    lapByLapData: [
      { lap: 1, position: 5 },
      { lap: 2, position: 5 },
      { lap: 3, position: 5 },
      { lap: 4, position: 5 },
      { lap: 5, position: 5 },
      { lap: 6, position: 5 },
      { lap: 7, position: 5 },
      { lap: 8, position: 5 },
      { lap: 9, position: 5 },
      { lap: 10, position: 5 },
      { lap: 11, position: 5 },
      { lap: 12, position: 5 },
      { lap: 13, position: 5 },
      { lap: 14, position: 5 },
      { lap: 15, position: 5 },
      { lap: 16, position: 5 },
      { lap: 17, position: 5 },
      { lap: 18, position: 5 },
      { lap: 19, position: 5 },
      { lap: 20, position: 5 },
    ],
  },
];

const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { setThemeColor } = useTheme();

  const selectedDriver = mockDrivers.find((driver) => driver.id === driverId) || mockDrivers[0];

  useEffect(() => {
    if (selectedDriver) {
      const newColor = teamColors[selectedDriver.team] || '#FF1801';
      setThemeColor(newColor);
    }
    return () => {
      setThemeColor('#FF1801');
    };
  }, [selectedDriver, setThemeColor]);

  if (!selectedDriver) {
    return (
      <Container>
        <VStack spacing={4} mt={10}>
          <Text fontSize="2xl" color="var(--color-text-light)">Driver not found.</Text>
          <Link to="/drivers">
            <Button leftIcon={<ArrowLeft />} colorScheme="red">
              Back to Drivers
            </Button>
          </Link>
        </VStack>
      </Container>
    );
  }

  const [firstName, ...lastNameParts] = selectedDriver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <>
      <HeroSection backgroundImageUrl="https://images.pexels.com/photos/29252132/pexels-photo-29252132.jpeg">
        <div className={styles.heroContentLayout}>
          <div className={styles.heroTitleBlock}>
            <h1 className={styles.heroTitle}>
              <span className={styles.firstName}>{firstName}</span>
              <span className={styles.lastName}>{lastName}</span>
            </h1>
          </div>
          <div className={styles.heroBioBlock}>
            <img
              src={`https://flagsapi.com/${selectedDriver.country_code}/flat/64.png`}
              alt={`${selectedDriver.nationality} flag`}
              className={styles.flagImage}
            />
            <div className={styles.bioText}>
              <span>Born: {selectedDriver.dob}</span>
              <span>Age: {selectedDriver.age}</span>
            </div>
          </div>
        </div>
      </HeroSection>

      <Container maxWidth="1400px">
        <KeyInfoBar driver={selectedDriver as any} />
      </Container>

      <Container maxWidth="1400px" paddingX={['1rem', '2rem', '3rem']} paddingY="2rem">
        <Flex direction={['column', 'column', 'row']} gap={6}>
          <Box flex={1}>
            <DashboardGrid driver={selectedDriver} />
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default DriverDetailPage;


