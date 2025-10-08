// In frontend/src/components/F1LoadingSpinner/F1LoadingSpinner.tsx
import React, { useState } from 'react';
import { VStack, Heading, Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useThemeColor } from '../../context/ThemeColorContext';
import { getLogoFilter } from '../../lib/colorUtils';
import styles from './F1LoadingSpinner.module.css';

interface F1LoadingSpinnerProps {
  text: string;
}


const F1LoadingSpinner: React.FC<F1LoadingSpinnerProps> = ({ text }) => {
  const { accentColorWithHash } = useThemeColor();
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const markings = [-135, -90, -45, 0, 45, 90, 135];
  const numbers = [0, 50, 100, 150, 200, 250, 300];

  const handleAnimationUpdate = (latest: { rotate: number }) => {
    if (typeof latest.rotate !== 'number') return;
    const angle = latest.rotate;
    const speed = Math.round(((angle + 135) / 270) * 300);
    setCurrentSpeed(speed);
  };

  return (
    <VStack w="100%" h="100vh" justify="center" bg="bg-primary" spacing={10}>
      <Heading 
        as="h2" 
        fontFamily="heading" 
        className={styles.loadingText}
        color={accentColorWithHash}
        borderColor={accentColorWithHash}
        bg={`${accentColorWithHash}10`}
        textShadow={`0 0 10px ${accentColorWithHash}80`}
        boxShadow={`0 0 20px ${accentColorWithHash}40, inset 0 0 20px ${accentColorWithHash}20`}
        sx={{
          '@keyframes loading-pulse': {
            '0%, 100%': { 
              boxShadow: `0 0 20px ${accentColorWithHash}40, inset 0 0 20px ${accentColorWithHash}20` 
            },
            '50%': { 
              boxShadow: `0 0 30px ${accentColorWithHash}60, inset 0 0 30px ${accentColorWithHash}30` 
            }
          },
          animation: 'loading-pulse 2s ease-in-out infinite'
        }}
      >
        {text}
      </Heading>

      <Box className={styles.speedometer}>
        {/* Outer ring around numbers */}
        <Box className={styles.outerRing} />
        {/* Animated Background Arc */}
        <motion.svg className={styles.arcSvg} viewBox="0 0 220 220">
          <motion.path
            className={styles.arcPath}
            style={{ stroke: accentColorWithHash }}
            d="M 110 35
               A 75 75 0 1 1 110 185
               A 75 75 0 1 1 110 35" // full circle slightly larger to sit between dial and outer ring
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 0.75 }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
        </motion.svg>

        {/* Static Dial Markings and Numbers */}
        <Box className={styles.dial}>
          {markings.map((angle, i) => (
            <Box
              key={`mark-${i}`}
              className={`${styles.marking} ${[0, 3, 6].includes(i) ? styles.major : ''}`}
              style={{ 
                transform: `rotate(${angle}deg)`,
                backgroundColor: [0, 3, 6].includes(i) ? accentColorWithHash : undefined
              }}
            />
          ))}
          {numbers.map((num, i) => (
            <Box 
              key={`num-${i}`} 
              className={styles.number} 
              style={{ 
                transform: `rotate(${markings[i]}deg) translateY(-118px) rotate(${-markings[i]}deg)`,
                color: accentColorWithHash
              }}
            >
              {num}
            </Box>
          ))}
        </Box>

        {/* The Logo */}
        <Box 
          className={styles.logo}
          style={{
            background: `url('/race_IQ_logo.svg') no-repeat center center`,
            backgroundSize: 'contain',
            filter: getLogoFilter(accentColorWithHash),
          }}
        />

        {/* The Digital Display */}
        <Box className={styles.digitalDisplay}>
          <Text
            fontFamily="monospace"
            fontSize="lg"
            fontWeight="bold"
            color={currentSpeed > 200 ? accentColorWithHash : 'gray.300'}
            transition="color 0.2s"
          >
            {currentSpeed}
          </Text>
        </Box>
        
        {/* Animated Needle */}
        <motion.div
          className={styles.needle}
          style={{ 
            background: `linear-gradient(to top, ${accentColorWithHash} 0%, ${accentColorWithHash}aa 100%)`,
            boxShadow: `0 0 8px ${accentColorWithHash}cc`
          }}
          initial={{ rotate: -135 }}
          animate={{ rotate: [-135, 135] }}
          onUpdate={handleAnimationUpdate}
          transition={{
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <Box 
          className={styles.needlePivot} 
          style={{ 
            backgroundColor: accentColorWithHash,
            boxShadow: `0 0 10px ${accentColorWithHash}cc`
          }} 
        />
      </Box>
    </VStack>
  );
};

export default F1LoadingSpinner;