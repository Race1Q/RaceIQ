// src/components/HeroCanvas/HeroCanvas.tsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CarModel } from './CarModel';

const HeroCanvas = () => {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
      {/* Suspense is required to show a fallback while the model loads */}
      <Suspense fallback={null}>
        {/* Add some basic lighting so the model isn't black */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={3} />

        <CarModel scale={1.5} />
        
        {/* OrbitControls allows you to rotate the model with the mouse for testing */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Suspense>
    </Canvas>
  );
};

export default HeroCanvas;