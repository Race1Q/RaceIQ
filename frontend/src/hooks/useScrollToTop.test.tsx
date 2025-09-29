import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import useScrollToTop from './useScrollToTop';

// Mock useLocation
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Chakra wrapper with router
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('useScrollToTop', () => {
  const mockUseLocation = vi.mocked(useLocation);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null', () => {
    const { result } = renderHook(() => useScrollToTop(), { wrapper });

    expect(result.current).toBeNull();
  });

  it('should scroll to top on initial render', () => {
    renderHook(() => useScrollToTop(), { wrapper });

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('should scroll to top when pathname changes', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change pathname
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '',
      hash: '',
      state: null,
      key: 'drivers',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should scroll to top on multiple pathname changes', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // First pathname change
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '',
      hash: '',
      state: null,
      key: 'drivers',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledTimes(2);

    // Second pathname change
    mockUseLocation.mockReturnValue({
      pathname: '/races',
      search: '',
      hash: '',
      state: null,
      key: 'races',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledTimes(3);

    // Third pathname change
    mockUseLocation.mockReturnValue({
      pathname: '/standings',
      search: '',
      hash: '',
      state: null,
      key: 'standings',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledTimes(4);
  });

  it('should not scroll when pathname does not change', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Rerender with same pathname
    rerender();

    // Should not call scrollTo again
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('should handle different pathname formats', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Test different pathname formats
    const pathnames = [
      '/drivers',
      '/drivers/1',
      '/races/2024',
      '/standings/constructors',
      '/about',
      '/admin/users',
    ];

    pathnames.forEach((pathname, index) => {
      mockUseLocation.mockReturnValue({
        pathname,
        search: '',
        hash: '',
        state: null,
        key: pathname,
      });

      rerender();

      expect(mockScrollTo).toHaveBeenCalledTimes(index + 2);
    });
  });

  it('should handle pathname with query parameters', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change pathname with query parameters
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '?season=2024',
      hash: '',
      state: null,
      key: 'drivers-search',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle pathname with hash', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change pathname with hash
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '',
      hash: '#top',
      state: null,
      key: 'drivers-hash',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle pathname with state', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change pathname with state
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '',
      hash: '',
      state: { from: '/races' },
      key: 'drivers-state',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle empty pathname', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change to empty pathname
    mockUseLocation.mockReturnValue({
      pathname: '',
      search: '',
      hash: '',
      state: null,
      key: 'empty',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle special characters in pathname', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change to pathname with special characters
    mockUseLocation.mockReturnValue({
      pathname: '/drivers/max-verstappen',
      search: '',
      hash: '',
      state: null,
      key: 'special-chars',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle very long pathnames', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change to very long pathname
    const longPathname = '/very/long/path/with/many/segments/and/details';
    mockUseLocation.mockReturnValue({
      pathname: longPathname,
      search: '',
      hash: '',
      state: null,
      key: 'long-path',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple hook instances', () => {
    const { rerender: rerender1 } = renderHook(() => useScrollToTop(), { wrapper });
    const { rerender: rerender2 } = renderHook(() => useScrollToTop(), { wrapper });

    // Both hooks should call scrollTo on initial render
    expect(mockScrollTo).toHaveBeenCalledTimes(2);

    // Change pathname for first hook
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '',
      hash: '',
      state: null,
      key: 'drivers-1',
    });

    rerender1();

    expect(mockScrollTo).toHaveBeenCalledTimes(3);

    // Change pathname for second hook
    mockUseLocation.mockReturnValue({
      pathname: '/races',
      search: '',
      hash: '',
      state: null,
      key: 'races-2',
    });

    rerender2();

    expect(mockScrollTo).toHaveBeenCalledTimes(4);
  });

  it('should handle rapid pathname changes', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Rapid pathname changes
    const pathnames = ['/drivers', '/races', '/standings', '/about', '/admin'];
    
    pathnames.forEach((pathname, index) => {
      mockUseLocation.mockReturnValue({
        pathname,
        search: '',
        hash: '',
        state: null,
        key: pathname,
      });

      rerender();

      expect(mockScrollTo).toHaveBeenCalledTimes(index + 2);
    });
  });

  it('should handle undefined pathname', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change to undefined pathname
    mockUseLocation.mockReturnValue({
      pathname: undefined as any,
      search: '',
      hash: '',
      state: null,
      key: 'undefined',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle null pathname', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change to null pathname
    mockUseLocation.mockReturnValue({
      pathname: null as any,
      search: '',
      hash: '',
      state: null,
      key: 'null',
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle useEffect dependency changes correctly', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Change pathname to trigger useEffect
    mockUseLocation.mockReturnValue({
      pathname: '/drivers',
      search: '',
      hash: '',
      state: null,
      key: 'drivers',
    });

    rerender();

    // Should call scrollTo again due to pathname change
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
    expect(mockScrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it('should maintain consistent behavior across renders', () => {
    const { rerender } = renderHook(() => useScrollToTop(), { wrapper });

    // Initial call
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // Multiple rerenders with same pathname
    for (let i = 0; i < 5; i++) {
      rerender();
    }

    // Should not call scrollTo again
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('should handle window.scrollTo integration correctly', () => {
    renderHook(() => useScrollToTop(), { wrapper });

    // Should call window.scrollTo with correct parameters
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('should handle useLocation hook integration correctly', () => {
    const { result } = renderHook(() => useScrollToTop(), { wrapper });

    // Should return null
    expect(result.current).toBeNull();
    
    // Should have called useLocation
    expect(mockUseLocation).toHaveBeenCalled();
  });
});