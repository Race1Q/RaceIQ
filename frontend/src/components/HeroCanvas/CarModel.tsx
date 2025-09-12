// frontend/src/components/HeroCanvas/CarModel.tsx

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export function CarModel(props: any) {
  const modelRef = useRef();

  // 1. Call the useGLTF hook directly at the top level.
  //    If it's loading, it will automatically trigger the <Suspense> fallback in the parent.
  const { scene } = useGLTF('/assets/3d/f1_car_concept.glb');

  // 2. The primitive object displays the loaded scene.
  //    We attach a ref to it so GSAP can animate it later.
  return <primitive ref={modelRef} object={scene} {...props} />;
}

// 3. The preload call should also be at the top level.
useGLTF.preload('/assets/3d/f1_car_concept.glb');
