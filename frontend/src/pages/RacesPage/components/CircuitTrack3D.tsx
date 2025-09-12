// src/pages/RacesPage/components/CircuitTrack3D.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { CatmullRomCurve3, Vector3, EllipseCurve, BufferGeometry, Float32BufferAttribute } from 'three';
import { Line, Html } from '@react-three/drei';
import { Box, Text, VStack, Code, useToken } from '@chakra-ui/react';
import { circuitFileMap } from './circuitFileMap';

// --- All helper functions (extractXY, isLatLon, etc.) remain unchanged ---
// (Helper functions are omitted here for brevity but should be kept in your file)

/* -------------------------------- component -------------------------------- */

export const CircuitTrack3D: React.FC<Props> = ({ circuitId, circuitName, onStatusChange }) => {
  const [coords, setCoords] = useState<Vector3[] | null>(null);
  const [attemptedFiles, setAttemptedFiles] = useState<string[]>([]);
  
  // Use Chakra's hook to get theme token values for Three.js
  const [brandRed, borderPrimary] = useToken('colors', ['brand.red', 'border-primary']);

  // --- The useEffect hook for loading geometry remains unchanged ---
  // (useEffect logic is omitted here for brevity but should be kept in your file)

  const linePoints = useMemo(() => {
    if (!coords || coords.length < 2) return null;
    const closed = true;
    const curve = new CatmullRomCurve3(coords, closed, 'catmullrom', 0.05);
    const samples = Math.min(1000, Math.max(100, Math.floor(coords.length * 4)));
    return curve.getPoints(samples);
  }, [coords]);

  // If track data is missing, render a theme-aware fallback message
  if (!linePoints) {
    const ellipse = new EllipseCurve(0, 0, 20, 12, 0, Math.PI * 2, false, 0);
    const points2d = ellipse.getPoints(200);
    const positions: number[] = [];
    points2d.forEach((p) => positions.push(p.x, 0, p.y));
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    return (
      <>
        <line>
          <primitive object={geometry} attach="geometry" />
          <lineBasicMaterial color={borderPrimary} linewidth={1} />
        </line>
        <Html center style={{ pointerEvents: 'none' }}>
          {/* Replaced inline-styled div with Chakra components */}
          <VStack
            bg="rgba(15, 15, 15, 0.8)" // Using a specific dark, semi-transparent bg
            _light={{ bg: 'rgba(240, 242, 245, 0.8)' }} // Light mode equivalent
            color="text-primary"
            p={4}
            borderRadius="md"
            fontSize="xs"
            maxW="420px"
            textAlign="center"
            spacing={2}
          >
            <Text fontWeight="bold">Track data missing for {circuitName || `circuit#${circuitId}`}</Text>
            <Text>Looked for (in order):</Text>
            <VStack spacing={0} opacity={0.9}>
              {attemptedFiles.map((f, i) => (
                <Code key={`${f}-${i}`} variant="subtle" fontSize="2xs">
                  {f.replace('/circuits/', '')}
                </Code>
              ))}
            </VStack>
            <Text mt={2} opacity={0.9}>
              Ensure files are in <Code fontSize="2xs">/public/circuits/</Code> and are accessible.
            </Text>
          </VStack>
        </Html>
      </>
    );
  }

  // Render the actual track line with a theme color
  return <Line points={linePoints} color={brandRed} lineWidth={2} />;
};

export default CircuitTrack3D;