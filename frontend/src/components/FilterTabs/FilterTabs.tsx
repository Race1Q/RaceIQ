import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';

type FilterOption = 'active' | 'historical' | 'all';

interface FilterTabsProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

// A pill-style toggle bar for switching filter views (matches StandingsTabs styling)
const FilterTabs: React.FC<FilterTabsProps> = ({ value, onChange }) => {
  const { accentColorWithHash, accentColorRgba } = useThemeColor();
  const tabs: { key: FilterOption; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'historical', label: 'Historical' },
    { key: 'all', label: 'All' },
  ];

  return (
    <Flex
      role="tablist"
      aria-label="Filter selector"
      bg="bg-surface"
      border="1px solid"
      borderColor="border-primary"
      borderRadius="full"
      p="6px"
      w="fit-content"
      boxShadow="shadow-md"
      position="relative"
      gap={2}
    >
      {tabs.map((t) => {
        const isActive = value === t.key;
        return (
          <Button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            variant="ghost"
            onClick={() => !isActive && onChange(t.key)}
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

export default FilterTabs;
