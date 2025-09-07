// src/components/DebugCanvas/DebugCanvas.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

function SpinningCube() {
  const meshRef = useRef<Mesh>(null!);

  // This hook runs on every frame, creating the animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="tomato" />
    </mesh>
  );
}

export function DebugCanvas() {
  return (
    <Canvas>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <SpinningCube />
    </Canvas>
  );
}
