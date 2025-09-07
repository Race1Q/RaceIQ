// src/components/CheckeredDivider/CheckeredDivider.tsx
import React from 'react';
import { Box, Flex, Text, useTheme } from '@chakra-ui/react';
import styles from './CheckeredDivider.module.css'; // Import the CSS Module

interface CheckeredDividerProps {
  children?: React.ReactNode;
}

const CheckeredDivider: React.FC<CheckeredDividerProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Flex
      w="100%"
      align="center"
      justify="center"
      gap={{ base: 4, md: 6 }}
      my={{ base: 8, md: 12 }} // Add vertical margin for spacing
    >
      <Box flex="1" className={styles.checkeredBorder} />

      {children && (
        <Text
          as="span"
          px={{ base: 2, md: 4 }}
          fontSize={{ base: 'md', md: 'xl' }}
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wider"
          color="text-primary"
          whiteSpace="nowrap"
        >
          {children}
        </Text>
      )}

      <Box flex="1" className={styles.checkeredBorder} />
    </Flex>
  );
};

export default CheckeredDivider;
