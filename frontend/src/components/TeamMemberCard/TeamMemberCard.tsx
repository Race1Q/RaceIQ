// frontend/src/components/TeamMemberCard/TeamMemberCard.tsx

import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { User } from 'lucide-react';
import styles from './TeamMemberCard.module.css';
import { useThemeColor } from '../../context/ThemeColorContext';

interface TeamMemberCardProps {
  name: string;
  role: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ name, role }) => {
  const { accentColorWithHash } = useThemeColor();
  
  return (
    <Box 
      className={styles.card}
      sx={{
        '&:hover': {
          borderColor: accentColorWithHash,
        }
      }}
    >
      <VStack spacing={3}>
        <Box 
          className={styles.avatar}
          sx={{
            color: accentColorWithHash,
          }}
        >
          <User size={32} />
        </Box>
        <Text className={styles.name}>{name}</Text>
        <Text className={styles.role}>{role}</Text>
      </VStack>
    </Box>
  );
};

export default TeamMemberCard;
