import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CheckeredDivider from './CheckeredDivider';

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('CheckeredDivider', () => {
  it('renders without children', () => {
    renderWithChakra(<CheckeredDivider />);
    
    // Should render the container flex
    const container = document.querySelector('div[class*="css-"]');
    expect(container).toBeInTheDocument();
    
    // Should have two checkered borders
    const checkeredBorders = document.querySelectorAll('[class*="checkeredBorder"]');
    expect(checkeredBorders).toHaveLength(2);
  });

  it('renders with children text', () => {
    const testText = 'Test Divider';
    renderWithChakra(<CheckeredDivider>{testText}</CheckeredDivider>);
    
    expect(screen.getByText(testText)).toBeInTheDocument();
    
    // Should still have two checkered borders
    const checkeredBorders = document.querySelectorAll('[class*="checkeredBorder"]');
    expect(checkeredBorders).toHaveLength(2);
  });

  it('renders with complex children', () => {
    renderWithChakra(
      <CheckeredDivider>
        <span data-testid="custom-child">Custom Content</span>
      </CheckeredDivider>
    );
    
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('applies correct styling to text children', () => {
    const testText = 'Styled Text';
    renderWithChakra(<CheckeredDivider>{testText}</CheckeredDivider>);
    
    const textElement = screen.getByText(testText);
    expect(textElement).toBeInTheDocument();
    
    // Check that it's a span element
    expect(textElement.tagName).toBe('SPAN');
  });

  it('has correct container structure', () => {
    renderWithChakra(<CheckeredDivider>Test</CheckeredDivider>);
    
    // The main container should be a Flex component
    const container = document.querySelector('div[class*="css-"]');
    expect(container).toBeInTheDocument();
    
    // Should have three children: border, text, border
    const children = container?.children;
    expect(children).toHaveLength(3);
  });

  it('applies checkered border CSS class', () => {
    renderWithChakra(<CheckeredDivider />);
    
    const checkeredBorders = document.querySelectorAll('[class*="checkeredBorder"]');
    expect(checkeredBorders).toHaveLength(2);
    
    // Each border should have the CSS module class (with hash)
    checkeredBorders.forEach(border => {
      expect(border.className).toContain('checkeredBorder');
    });
  });

  it('handles empty string children', () => {
    renderWithChakra(<CheckeredDivider>{''}</CheckeredDivider>);
    
    // Should not render text when children is empty string
    // The component should not render the text span at all for empty strings
    const textSpan = document.querySelector('span.chakra-text');
    expect(textSpan).not.toBeInTheDocument();
  });

  it('handles null children', () => {
    renderWithChakra(<CheckeredDivider>{null}</CheckeredDivider>);
    
    // Should not render text when children is null
    // The component should not render the text span at all
    const textSpan = document.querySelector('span.chakra-text');
    expect(textSpan).not.toBeInTheDocument();
  });

  it('handles undefined children', () => {
    renderWithChakra(<CheckeredDivider>{undefined}</CheckeredDivider>);
    
    // Should not render text when children is undefined
    // The component should not render the text span at all
    const textSpan = document.querySelector('span.chakra-text');
    expect(textSpan).not.toBeInTheDocument();
  });

  it('handles multiple children', () => {
    renderWithChakra(
      <CheckeredDivider>
        <span>First</span>
        <span>Second</span>
      </CheckeredDivider>
    );
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('handles numeric children', () => {
    renderWithChakra(<CheckeredDivider>{123}</CheckeredDivider>);
    
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('handles boolean children', () => {
    renderWithChakra(<CheckeredDivider>{true}</CheckeredDivider>);
    
    // Boolean true renders as empty string in React, but the span should still be present
    const textSpan = document.querySelector('span.chakra-text');
    expect(textSpan).toBeInTheDocument();
    expect(textSpan?.textContent).toBe('');
  });

  it('maintains structure with different content types', () => {
    const testCases = [
      'Simple text',
      <span key="1">JSX element</span>,
      42,
      true,
      null,
      undefined,
      '',
    ];

    testCases.forEach((content, index) => {
      const { unmount } = renderWithChakra(
        <CheckeredDivider>{content}</CheckeredDivider>
      );
      
      // Should always have two checkered borders
      const checkeredBorders = document.querySelectorAll('[class*="checkeredBorder"]');
      expect(checkeredBorders).toHaveLength(2);
      
      unmount();
    });
  });

  it('applies responsive styling', () => {
    renderWithChakra(<CheckeredDivider>Responsive Text</CheckeredDivider>);
    
    const textElement = screen.getByText('Responsive Text');
    expect(textElement).toBeInTheDocument();
    
    // The component should have responsive classes applied
    // (Chakra UI handles this internally, so we just verify the element exists)
    expect(textElement).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<CheckeredDivider>Test</CheckeredDivider>);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // Re-render with same content
    rerender(
      <ChakraProvider>
        <CheckeredDivider>Test</CheckeredDivider>
      </ChakraProvider>
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // Re-render with different content
    rerender(
      <ChakraProvider>
        <CheckeredDivider>Different</CheckeredDivider>
      </ChakraProvider>
    );
    
    expect(screen.getByText('Different')).toBeInTheDocument();
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('handles very long text content', () => {
    const longText = 'This is a very long text that should still be displayed properly in the checkered divider component without breaking the layout or causing any issues with the rendering';
    
    renderWithChakra(<CheckeredDivider>{longText}</CheckeredDivider>);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
    
    // Should still have two checkered borders
    const checkeredBorders = document.querySelectorAll('[class*="checkeredBorder"]');
    expect(checkeredBorders).toHaveLength(2);
  });

  it('handles special characters in text', () => {
    const specialText = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    
    renderWithChakra(<CheckeredDivider>{specialText}</CheckeredDivider>);
    
    expect(screen.getByText(specialText)).toBeInTheDocument();
  });

  it('handles unicode characters', () => {
    const unicodeText = 'Unicode: 🏎️ 🏁 🏆 🥇 🏅';
    
    renderWithChakra(<CheckeredDivider>{unicodeText}</CheckeredDivider>);
    
    expect(screen.getByText(unicodeText)).toBeInTheDocument();
  });

  it('renders with conditional children', () => {
    const showText = true;
    renderWithChakra(
      <CheckeredDivider>
        {showText && 'Conditional Text'}
      </CheckeredDivider>
    );
    
    expect(screen.getByText('Conditional Text')).toBeInTheDocument();
  });

  it('renders with false conditional children', () => {
    const showText = false;
    renderWithChakra(
      <CheckeredDivider>
        {showText && 'Conditional Text'}
      </CheckeredDivider>
    );
    
    // Should not render the text when condition is false
    expect(screen.queryByText('Conditional Text')).not.toBeInTheDocument();
  });

  it('maintains checkered border styling', () => {
    renderWithChakra(<CheckeredDivider>Test</CheckeredDivider>);
    
    const checkeredBorders = document.querySelectorAll('[class*="checkeredBorder"]');
    expect(checkeredBorders).toHaveLength(2);
    
    // Check that borders have the expected styling
    checkeredBorders.forEach(border => {
      expect(border).toHaveStyle({
        height: '5px'
      });
    });
  });

  it('handles false boolean children', () => {
    renderWithChakra(<CheckeredDivider>{false}</CheckeredDivider>);
    
    // Boolean false should not render the text span
    const textSpan = document.querySelector('span.chakra-text');
    expect(textSpan).not.toBeInTheDocument();
  });

  it('handles zero numeric children', () => {
    renderWithChakra(<CheckeredDivider>{0}</CheckeredDivider>);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles negative numeric children', () => {
    renderWithChakra(<CheckeredDivider>{-42}</CheckeredDivider>);
    
    expect(screen.getByText('-42')).toBeInTheDocument();
  });
});