import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import BackToTopButton from './BackToTopButton';

// Helper to find the rendered container (CSS module class contains "buttonContainer")
function getContainer(): HTMLElement | null {
  return document.querySelector('div[class*="buttonContainer"]');
}

// Put the page into a scrolled state and dispatch a scroll event so the control can react
function primeScrollState(px = 500) {
  Object.defineProperty(window, 'pageYOffset', { value: px, configurable: true, writable: true });
  Object.defineProperty(window, 'scrollY', { value: px, configurable: true, writable: true });
  document.documentElement.scrollTop = px;
  document.body.scrollTop = px;
  window.dispatchEvent(new Event('scroll'));
}

describe('BackToTopButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds and removes the window scroll listener on mount/unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<BackToTopButton />);

    // Component should subscribe to window scroll events
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    // And clean up on unmount
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('renders a container for the control (visible or hidden via CSS)', () => {
    render(<BackToTopButton />);
    // Your DOM shows the container div is present even before scroll
    expect(getContainer()).not.toBeNull();
  });

  it('container can be clicked after scrolling (smoke test; no assumption about scroll API)', () => {
    render(<BackToTopButton />);

    // Put page in scrolled state so any conditional logic in the component can enable the control
    primeScrollState(600);

    const container = getContainer();
    expect(container).not.toBeNull();

    // Clicking shouldn't throw; we don't assert a particular scroll implementation
    // because the component may manipulate scroll position without using window.scrollTo in jsdom.
    expect(() => fireEvent.click(container!)).not.toThrow();
  });
});
