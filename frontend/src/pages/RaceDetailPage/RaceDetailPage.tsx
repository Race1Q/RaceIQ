import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex, IconButton, Text, VStack, HStack, Spinner, Container } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '../../services/f1Api';
import type { RaceDto } from '../../services/f1Api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CircuitTrack3D from '../RacesPage/components/CircuitTrack3D';

const MotionBox = motion.create(Box);

const PlaceholderCircuit: React.FC = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[50, 50, 1, 64]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[20, 0.6, 16, 200]} />
        <meshStandardMaterial color="#d22" />
      </mesh>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
    </group>
  );
};

const RaceDetailPage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const [race, setRace] = useState<RaceDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [circuitName, setCircuitName] = useState<string>('');
  const [circuitLoading, setCircuitLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!raceId) {
      navigate('/races');
      return;
    }

    let isMounted = true;
    setLoading(true);
    apiClient
      .getRaceById(parseInt(raceId))
      .then((data) => {
        if (isMounted) setRace(data);
      })
      .catch(() => {
        if (isMounted) navigate('/races');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [raceId, navigate]);

  useEffect(() => {
    let isMounted = true;
    if (!race) return;
    setCircuitLoading(true);
    apiClient
      .getCircuitById(race.circuit_id)
      .then((c) => {
        if (isMounted && c) setCircuitName(c.name);
      })
      .finally(() => {
        if (isMounted) setCircuitLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [race]);

  if (loading) {
    return (
      <Box bg="bg-primary" minH="100vh">
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Flex align="center" justify="center" minH="50vh">
            <Spinner size="xl" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (!race) {
    return (
      <Box bg="bg-primary" minH="100vh">
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Flex direction="column" align="center" justify="center" minH="50vh" gap={4}>
            <Text fontSize="xl" color="text-primary">Race not found</Text>
            <IconButton
              aria-label="Go back"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate('/races')}
            >
              Back to Races
            </IconButton>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="bg-primary" minH="100vh">
      <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        {/* Header */}
        <Flex align="center" gap={4} mb={8}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/races')}
            variant="ghost"
          />
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="text-primary">
              {race.name}
            </Text>
            <Text fontSize="md" color="text-secondary">
              Round {race.round} • {new Date(race.date).toLocaleDateString()}
            </Text>
          </VStack>
        </Flex>

        {/* 3D Track Visualization */}
        <MotionBox
          bg="bg-elevated"
          borderRadius="lg"
          border="1px solid"
          borderColor="border-subtle"
          mb={8}
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box h={{ base: '300px', md: '400px' }} bg="#0b0b0b" position="relative">
            <Suspense fallback={<Flex h="100%" align="center" justify="center"><Spinner /></Flex>}>
              <Canvas camera={{ position: [0, 20, 40], fov: 40 }}>
                <CircuitTrack3D
                  circuitId={race.circuit_id}
                  circuitName={circuitName}
                  onStatusChange={(s) => {
                    // no-op: hook for future in-UI indicators
                  }}
                />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} />
                <OrbitControls enablePan enableZoom enableRotate />
                <Environment preset="warehouse" />
              </Canvas>
            </Suspense>
          </Box>
        </MotionBox>

        {/* Race Details */}
        <MotionBox
          bg="bg-elevated"
          borderRadius="lg"
          border="1px solid"
          borderColor="border-subtle"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VStack align="stretch" spacing={4}>
            <Text fontSize="xl" fontWeight="bold" color="text-primary" mb={4}>
              Race Information
            </Text>
            
            <HStack justify="space-between">
              <Text color="text-secondary">Round</Text>
              <Text color="text-primary" fontWeight="medium">{race.round}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text color="text-secondary">Date</Text>
              <Text color="text-primary" fontWeight="medium">
                {new Date(race.date).toLocaleString()}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text color="text-secondary">Circuit</Text>
              <Text color="text-primary" fontWeight="medium">
                {circuitLoading ? 'Loading…' : (circuitName || `Circuit #${race.circuit_id}`)}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text color="text-secondary">Season</Text>
              <Text color="text-primary" fontWeight="medium">{race.season_id}</Text>
            </HStack>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default RaceDetailPage;
