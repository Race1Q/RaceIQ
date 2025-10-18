import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProfileUpdateProvider, useProfileUpdate } from './ProfileUpdateContext';

describe('ProfileUpdateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides default context values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProfileUpdateProvider>{children}</ProfileUpdateProvider>
    );

    const { result } = renderHook(() => useProfileUpdate(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current.triggerRefresh).toBeDefined();
    expect(result.current.refreshTrigger).toBe(0);
  });

  it('increments refresh key when triggerRefresh is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProfileUpdateProvider>{children}</ProfileUpdateProvider>
    );

    const { result } = renderHook(() => useProfileUpdate(), { wrapper });
    
    const initialKey = result.current.refreshTrigger;
    
    act(() => {
      result.current.triggerRefresh();
    });
    
    expect(result.current.refreshTrigger).toBe(initialKey + 1);
  });

  it('can trigger refresh multiple times', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProfileUpdateProvider>{children}</ProfileUpdateProvider>
    );

    const { result } = renderHook(() => useProfileUpdate(), { wrapper });
    
    act(() => {
      result.current.triggerRefresh();
      result.current.triggerRefresh();
      result.current.triggerRefresh();
    });
    
    expect(result.current.refreshTrigger).toBe(3);
  });

  it('throws error when used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useProfileUpdate());
    }).toThrow();
    
    consoleErrorSpy.mockRestore();
  });
});

