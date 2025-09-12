// frontend/src/components/F1LoadingSpinner/F1LoadingSpinner.tsx

import React from 'react';
import { VStack, Heading, Box } from '@chakra-ui/react';
import styles from './F1LoadingSpinner.module.css';

interface F1LoadingSpinnerProps {
  text: string;
}

const F1LoadingSpinner: React.FC<F1LoadingSpinnerProps> = ({ text }) => {
  return (
    // Use VStack for simple centering and background color from theme
    <VStack w="100%" h="100vh" justify="center" bg="bg-primary">
      {/* Use Heading for semantics, but keep the className for complex styles */}
      <Heading
        as="h2"
        fontFamily="heading"
        className={styles.loadingText}
      >
        {text}
      </Heading>

      {/* The speedometer's complex structure remains, styled by the CSS module */}
      <Box className={styles.speedometer}>
        <Box className={styles.speedometerDial}>
          <Box className={styles.speedometerNeedle}></Box>
          <Box className={styles.speedometerMarkings}>
            <Box className={`${styles.speedometerMarking} ${styles.major}`}></Box>
            <Box className={styles.speedometerMarking}></Box>
            <Box className={styles.speedometerMarking}></Box>
            <Box className={`${styles.speedometerMarking} ${styles.major}`}></Box>
            <Box className={styles.speedometerMarking}></Box>
            <Box className={styles.speedometerMarking}></Box>
            <Box className={`${styles.speedometerMarking} ${styles.major}`}></Box>
          </Box>
          <Box className={styles.speedometerNumbers}>
            <Box className={styles.speedometerNumber}>0</Box>
            <Box className={styles.speedometerNumber}>50</Box>
            <Box className={styles.speedometerNumber}>100</Box>
            <Box className={styles.speedometerNumber}>150</Box>
            <Box className={styles.speedometerNumber}>200</Box>
            <Box className={styles.speedometerNumber}>250</Box>
            <Box className={styles.speedometerNumber}>300</Box>
          </Box>
        </Box>
      </Box>
    </VStack>
  );
};

export default F1LoadingSpinner;