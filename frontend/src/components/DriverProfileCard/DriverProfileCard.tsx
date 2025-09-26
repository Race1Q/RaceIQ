import React from 'react';
import { Box, VStack, Heading, Text, Image, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import userIcon from '../../assets/UserIcon.png';
import { countryCodeMap } from '../../lib/countryCodeUtils';
// Import our new color helpers
import { lightenColor, darkenColor } from '../../lib/colorUtils';

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

const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver }) => {
  const teamColor = driver.team_color || '#333333';

  const [firstName, ...lastNameParts] = driver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const countryCode = countryCodeMap[driver.nationality] || driver.nationality;
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
      role="group" // Add role group for child _groupHover effects
    >
      <VStack spacing={0} height="100%" align="stretch">
        <Box
          position="relative"
          flexGrow={1}
          p={{ base: 'md', md: 'lg' }}
          // UPDATED: Changed 25% to 45% for a softer gradient
          bgGradient={`radial(at 70% 30%, ${lightenColor(teamColor, 20)} 0%, ${teamColor} 45%, ${darkenColor(teamColor, 80)} 90%)`}
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
              mb="-0.2em"
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
            <Box
              boxShadow="lg"
              border="1px solid rgba(255, 255, 255, 0.15)"
              lineHeight="0"
            >
              <ReactCountryFlag
                countryCode={countryCode.toLowerCase()}
                svg
                style={{
                  width: '40px',
                  height: '30px',
                }}
                title={driver.nationality}
              />
            </Box>
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
            _groupHover={{ transform: 'scale(1.03)' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
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
          _groupHover={{
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
