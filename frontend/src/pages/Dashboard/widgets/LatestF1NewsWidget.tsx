import { Heading, Text, VStack, HStack, Icon, Skeleton, Link, Alert, AlertIcon } from '@chakra-ui/react';
import { Newspaper, ExternalLink } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { useAiNews } from '../../../hooks/useAiNews';
import GeminiBadge from '../../../components/GeminiBadge/GeminiBadge';

function LatestF1NewsWidget() {
  const { accentColorWithHash } = useThemeColor();
  const { data, loading, error } = useAiNews('f1');

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
            <HStack justify="space-between" w="full">
              <Heading color={accentColorWithHash} size="md" fontFamily="heading">
                Latest F1 News
              </Heading>
              {data && !data.isFallback && <GeminiBadge />}
            </HStack>
        
        {loading && (
          <VStack align="stretch" spacing="sm" w="full">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="60px" borderRadius="md" />
            ))}
          </VStack>
        )}

        {error && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">Unable to load latest news. Please try again later.</Text>
          </Alert>
        )}

        {data && (
          <>
            {data.summary && (
              <Text color="text-primary" fontSize="sm" lineHeight="1.6">
                {data.summary}
              </Text>
            )}

            <VStack align="stretch" spacing="sm" w="full">
              {data.bullets.map((bullet, index) => (
                <HStack
                  key={index}
                  spacing="md"
                  align="start"
                  p="sm"
                  borderRadius="md"
                  bg="whiteAlpha.50"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  transition="background-color 0.2s ease"
                >
                  <Icon as={Newspaper} boxSize={4} color={accentColorWithHash} flexShrink={0} mt="1px" />
                  
                  <VStack align="start" spacing="xs" flex="1">
                    <Text color="text-primary" fontSize="sm" fontWeight="500" lineHeight="1.4">
                      {bullet}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>

            {data.citations && data.citations.length > 0 && (
              <VStack align="start" spacing="xs" w="full" pt="sm" borderTop="1px solid" borderColor="whiteAlpha.200">
                <Text color="text-muted" fontSize="xs" fontWeight="600">
                  Sources:
                </Text>
                <HStack spacing="sm" flexWrap="wrap">
                  {data.citations.map((cite, index) => (
                    <Link
                      key={index}
                      href={cite.url}
                      isExternal
                      fontSize="xs"
                      color={accentColorWithHash}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {cite.source}
                      <Icon as={ExternalLink} boxSize={3} />
                    </Link>
                  ))}
                </HStack>
              </VStack>
            )}

            <Text color="text-muted" fontSize="xs" pt="xs">
              Last updated: {formatTime(data.generatedAt)}
            </Text>
          </>
        )}
      </VStack>
    </WidgetCard>
  );
}

export default LatestF1NewsWidget;
