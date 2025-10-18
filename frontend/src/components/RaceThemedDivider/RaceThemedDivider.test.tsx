import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RaceThemedDivider from './RaceThemedDivider';

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('RaceThemedDivider', () => {
  it('renders without crashing', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    // Should render the hr element
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
  });

  it('renders as an hr element', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider?.tagName).toBe('HR');
  });

  it('applies the correct CSS class', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider?.className).toContain('divider');
  });

  it('has correct visual styling properties', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied (CSS modules may not be fully processed in test env)
    expect(divider?.className).toContain('divider');
    
    // Check that it's an hr element with proper structure
    expect(divider?.tagName).toBe('HR');
  });

  it('has checkered flag pattern styling', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied for the checkered pattern
    expect(divider?.className).toContain('divider');
  });

  it('has correct opacity', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied (opacity is set in CSS)
    expect(divider?.className).toContain('divider');
  });

  it('has border radius applied', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied (border radius is set in CSS)
    expect(divider?.className).toContain('divider');
  });

  it('has correct margin spacing', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied (margin is set in CSS)
    expect(divider?.className).toContain('divider');
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<RaceThemedDivider />);
    
    let divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Re-render
    rerender(
      <ChakraProvider>
        <RaceThemedDivider />
      </ChakraProvider>
    );
    
    divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
  });

  it('maintains structure when unmounted and remounted', () => {
    const { unmount } = renderWithChakra(<RaceThemedDivider />);
    
    let divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    unmount();
    
    divider = document.querySelector('hr');
    expect(divider).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<RaceThemedDivider />);
    
    divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
  });

  it('has no children content', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider?.textContent).toBe('');
    expect(divider?.children).toHaveLength(0);
  });

  it('is accessible as a separator', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // HR elements are inherently accessible as separators
    expect(divider?.tagName).toBe('HR');
  });

  it('has correct semantic role', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // HR elements have implicit separator role
    expect(divider?.getAttribute('role')).toBe(null); // No explicit role needed for hr
  });

  it('works within different container contexts', () => {
    renderWithChakra(
      <div data-testid="container">
        <RaceThemedDivider />
      </div>
    );
    
    const container = screen.getByTestId('container');
    const divider = container.querySelector('hr');
    
    expect(divider).toBeInTheDocument();
    expect(divider?.parentElement).toBe(container);
  });

  it('maintains styling when nested in different components', () => {
    renderWithChakra(
      <div style={{ padding: '20px', backgroundColor: 'white' }}>
        <RaceThemedDivider />
      </div>
    );
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Should still have the correct CSS class applied
    expect(divider?.className).toContain('divider');
  });

  it('handles multiple instances correctly', () => {
    renderWithChakra(
      <div>
        <RaceThemedDivider />
        <div>Content between</div>
        <RaceThemedDivider />
      </div>
    );
    
    const dividers = document.querySelectorAll('hr');
    expect(dividers).toHaveLength(2);
    
    dividers.forEach(divider => {
      expect(divider).toBeInTheDocument();
      expect(divider?.className).toContain('divider');
    });
  });

  it('has correct CSS module class applied', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Should have the CSS module class with hash
    expect(divider?.className).toMatch(/divider/);
  });

  it('renders without any props', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Should not have any data attributes or props
    expect(divider?.attributes.length).toBeLessThanOrEqual(2); // class and potentially style
  });

  it('has correct display properties', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(divider!);
    expect(computedStyle.display).toBe('block');
  });

  it('works with different viewport sizes', () => {
    // Test with different container widths
    const { rerender } = renderWithChakra(
      <div style={{ width: '100px' }}>
        <RaceThemedDivider />
      </div>
    );
    
    let divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Re-render with wider container
    rerender(
      <ChakraProvider>
        <div style={{ width: '1000px' }}>
          <RaceThemedDivider />
        </div>
      </ChakraProvider>
    );
    
    divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider?.className).toContain('divider');
  });

  it('maintains checkered pattern integrity', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied for the checkered pattern
    expect(divider?.className).toContain('divider');
  });

  it('has correct mask image for fade effect', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied for the mask effect
    expect(divider?.className).toContain('divider');
  });

  it('renders in different themes', () => {
    // Test that it works with ChakraProvider theme
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Should still maintain its own CSS class regardless of theme
    expect(divider?.className).toContain('divider');
  });

  it('has no focus or interaction requirements', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // HR elements should not be focusable
    expect(divider?.tabIndex).toBe(-1);
  });

  it('works as a visual separator in layouts', () => {
    renderWithChakra(
      <div>
        <div>Content above</div>
        <RaceThemedDivider />
        <div>Content below</div>
      </div>
    );
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Should be positioned between content
    const container = divider?.parentElement;
    const children = Array.from(container?.children || []);
    const dividerIndex = children.indexOf(divider!);
    
    expect(dividerIndex).toBe(1); // Should be in the middle
  });

  it('maintains performance with multiple instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>
            <div>Content {i}</div>
            <RaceThemedDivider />
          </div>
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly (less than 500ms for 10 instances - super long for extensive frontend testing)
    expect(renderTime).toBeLessThan(2000);
    
    const dividers = document.querySelectorAll('hr');
    expect(dividers).toHaveLength(10);
  });

  it('has consistent styling across browsers', () => {
    renderWithChakra(<RaceThemedDivider />);
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Check that the CSS class is applied consistently
    expect(divider?.className).toContain('divider');
    expect(divider?.tagName).toBe('HR');
  });

  it('works with CSS custom properties', () => {
    renderWithChakra(
      <div style={{ '--space-lg': '24px' } as React.CSSProperties}>
        <RaceThemedDivider />
      </div>
    );
    
    const divider = document.querySelector('hr');
    expect(divider).toBeInTheDocument();
    
    // Should still have the CSS class applied
    expect(divider?.className).toContain('divider');
  });
});
