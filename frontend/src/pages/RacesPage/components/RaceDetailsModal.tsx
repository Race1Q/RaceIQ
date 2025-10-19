// src/pages/RacesPage/components/RaceDetailsModal.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { Box, Flex, IconButton, Text, VStack, HStack, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Race } from '../../../types/races';
import { X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import CircuitTrack3D from './CircuitTrack3D';
import { apiFetch } from '../../../lib/api';
// --- ML FEATURE DISABLED ---
// import PredictionsTab from './PredictionsTab';

interface Props {
  raceId: number;
  onClose: () => void;
}

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

const MotionBox = motion.create(Box);

const RaceDetailsModal: React.FC<Props> = ({ raceId, onClose }) => {
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [circuitName, setCircuitName] = useState<string>('');
  const [circuitLoading, setCircuitLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiFetch<Race>(`/api/races/${raceId}`)
      .then((data) => { if (isMounted) setRace(data); })
      .catch(() => { if (isMounted) setRace(null); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => {
      isMounted = false;
    };
  }, [raceId]);

  useEffect(() => {
    let isMounted = true;
    if (!race) return;
    setCircuitLoading(true);
    apiFetch<{ name: string }>(`/api/circuits/id/${race.circuit_id}`)
      .then((c) => { if (isMounted && c) setCircuitName(c.name); })
      .catch(() => {})
      .finally(() => { if (isMounted) setCircuitLoading(false); });
    return () => {
      isMounted = false;
    };
  }, [race]);

  return (
    <Flex position="fixed" inset={0} bg="rgba(0,0,0,0.5)" align="center" justify="center" zIndex={1000}>
      <MotionBox
        bg="bg-elevated"
        borderRadius="lg"
        border="1px solid"
        borderColor="border-subtle"
        w={{ base: '95%', md: '90%', lg: '80%' }}
        maxH="90vh"
        overflow="hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Flex justify="space-between" align="center" p={3} borderBottom="1px solid" borderColor="border-subtle">
          <Text fontWeight="bold" fontSize="lg" color="text-primary">{race?.name ?? 'Race Details'}</Text>
          <IconButton aria-label="Close" onClick={onClose} icon={<X size={18} />} variant="ghost" />
        </Flex>
        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>Details</Tab>
            {/* --- ML FEATURE DISABLED --- */}
            {/* <Tab>Predictions</Tab> */}
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <Box h={{ base: '260px', md: '360px' }} bg="#0b0b0b" position="relative">
                <Suspense fallback={<Flex h="100%" align="center" justify="center"><Spinner /></Flex>}>
                  <Canvas camera={{ position: [0, 20, 40], fov: 40 }}>
                    {race ? (
                      <CircuitTrack3D
                        circuitId={race.circuit_id}
                        circuitName={circuitName}
                        onStatusChange={(_s) => {
                          // no-op: hook for future in-UI indicators
                        }}
                      />
                    ) : (
                      <PlaceholderCircuit />
                    )}
                    <Environment preset="city" />
                  </Canvas>
                </Suspense>
              </Box>
              <VStack p={4} align="start" spacing={3}>
                {loading ? (
                  <Spinner />
                ) : race ? (
                  <>
                    <HStack>
                      <Text fontWeight="bold">Date:</Text>
                      <Text>{new Date(race.date).toLocaleDateString()}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold">Circuit:</Text>
                      <Text>{circuitLoading ? <Spinner size="xs" /> : circuitName}</Text>
                    </HStack>
                  </>
                ) : (
                  <Text>Race details not found.</Text>
                )}
              </VStack>
            </TabPanel>
            {/* --- ML FEATURE DISABLED --- */}
            {/* <TabPanel>
              {raceId && <PredictionsTab raceId={raceId} />}
            </TabPanel> */}
          </TabPanels>
        </Tabs>
      </MotionBox>
    </Flex>
  );
};

export default RaceDetailsModal;


