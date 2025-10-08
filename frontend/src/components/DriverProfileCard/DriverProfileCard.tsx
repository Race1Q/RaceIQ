import React from 'react';
import { Box, VStack, Heading, Text, Image, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import userIcon from '../../assets/UserIcon.png';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { driverHeadshots } from '../../lib/driverHeadshots';
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
      borderRadius="24px" // Custom high border radius for very rounded corners
      overflow="visible" // Changed to visible to allow image to break frame
      boxShadow="lg"
      border="1px solid"
      borderColor="border-primary"
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
      }}
      role="group" // Add role group for child _groupHover effects
      position="relative"
    >
      <VStack spacing={0} height="100%" align="stretch">
        <Box
          position="relative"
          flexGrow={1}
          p={{ base: 'sm', md: 'lg' }}
          // Enhanced spotlight gradient for premium depth
          bgGradient={`radial(at 60% 20%, ${lightenColor(teamColor, 0.3)} 0%, ${lightenColor(teamColor, 0.1)} 25%, ${teamColor} 50%, ${darkenColor(teamColor, 0.4)} 80%, ${darkenColor(teamColor, 0.8)} 100%)`}
          minH={{ base: '200px', md: '300px' }}
          overflow="hidden"
          borderTopRadius="24px" // Match the outer container's border radius
        >
          {/* Ghosted Driver Number Overlay */}
          {isNumberAvailable && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              fontSize={{ base: '120px', md: '200px' }}
              fontWeight="900"
              color="rgba(255, 255, 255, 0.08)"
              fontFamily="heading"
              zIndex={0}
              pointerEvents="none"
              userSelect="none"
            >
              {driver.number}
            </Box>
          )}
          {/* Driver Text Info */}
          <VStack
            align="flex-start"
            spacing={0}
            zIndex={3} // Increased z-index to appear above ghosted number
            position="relative"
            w="65%"
            color="white"
            textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
          >
            <Heading
              as="h2"
              fontFamily="signature"
              fontSize={{ base: '2xl', md: '4xl' }}
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
              fontSize={{ base: 'xl', md: '3xl' }}
              fontWeight="bold"
              lineHeight="1.1"
              textTransform="uppercase"
            >
              {lastName}
            </Heading>

            {isNumberAvailable && (
              <Text
                fontFamily="heading"
                fontSize={{ base: 'xl', md: '3xl' }}
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
            left={{ base: 'sm', md: 'lg' }}
            bottom={{ base: 'sm', md: 'lg' }}
            zIndex={3} // Increased z-index to appear above ghosted number
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
                  width: '32px',
                  height: '24px',
                }}
                title={driver.nationality}
              />
            </Box>
          </Flex>

          {/* Driver Image - Fitting within card */}
          <Image
            src={driverHeadshots[driver.name] || driver.image || userIcon}
            alt={driver.name}
            position="absolute"
            right="10px"
            bottom="0" // Changed to 0 to touch the bottom of the card
            height="85%" // Reduced height to fit within card
            maxW="60%" // Reduced max width to fit better
            objectFit="contain"
            objectPosition="bottom right"
            zIndex={1}
            filter="drop-shadow(5px 5px 10px rgba(0,0,0,0.4))"
            transition="transform 0.3s ease"
            _groupHover={{ transform: 'scale(1.05)' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
          />
        </Box>

        <Box
          bg="bg-surface"
          textAlign="center"
          p={{ base: 'sm', md: 'md' }}
          fontFamily="heading"
          color="text-muted"
          fontSize={{ base: 'xs', md: 'sm' }}
          transition="all 0.2s ease"
          borderTop="1px solid"
          borderColor="border-primary"
          borderBottomRadius="24px" // Match the outer container's border radius
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
