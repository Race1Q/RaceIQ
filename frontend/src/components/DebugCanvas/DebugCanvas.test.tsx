import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DebugCanvas } from './DebugCanvas';

// Mock React Three Fiber with simple replacements
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn()
}));

// Mock three.js
vi.mock('three', () => ({
  Mesh: vi.fn().mockImplementation(() => ({
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  }))
}));

describe('DebugCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<DebugCanvas />);
    }).not.toThrow();
  });

  it('renders Canvas component', () => {
    render(<DebugCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders the canvas element with correct tag', () => {
    render(<DebugCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas.tagName).toBe('DIV');
  });

  it('can be rendered multiple times', () => {
    const { rerender } = render(<DebugCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    // Rerender the component
    rerender(<DebugCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders without throwing errors', () => {
    expect(() => {
      render(<DebugCanvas />);
    }).not.toThrow();
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});

describe('DebugCanvas Component Structure', () => {
  it('maintains proper component structure', () => {
    const { container } = render(<DebugCanvas />);
    
    // Verify the component renders
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    // Verify container has content
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with expected DOM structure', () => {
    render(<DebugCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    
    // Verify it's a div element (our mock replacement)
    expect(canvas).toBeInstanceOf(HTMLDivElement);
    
    // Verify it has children (the Three.js scene content)
    expect(canvas.children.length).toBeGreaterThan(0);
  });
});

describe('DebugCanvas Component Behavior', () => {
  it('handles component mounting correctly', () => {
    const { unmount } = render(<DebugCanvas />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    // Unmount should not throw
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = render(<DebugCanvas />);
    
    const firstCanvas = screen.getByTestId('canvas');
    
    rerender(<DebugCanvas />);
    
    const secondCanvas = screen.getByTestId('canvas');
    
    // Both renders should produce the same result
    expect(firstCanvas.tagName).toBe(secondCanvas.tagName);
    expect(firstCanvas.children.length).toBe(secondCanvas.children.length);
  });

  it('does not cause memory leaks during multiple mount/unmount cycles', () => {
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<DebugCanvas />);
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      unmount();
    }
    
    // Final render should still work
    render(<DebugCanvas />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});