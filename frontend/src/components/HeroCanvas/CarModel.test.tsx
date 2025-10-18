import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';

// Mock react-three components
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    useFrame: vi.fn((callback) => {
      // Simulate one frame
      callback({ clock: { getElapsedTime: () => 0 } }, 0.016);
    }),
  };
});

vi.mock('@react-three/drei', () => {
  const mockUseGLTF = vi.fn(() => ({
    scene: {
      clone: () => ({
        traverse: vi.fn(),
      }),
    },
  }));
  mockUseGLTF.preload = vi.fn();
  
  return {
    useGLTF: mockUseGLTF,
  };
});

// Import after mocks are set up
import CarModel from './CarModel';

describe('CarModel', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Canvas>
        <CarModel />
      </Canvas>
    );
    expect(container).toBeInTheDocument();
  });

  it('accepts teamColor prop', () => {
    const { container } = render(
      <Canvas>
        <CarModel teamColor="#FF0000" />
      </Canvas>
    );
    expect(container).toBeInTheDocument();
  });

  it('handles missing teamColor prop', () => {
    const { container } = render(
      <Canvas>
        <CarModel />
      </Canvas>
    );
    expect(container).toBeInTheDocument();
  });
});

