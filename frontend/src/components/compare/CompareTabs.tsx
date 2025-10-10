// frontend/src/components/Compare/CompareTabs.tsx
import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useThemeColor } from '../../context/ThemeColorContext';

interface CompareTabsProps {
  active: 'drivers' | 'constructors';
}

// A pill-style toggle bar for switching comparison views
const CompareTabs: React.FC<CompareTabsProps> = ({ active }) => {
  const navigate = useNavigate();
  const { accentColorWithHash, accentColorRgba } = useThemeColor();
  const tabs: { key: 'drivers' | 'constructors'; label: string; path: string }[] = [
    { key: 'drivers', label: 'Drivers', path: '/compare' },
    { key: 'constructors', label: 'Constructors', path: '/compare/constructors' },
  ];

  return (
    <Flex
      role="tablist"
      aria-label="Comparison selector"
      bg="bg-surface"
      border="1px solid"
      borderColor="border-primary"
      borderRadius="full"
      p="6px"
      w="fit-content"
      boxShadow="shadow-md"
      position="relative"
      gap={2}
      mb={6}
      justify="center"
      align="center"
      mx="auto"
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

export default CompareTabs;