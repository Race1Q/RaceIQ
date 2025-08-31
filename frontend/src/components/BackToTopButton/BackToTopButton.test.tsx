// src/components/BackToTopButton/BackToTopButton.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import BackToTopButton from './BackToTopButton';

// Mock CSS module
vi.mock('./BackToTopButton.module.css', () => ({
  default: {
    buttonContainer: 'buttonContainer',
    backToTopButton: 'backToTopButton',
  },
}), { virtual: true });

// Mock icon to keep DOM minimal
vi.mock('lucide-react', () => ({
  ArrowUp: (props: any) => <svg data-testid="arrow-up" {...props} />,
}));

// Helper to drive scroll + event in a React-safe way
const driveScrollTo = async (y: number) => {
  await act(async () => {
    // jsdom doesn't implement scroll position; define it ourselves
    Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
    // Dispatch a real scroll event (the component listens to 'scroll')
    window.dispatchEvent(new Event('scroll'));
  });
};

describe('BackToTopButton', () => {
  const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const addSpy = vi.spyOn(window, 'addEventListener');
  const removeSpy = vi.spyOn(window, 'removeEventListener');

  beforeEach(() => {
    scrollToSpy.mockClear();
    addSpy.mockClear();
    removeSpy.mockClear();
    // Ensure default position is 0 before each test
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is hidden by default (before scrolling)', () => {
    render(<BackToTopButton />);
    expect(screen.queryByRole('button', { name: /go to top/i })).not.toBeInTheDocument();
  });

  it('appears after scrolling past 300px', async () => {
    render(<BackToTopButton />);

    // Ensure effect has mounted and listener is attached
    await act(async () => {});

    await driveScrollTo(350);

    const btn = await screen.findByRole('button', { name: /go to top/i });
    expect(btn).toBeInTheDocument();
    expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
  });

  it('hides again when scrolling back above threshold', async () => {
    render(<BackToTopButton />);
    await act(async () => {});

    await driveScrollTo(350);
    await screen.findByRole('button', { name: /go to top/i }); // visible

    await driveScrollTo(100);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /go to top/i })).not.toBeInTheDocument();
    });
  });

  it('scrolls to top smoothly when clicked', async () => {
    render(<BackToTopButton />);
    await act(async () => {});

    await driveScrollTo(500);
    const btn = await screen.findByRole('button', { name: /go to top/i });

    fireEvent.click(btn);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('adds and removes the scroll listener on mount/unmount', () => {
    const { unmount } = render(<BackToTopButton />);

    // Ensure a scroll listener was added
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    const handler = addSpy.mock.calls.find(([type]) => type === 'scroll')?.[1] as EventListener;
    expect(typeof handler).toBe('function');

    // Unmount should remove the same handler
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', handler);
  });
});
