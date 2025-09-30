import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ChakraProvider } from '@chakra-ui/react';
import { useActiveRoute } from './useActiveRoute';

// Mock react-router-dom
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useActiveRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('home route matching', () => {
    it('should return true when path is "/" and location is "/"', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' });
      
      const { result } = renderHook(() => useActiveRoute('/'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should return false when path is "/" and location is not "/"', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers' });
      
      const { result } = renderHook(() => useActiveRoute('/'), { wrapper });
      
      expect(result.current).toBe(false);
    });
  });

  describe('exact match routes', () => {
    const exactMatchRoutes = ['/drivers', '/drivers-dashboard', '/races', '/about'];

    exactMatchRoutes.forEach(route => {
      it(`should return true for exact match on ${route}`, () => {
        mockUseLocation.mockReturnValue({ pathname: route });
        
        const { result } = renderHook(() => useActiveRoute(route), { wrapper });
        
        expect(result.current).toBe(true);
      });

      it(`should return false for non-exact match on ${route}`, () => {
        mockUseLocation.mockReturnValue({ pathname: `${route}/some-sub-route` });
        
        const { result } = renderHook(() => useActiveRoute(route), { wrapper });
        
        expect(result.current).toBe(false);
      });

      it(`should return false when location doesn't match ${route}`, () => {
        mockUseLocation.mockReturnValue({ pathname: '/different-route' });
        
        const { result } = renderHook(() => useActiveRoute(route), { wrapper });
        
        expect(result.current).toBe(false);
      });
    });
  });

  describe('special route handling', () => {
    it('should return true for /admin and /admin sub-routes (prefix matching)', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin' });
      const { result: result1 } = renderHook(() => useActiveRoute('/admin'), { wrapper });
      expect(result1.current).toBe(true);

      mockUseLocation.mockReturnValue({ pathname: '/admin/users' });
      const { result: result2 } = renderHook(() => useActiveRoute('/admin'), { wrapper });
      expect(result2.current).toBe(true);
    });

    it('should return true for /standings and /standings sub-routes (special handling)', () => {
      mockUseLocation.mockReturnValue({ pathname: '/standings' });
      const { result: result1 } = renderHook(() => useActiveRoute('/standings'), { wrapper });
      expect(result1.current).toBe(true);

      mockUseLocation.mockReturnValue({ pathname: '/standings/constructors' });
      const { result: result2 } = renderHook(() => useActiveRoute('/standings'), { wrapper });
      expect(result2.current).toBe(true);

      mockUseLocation.mockReturnValue({ pathname: '/standings/drivers' });
      const { result: result3 } = renderHook(() => useActiveRoute('/standings'), { wrapper });
      expect(result3.current).toBe(true);
    });
  });

  describe('prefix matching for other routes', () => {
    it('should return true when current path starts with the given path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers/123' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/123'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should return true for sub-routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers/123/stats' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/123'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should return false when current path does not start with the given path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/races/123' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/123'), { wrapper });
      
      expect(result.current).toBe(false);
    });

    it('should return false when given path is longer than current path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/123'), { wrapper });
      
      expect(result.current).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty pathname', () => {
      mockUseLocation.mockReturnValue({ pathname: '' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers'), { wrapper });
      
      expect(result.current).toBe(false);
    });

    it('should handle root path with trailing slash', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' });
      
      const { result } = renderHook(() => useActiveRoute('/'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should handle paths with query parameters', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers/123' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/123'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should handle paths with hash fragments', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers/123' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/123'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should handle case sensitivity correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/Drivers' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers'), { wrapper });
      
      expect(result.current).toBe(false);
    });

    it('should handle paths with special characters', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers/test-driver-123' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/test-driver-123'), { wrapper });
      
      expect(result.current).toBe(true);
    });
  });

  describe('specific route scenarios', () => {
    it('should correctly identify driver detail routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/drivers/lewis-hamilton' });
      
      const { result } = renderHook(() => useActiveRoute('/drivers/lewis-hamilton'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should correctly identify race detail routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/races/monaco-2024' });
      
      const { result } = renderHook(() => useActiveRoute('/races/monaco-2024'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should handle nested admin routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users' });
      
      const { result } = renderHook(() => useActiveRoute('/admin/users'), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('should handle standings sub-routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/standings/drivers/2024' });
      
      const { result } = renderHook(() => useActiveRoute('/standings/drivers/2024'), { wrapper });
      
      expect(result.current).toBe(true);
    });
  });
});
