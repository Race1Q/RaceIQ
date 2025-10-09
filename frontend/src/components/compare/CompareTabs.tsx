// frontend/src/components/Compare/CompareTabs.tsx
import { Box, HStack, Link, Text, useColorModeValue } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

interface CompareTabsProps {
  active: 'drivers' | 'constructors';
}

const CompareTabs: React.FC<CompareTabsProps> = ({ active }) => {
  const location = useLocation();
  
  const tabs = [
    { key: 'drivers', label: 'Drivers', path: '/compare' },
    { key: 'constructors', label: 'Constructors', path: '/compare/constructors' },
  ];

  const activeColor = useColorModeValue('red.500', 'red.400');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const hoverColor = useColorModeValue('red.600', 'red.300');

  return (
    <Box mb={6}>
      <HStack spacing={0} borderBottom="1px solid" borderColor="border-subtle">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.path}
              _hover={{ textDecoration: 'none' }}
              flex="1"
            >
              <Box
                px={6}
                py={3}
                textAlign="center"
                borderBottom="2px solid"
                borderBottomColor={isActive ? activeColor : 'transparent'}
                color={isActive ? activeColor : inactiveColor}
                fontWeight={isActive ? 'bold' : 'medium'}
                transition="all 0.2s ease"
                _hover={{
                  color: isActive ? activeColor : hoverColor,
                  borderBottomColor: isActive ? activeColor : hoverColor,
                }}
              >
                <Text fontSize="md" fontFamily="heading">
                  {tab.label}
                </Text>
              </Box>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
};

export default CompareTabs;
