// frontend/src/components/RaceThemedDivider/RaceThemedDivider.tsx

import React from 'react';
import { Box } from '@chakra-ui/react';
import styles from './RaceThemedDivider.module.css';

const RaceThemedDivider: React.FC = () => {
  return <Box as="hr" className={styles.divider} />;
};

export default RaceThemedDivider;
