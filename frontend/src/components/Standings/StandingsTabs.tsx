import React from 'react';
import { Button, Box, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface StandingsTabsProps {
  active: 'drivers' | 'constructors';
}

// A pill-style toggle bar for switching standings views
const StandingsTabs: React.FC<StandingsTabsProps> = ({ active }) => {
  const navigate = useNavigate();
  const tabs: { key: 'drivers' | 'constructors'; label: string; path: string; accent: string }[] = [
    { key: 'drivers', label: 'Drivers', path: '/standings', accent: 'red.500' },
    { key: 'constructors', label: 'Constructors', path: '/standings/constructors', accent: 'blue.500' },
  ];

  return (
    <Flex
      role="tablist"
      aria-label="Standings selector"
      bg="blackAlpha.400"
      backdropFilter="blur(12px)"
      border="1px solid"
      borderColor="whiteAlpha.300"
      borderRadius="full"
      p="4px"
      w="fit-content"
      boxShadow="0 4px 16px rgba(0,0,0,0.4)"
      mb={8}
      position="relative"
    >
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <Button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            variant="ghost"
            onClick={() => !isActive && navigate(t.path)}
            px={6}
            h="44px"
            fontWeight={600}
            fontFamily="heading"
            position="relative"
            color={isActive ? 'white' : 'whiteAlpha.700'}
            _hover={{ color: 'white' }}
            _active={{}} // prevent chakra focus ring color shift
            transition="color .25s ease"
          >
            {isActive && (
              <Box
                position="absolute"
                inset={0}
                borderRadius="full"
                bgGradient={`linear(to-r, ${t.accent}, ${t.accent})`}
                filter="auto"
                boxShadow={`0 0 0 1px rgba(255,255,255,0.08), 0 4px 14px -2px var(--chakra-colors-${t.accent.replace('.', '-')})`}
                opacity={0.95}
                zIndex={0}
              />
            )}
            <Text position="relative" zIndex={1}>{t.label}</Text>
          </Button>
        );
      })}
    </Flex>
  );
};

export default StandingsTabs;
