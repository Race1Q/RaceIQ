import React from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import { ArrowUpRight } from 'lucide-react';
import styles from './FeaturedDriverCard.module.css';

interface FeaturedDriverCardProps {
  title: string;
  driverName: string;
  teamName: string;
  points: number;
  imageUrl: string;
  accentColor: string;
}

const FeaturedDriverCard: React.FC<FeaturedDriverCardProps> = ({
  title,
  driverName,
  teamName,
  points,
  imageUrl,
  accentColor,
}) => {
  return (
    <Box
      className={styles.card}
      position="relative"
      overflow="hidden"
      backgroundColor={accentColor}
      borderRadius="var(--border-radius-lg)"
      padding="var(--space-lg)"
      height="200px"
    >
      {/* Text Content */}
      <VStack
        className={styles.textContent}
        align="flex-start"
        spacing="var(--space-sm)"
        height="100%"
        justify="space-between"
      >
        <Text className={styles.title}>{title}</Text>
        
        <VStack align="flex-start" spacing="var(--space-xs)">
          <Heading className={styles.driverName}>{driverName}</Heading>
          <Text className={styles.teamName}>{teamName}</Text>
        </VStack>
        
        <Text className={styles.points}>{points}Pts</Text>
      </VStack>

      {/* Driver Image */}
      <img
        src={imageUrl}
        alt={driverName}
        className={styles.driverImage}
      />

      {/* Icon Button */}
      <Box className={styles.iconButton}>
        <ArrowUpRight size={16} color="white" />
      </Box>
    </Box>
  );
};

export default FeaturedDriverCard;
