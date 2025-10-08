// frontend/src/components/loaders/SpeedometerMini.tsx
import { useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useThemeColor } from '../../context/ThemeColorContext';
import styles from '../F1LoadingSpinner/F1LoadingSpinner.module.css';

type Props = {
  size?: number; // visual size in px (container box)
  showDigits?: boolean;
  className?: string;
};

// Helper: compute hue-rotate to tint the center logo similar to main spinner
const getHueRotation = (hexColor: string): number => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) % 6;
    else if (max === g) h = (b - r) / (max - min) + 2;
    else h = (r - g) / (max - min) + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h; // relative to red already at 0deg for our logo
};

export default function SpeedometerMini({ size = 120, showDigits = true, className }: Props) {
  const { accentColorWithHash } = useThemeColor();
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const markings = [-135, -90, -45, 0, 45, 90, 135];
  const numbers = [0, 50, 100, 150, 200, 250, 300];

  const scale = size / 200; // base CSS is 200x200

  return (
    <Box position="relative" width={size} height={size} className={className}>
      <Box
        className={styles.speedometer}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}
      >
        <Box className={styles.outerRing} />
        <motion.svg className={styles.arcSvg} viewBox="0 0 220 220">
          <motion.path
            className={styles.arcPath}
            style={{ stroke: accentColorWithHash }}
            d="M 110 35 A 75 75 0 1 1 110 185 A 75 75 0 1 1 110 35"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 0.75 }}
            transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
        </motion.svg>

        <Box className={styles.dial}>
          {markings.map((angle, i) => (
            <Box
              key={`mark-${i}`}
              className={`${styles.marking} ${[0, 3, 6].includes(i) ? styles.major : ''}`}
              style={{ transform: `rotate(${angle}deg)`, backgroundColor: [0, 3, 6].includes(i) ? accentColorWithHash : undefined }}
            />
          ))}
          {numbers.map((num, i) => (
            <Box
              key={`num-${i}`}
              className={styles.number}
              style={{
                transform: `translate(-50%, -50%) rotate(${markings[i]}deg) translateY(-120px) rotate(${-markings[i]}deg)`,
                color: accentColorWithHash,
              }}
            >
              {num}
            </Box>
          ))}
        </Box>

        <Box
          className={styles.logo}
          style={{
            background: `url('/race_IQ_logo.svg') no-repeat center center`,
            backgroundSize: 'contain',
            filter: `brightness(0.8) hue-rotate(${getHueRotation(accentColorWithHash)}deg) saturate(1.5)`,
          }}
        />

        {showDigits && (
          <Box className={styles.digitalDisplay}>
            <Text fontFamily="monospace" fontSize="md" fontWeight="bold" color={accentColorWithHash}>
              {currentSpeed}
            </Text>
          </Box>
        )}

        <motion.div
          className={styles.needle}
          style={{ background: `linear-gradient(to top, ${accentColorWithHash} 0%, ${accentColorWithHash}aa 100%)`, boxShadow: `0 0 8px ${accentColorWithHash}cc` }}
          initial={{ rotate: -135 }}
          animate={{ rotate: [-135, 135] }}
          onUpdate={(latest: { rotate: number }) => {
            const angle = typeof latest.rotate === 'number' ? latest.rotate : -135;
            const spd = Math.round(((angle + 135) / 270) * 300);
            setCurrentSpeed(spd);
          }}
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />
        <Box className={styles.needlePivot} style={{ backgroundColor: accentColorWithHash, boxShadow: `0 0 10px ${accentColorWithHash}cc` }} />
      </Box>
    </Box>
  );
}
