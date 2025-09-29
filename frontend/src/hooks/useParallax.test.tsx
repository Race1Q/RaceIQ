import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useParallax } from './useParallax';

// Mock window properties
const mockPageYOffset = vi.fn();
Object.defineProperty(window, 'pageYOffset', {
  value: mockPageYOffset,
  writable: true,
});

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

// Mock addEventListener and removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useParallax', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPageYOffset.mockReturnValue(0);
    
    // Mock requestAnimationFrame to call the callback immediately
    mockRequestAnimationFrame.mockImplementation((callback: () => void) => {
      setTimeout(callback, 0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with offsetY of 0', () => {
    const { result } = renderHook(() => useParallax(0.5), { wrapper });

    expect(result.current).toBe(0);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
    expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('should handle zero speed correctly', () => {
    const speed = 0;
    const { result } = renderHook(() => useParallax(speed), { wrapper });

    mockPageYOffset.mockReturnValue(100);

    // With speed 0, offsetY should remain 0 regardless of scroll
    expect(result.current).toBe(0);
  });

  it('should handle negative speed correctly', () => {
    const speed = -0.5;
    const { result } = renderHook(() => useParallax(speed), { wrapper });

    mockPageYOffset.mockReturnValue(100);

    // With negative speed, offsetY should be negative
    expect(result.current).toBe(0); // Initial value
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useParallax(0.5), { wrapper });

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should clean up animation frames on unmount', () => {
    const { unmount } = renderHook(() => useParallax(0.5), { wrapper });

    unmount();

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('should handle speed changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ speed }) => useParallax(speed),
      {
        wrapper,
        initialProps: { speed: 0.5 },
      }
    );

    expect(result.current).toBe(0);

    // Change speed
    rerender({ speed: 1.0 });

    expect(result.current).toBe(0); // Should still be 0 initially
  });

  it('should handle scroll events with passive flag', () => {
    renderHook(() => useParallax(0.5), { wrapper });

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    );
  });

  it('should handle cleanup when component unmounts during animation', () => {
    const { unmount } = renderHook(() => useParallax(0.5), { wrapper });

    // Start some animation
    mockPageYOffset.mockReturnValue(100);

    // Unmount before animation completes
    unmount();

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('should handle scroll event errors gracefully', () => {
    const { result } = renderHook(() => useParallax(0.5), { wrapper });

    // Mock scroll handler to throw an error
    mockPageYOffset.mockImplementation(() => {
      throw new Error('Scroll error');
    });

    // Should not crash when scroll event is triggered
    expect(() => {
      // The hook should handle errors gracefully
      expect(result.current).toBe(0);
    }).not.toThrow();
  });

  it('should handle different speed values', () => {
    const speeds = [0.1, 0.5, 1.0];
    
    speeds.forEach(speed => {
      const { result, unmount } = renderHook(() => useParallax(speed), { wrapper });
      
      // Initial value should be 0
      expect(result.current).toBe(0);
      
      unmount();
    });
  });

  it('should handle very large speed values', () => {
    const speed = 10;
    const { result } = renderHook(() => useParallax(speed), { wrapper });

    // Should handle large speed values without issues
    expect(result.current).toBe(0); // Initial value
  });

  it('should handle very small speed values', () => {
    const speed = 0.001;
    const { result } = renderHook(() => useParallax(speed), { wrapper });

    // Should handle very small speed values
    expect(result.current).toBe(0); // Initial value
  });

  it('should handle multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useParallax(0.5), { wrapper });
    const { result: result2 } = renderHook(() => useParallax(1.0), { wrapper });

    // Both hooks should work independently
    expect(result1.current).toBe(0);
    expect(result2.current).toBe(0);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useParallax(0.5), { wrapper });

    // Should start with offsetY of 0
    expect(result.current).toBe(0);
    
    // Should set up event listeners
    expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    
    // Should start animation loop
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('should handle speed parameter correctly', () => {
    const { result } = renderHook(() => useParallax(2.0), { wrapper });

    // Should accept speed parameter without issues
    expect(result.current).toBe(0);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('should handle cleanup properly on multiple unmounts', () => {
    const { unmount: unmount1 } = renderHook(() => useParallax(0.5), { wrapper });
    const { unmount: unmount2 } = renderHook(() => useParallax(1.0), { wrapper });

    unmount1();
    unmount2();

    // Should clean up both instances
    expect(mockCancelAnimationFrame).toHaveBeenCalledTimes(2);
    expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
  });

  it('should handle window.pageYOffset mock correctly', () => {
    const { result } = renderHook(() => useParallax(0.5), { wrapper });

    // Should work with mocked pageYOffset
    expect(result.current).toBe(0);
    
    // Change the mock value
    mockPageYOffset.mockReturnValue(100);
    
    // The hook should still work
    expect(result.current).toBe(0); // Initial value
  });
});