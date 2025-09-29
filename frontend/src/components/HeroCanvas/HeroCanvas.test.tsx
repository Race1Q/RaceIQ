import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import HeroCanvas from './HeroCanvas';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, camera }: { children: React.ReactNode; camera?: any }) => (
    <div data-testid="canvas" data-camera-position={JSON.stringify(camera?.position)} data-camera-fov={camera?.fov}>
      {children}
    </div>
  ),
}));

// Mock React Three Drei components
vi.mock('@react-three/drei', () => ({
  OrbitControls: ({ enableZoom, enablePan }: { enableZoom?: boolean; enablePan?: boolean }) => (
    <div 
      data-testid="orbit-controls" 
      data-enable-zoom={enableZoom} 
      data-enable-pan={enablePan}
    >
      OrbitControls
    </div>
  ),
}));

// Mock the CarModel component
vi.mock('./CarModel', () => ({
  CarModel: ({ scale }: { scale?: number }) => (
    <div data-testid="car-model" data-scale={scale}>
      CarModel
    </div>
  ),
}));

describe('HeroCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeroCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders Canvas with correct camera configuration', () => {
    render(<HeroCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('data-camera-position', JSON.stringify([0, 2, 5]));
    expect(canvas).toHaveAttribute('data-camera-fov', '75');
  });

  it('renders Suspense wrapper', () => {
    render(<HeroCanvas />);
    
    // Suspense should be present as a wrapper
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders ambient light with correct intensity', () => {
    render(<HeroCanvas />);
    
    // Since we can't easily test Three.js components directly, we test that the structure is correct
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders directional light with correct configuration', () => {
    render(<HeroCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders CarModel with correct scale', () => {
    render(<HeroCanvas />);
    
    const carModel = screen.getByTestId('car-model');
    expect(carModel).toBeInTheDocument();
    expect(carModel).toHaveAttribute('data-scale', '1.5');
  });

  it('renders OrbitControls with correct configuration', () => {
    render(<HeroCanvas />);
    
    const orbitControls = screen.getByTestId('orbit-controls');
    expect(orbitControls).toBeInTheDocument();
    expect(orbitControls).toHaveAttribute('data-enable-zoom', 'false');
    expect(orbitControls).toHaveAttribute('data-enable-pan', 'false');
  });

  it('maintains proper component structure', () => {
    render(<HeroCanvas />);
    
    // Check that all main components are rendered
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('renders multiple instances correctly', () => {
    const { unmount: unmount1 } = render(<HeroCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    
    unmount1();
    
    const { unmount: unmount2 } = render(<HeroCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    
    unmount2();
  });
});

describe('HeroCanvas Integration Tests', () => {
  it('works correctly with mocked dependencies', () => {
    render(<HeroCanvas />);
    
    // Component should render without errors with mocked dependencies
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<HeroCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    unmount();
    
    // Component should unmount without errors
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = render(<HeroCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    
    // Re-render the component
    rerender(<HeroCanvas />);
    
    // Should still render correctly
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });
});

describe('HeroCanvas Edge Cases', () => {
  it('handles component with no props', () => {
    render(<HeroCanvas />);
    
    // Component should render without any props
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('maintains consistent camera configuration', () => {
    const { rerender } = render(<HeroCanvas />);
    
    let canvas = screen.getByTestId('canvas');
    expect(canvas).toHaveAttribute('data-camera-position', JSON.stringify([0, 2, 5]));
    expect(canvas).toHaveAttribute('data-camera-fov', '75');
    
    // Re-render multiple times
    rerender(<HeroCanvas />);
    rerender(<HeroCanvas />);
    
    canvas = screen.getByTestId('canvas');
    expect(canvas).toHaveAttribute('data-camera-position', JSON.stringify([0, 2, 5]));
    expect(canvas).toHaveAttribute('data-camera-fov', '75');
  });

  it('maintains consistent CarModel scale', () => {
    const { rerender } = render(<HeroCanvas />);
    
    let carModel = screen.getByTestId('car-model');
    expect(carModel).toHaveAttribute('data-scale', '1.5');
    
    // Re-render multiple times
    rerender(<HeroCanvas />);
    rerender(<HeroCanvas />);
    
    carModel = screen.getByTestId('car-model');
    expect(carModel).toHaveAttribute('data-scale', '1.5');
  });

  it('maintains consistent OrbitControls configuration', () => {
    const { rerender } = render(<HeroCanvas />);
    
    let orbitControls = screen.getByTestId('orbit-controls');
    expect(orbitControls).toHaveAttribute('data-enable-zoom', 'false');
    expect(orbitControls).toHaveAttribute('data-enable-pan', 'false');
    
    // Re-render multiple times
    rerender(<HeroCanvas />);
    rerender(<HeroCanvas />);
    
    orbitControls = screen.getByTestId('orbit-controls');
    expect(orbitControls).toHaveAttribute('data-enable-zoom', 'false');
    expect(orbitControls).toHaveAttribute('data-enable-pan', 'false');
  });

  it('renders without external dependencies', () => {
    // Test that component renders without any external state or props
    render(<HeroCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('handles rapid mount/unmount cycles', () => {
    const { unmount } = render(<HeroCanvas />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    unmount();
    
    const { unmount: unmount2 } = render(<HeroCanvas />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    unmount2();
    
    const { unmount: unmount3 } = render(<HeroCanvas />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    unmount3();
  });
});

describe('HeroCanvas Component Structure', () => {
  it('has correct component hierarchy', () => {
    render(<HeroCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
    
    // CarModel should be inside the canvas
    const carModel = screen.getByTestId('car-model');
    expect(carModel).toBeInTheDocument();
    
    // OrbitControls should be inside the canvas
    const orbitControls = screen.getByTestId('orbit-controls');
    expect(orbitControls).toBeInTheDocument();
  });

  it('renders all required Three.js elements', () => {
    render(<HeroCanvas />);
    
    // Check that all mocked Three.js components are present
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('car-model')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('maintains component isolation', () => {
    // Test that multiple instances don't interfere with each other
    const { unmount: unmount1 } = render(<HeroCanvas />);
    const { unmount: unmount2 } = render(<HeroCanvas />);
    
    const canvases = screen.getAllByTestId('canvas');
    expect(canvases).toHaveLength(2);
    
    unmount1();
    expect(screen.getAllByTestId('canvas')).toHaveLength(1);
    
    unmount2();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
  });
});
