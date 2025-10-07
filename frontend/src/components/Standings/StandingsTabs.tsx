import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useThemeColor } from '../../context/ThemeColorContext';

interface StandingsTabsProps {
  active: 'drivers' | 'constructors';
}

// A pill-style toggle bar for switching standings views
const StandingsTabs: React.FC<StandingsTabsProps> = ({ active }) => {
  const navigate = useNavigate();
  const { accentColorWithHash, accentColorRgba } = useThemeColor();
  const tabs: { key: 'drivers' | 'constructors'; label: string; path: string }[] = [
    { key: 'drivers', label: 'Drivers', path: '/standings' },
    { key: 'constructors', label: 'Constructors', path: '/standings/constructors' },
  ];

  return (
    <Flex
      role="tablist"
      aria-label="Standings selector"
      bg="bg-surface"
      border="1px solid"
      borderColor="border-primary"
      borderRadius="full"
      p="6px"
      w="fit-content"
      boxShadow="shadow-md"
      mb={8}
      position="relative"
      gap={2}
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
            color={isActive ? 'text-on-accent' : 'text-secondary'}
            _hover={{ color: isActive ? 'text-on-accent' : 'text-primary' }}
            _active={{}} // prevent chakra focus ring color shift
            transition="color .25s ease"
            bg={isActive ? accentColorWithHash : 'transparent'}
            borderRadius="full"
            boxShadow={isActive ? `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset` : 'none'}
          >
            <Text>{t.label}</Text>
          </Button>
        );
      })}
    </Flex>
  );
};

export default StandingsTabs;
