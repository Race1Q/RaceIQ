import React from 'react';
import { Box, Heading, Text, HStack, IconButton, VStack } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backTo = '/dashboard',
  rightContent
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backTo);
  };

  return (
    <Box 
      bg="bg-surface-raised" 
      p={{ base: 'md', md: 'lg' }}
      borderBottom="1px solid"
      borderColor="border-subtle"
    >
      <HStack justify="space-between" align="start" flexWrap={{ base: 'wrap', md: 'nowrap' }} spacing={{ base: 4, md: 0 }}>
        <HStack spacing={4} align="start" flex="1" minW={0}>
          {showBackButton && (
            <IconButton
              aria-label="Go back"
              icon={<ArrowLeft size={18} />}
              onClick={handleBack}
              variant="ghost"
              size="sm"
              flexShrink={0}
            />
          )}
          
          <VStack align="flex-start" spacing={1} flex="1" minW={0}>
            <Heading 
              color="text-primary" 
              size={{ base: 'lg', md: 'xl' }} 
              fontFamily="heading"
              noOfLines={2}
            >
              {title}
            </Heading>
            {subtitle && (
              <Text 
                color="text-secondary"
                fontSize={{ base: 'sm', md: 'md' }}
                noOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </VStack>
        </HStack>
        
        {rightContent && (
          <Box flexShrink={0}>
            {rightContent}
          </Box>
        )}
      </HStack>
    </Box>
  );
};

export default PageHeader;
