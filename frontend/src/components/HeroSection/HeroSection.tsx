import React from 'react';
import { Box, VStack, Heading, Text, Container } from '@chakra-ui/react';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  disableOverlay?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle, 
  backgroundImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/88/Sebastian_Vettel_Red_Bull_Racing_2013_Silverstone_F1_Test_009.jpg',
  backgroundColor,
  disableOverlay = false
}) => {
  return (
    <Box
      className={styles.heroSection}
      style={{
        backgroundImage: backgroundColor ? 'none' : `url(${backgroundImageUrl})`,
        backgroundColor: backgroundColor || undefined,
      }}
    >
      <Box className={styles.heroOverlay} style={{ background: disableOverlay ? 'none' : undefined }}>
        <Container maxWidth="1200px" className={styles.heroContent}>
          <VStack spacing={8} textAlign="center">
            <Heading className={styles.heroTitle}>
              {title}
            </Heading>
            <Text className={styles.heroSubtitle}>
              {subtitle}
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroSection;
