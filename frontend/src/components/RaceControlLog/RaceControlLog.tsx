import React from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { MessageSquare } from 'lucide-react';
import type { RaceControlMessage } from '../../data/types';
import styles from './RaceControlLog.module.css';

interface RaceControlLogProps {
  messages: RaceControlMessage[];
}

const RaceControlLog: React.FC<RaceControlLogProps> = ({ messages }) => {
  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Race Control</Text>
      
      <Box className={styles.messagesContainer}>
        <VStack className={styles.messagesList} spacing={0}>
          {messages.map((message, index) => (
            <Box key={index} className={styles.messageItem}>
              <HStack className={styles.messageContent}>
                <Box className={styles.lapNumber}>
                  <Text className={styles.lapText}>L{message.lap}</Text>
                </Box>
                <Text className={styles.messageText}>{message.message}</Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default RaceControlLog;
