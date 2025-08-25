import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { User } from 'lucide-react';
import styles from './TeamMemberCard.module.css';

interface TeamMemberCardProps {
  name: string;
  role: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ name, role }) => {
  return (
    <Box className={styles.card}>
      <VStack spacing={3}>
        <Box className={styles.avatar}>
          <User size={32} />
        </Box>
        <Text className={styles.name}>{name}</Text>
        <Text className={styles.role}>{role}</Text>
      </VStack>
    </Box>
  );
};

export default TeamMemberCard;
