import React from 'react';
import { Box, VStack, Heading, Text, Image, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import userIcon from '../../assets/UserIcon.png';
import { countryCodeMap } from '../../lib/countryCodeUtils';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  image: string;
  team_color: string;
}

interface DriverProfileCardProps {
  driver: Driver;
}

// This helper function can be moved to a utils file later
const darkenColor = (hex: string, percent: number): string => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const factor = (100 - percent) / 100;
  const darkenedR = Math.round(Math.max(0, r * factor));
  const darkenedG = Math.round(Math.max(0, g * factor));
  const darkenedB = Math.round(Math.max(0, b * factor));
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
};


const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver }) => {
  const teamColor = driver.team_color || '#666666';
  const gradientEndColor = darkenColor(teamColor, 20);

  const [firstName, ...lastNameParts] = driver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const isNumberAvailable = driver.number && driver.number !== 'N/A';

  return (
    <Box
      height="100%"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      border="1px solid"
      borderColor="border-primary"
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
      }}
    >
      <VStack spacing={0} height="100%" align="stretch">
        <Box
          position="relative"
          flexGrow={1}
          p={{ base: 'md', md: 'lg' }}
          bgGradient={`linear(135deg, ${teamColor} 0%, ${gradientEndColor} 100%)`}
          minH="300px"
          overflow="hidden"
        >
          {/* Driver Text Info */}
          <VStack
            align="flex-start"
            spacing={0}
            zIndex={2}
            position="relative"
            w="65%"
            color="white"
            textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
          >
            <Heading
              as="h2"
              fontFamily="signature"
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="normal"
              lineHeight="1"
              textTransform="none"
              mb="-0.2em" // Overlap fonts slightly
            >
              {firstName}
            </Heading>
            <Heading
              as="span"
              fontFamily="heading"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
              lineHeight="1.1"
              textTransform="uppercase"
            >
              {lastName}
            </Heading>

            {/* Driver Number - only shows if available */}
            {isNumberAvailable && (
              <Text
                fontFamily="heading"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                pt="sm"
              >
                {driver.number}
              </Text>
            )}
          </VStack>

          {/* Driver Nationality Flag */}
          <Flex
            position="absolute"
            left={{ base: 'md', md: 'lg' }}
            bottom={{ base: 'md', md: 'lg' }}
            zIndex={2}
            align="center"
          >
            {(() => {
              const twoLetter = countryCodeMap[driver.nationality?.toUpperCase()] || driver.nationality;
              return twoLetter ? (
                <ReactCountryFlag
                  countryCode={twoLetter.toLowerCase()}
                  svg
                  style={{ width: '40px', height: '30px', borderRadius: '4px' }}
                  title={driver.nationality}
                />
              ) : null;
            })()}
          </Flex>

          {/* Driver Image */}
          <Image
            src={driver.image || userIcon}
            alt={driver.name}
            position="absolute"
            right="-10px"
            bottom="0"
            height="95%"
            objectFit="contain"
            objectPosition="bottom right"
            zIndex={1}
            filter="drop-shadow(5px 5px 10px rgba(0,0,0,0.4))"
            transition="transform 0.3s ease"
            _groupHover={{ transform: 'scale(1.03)' }} // This requires parent to have role="group"
            onError={(e) => { e.currentTarget.src = userIcon; }}
          />
        </Box>

        <Box
          bg="bg-surface"
          textAlign="center"
          p="md"
          fontFamily="heading"
          color="text-muted"
          fontSize="sm"
          transition="all 0.2s ease"
          borderTop="1px solid"
          borderColor="border-primary"
          _groupHover={{ // This requires parent to have role="group"
            bg: teamColor,
            color: 'white',
          }}
        >
          <Text>View Profile</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default DriverProfileCard;
