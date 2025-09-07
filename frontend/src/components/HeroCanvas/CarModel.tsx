// src/components/HeroCanvas/CarModel.tsx
import { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export function CarModel(props: any) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef();

  try {
    // This hook loads the 3D model from your specified path
    const { scene } = useGLTF('/assets/3d/f1_car_concept.glb');
    
    useEffect(() => {
      if (scene) {
        setModelLoaded(true);
      }
    }, [scene]);

    // The 'primitive' object displays the loaded scene.
    // We attach a ref to it so GSAP can animate it later.
    return <primitive ref={modelRef} object={scene} {...props} />;
  } catch (error) {
    console.error('Failed to load 3D model:', error);
    // Fallback to a simple box if model fails to load
    return (
      <mesh {...props}>
        <boxGeometry args={[2, 0.5, 4]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
}

// Preload the model for better performance
try {
  useGLTF.preload('/assets/3d/f1_car_concept.glb');
} catch (error) {
  console.warn('Failed to preload 3D model:', error);
}
