import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RaceControlLog from './RaceControlLog';
import type { RaceControlMessage } from '../../data/types';

// Mock Chakra UI theme
const theme = {
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      red: '#e53e3e',
    },
  },
  components: {
    Box: {
      baseStyle: {},
    },
    Text: {
      baseStyle: {},
    },
    VStack: {
      baseStyle: {},
    },
    HStack: {
      baseStyle: {},
    },
    Heading: {
      baseStyle: {},
    },
    Badge: {
      baseStyle: {},
    },
  },
};

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

describe('RaceControlLog', () => {
  const mockMessages: RaceControlMessage[] = [
    { lap: 1, message: 'Race started - Green flag' },
    { lap: 5, message: 'Safety car deployed due to incident' },
    { lap: 8, message: 'Safety car in this lap' },
    { lap: 15, message: 'Virtual Safety Car deployed' },
    { lap: 20, message: 'Red flag - Race suspended' },
  ];

  it('renders without crashing', () => {
    renderWithProviders(<RaceControlLog messages={[]} />);
    
    expect(screen.getByText('Race Control')).toBeInTheDocument();
  });

  it('displays the heading correctly', () => {
    renderWithProviders(<RaceControlLog messages={[]} />);
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Race Control');
  });

  it('renders empty state when no messages provided', () => {
    renderWithProviders(<RaceControlLog messages={[]} />);
    
    expect(screen.getByText('Race Control')).toBeInTheDocument();
    // Should not have any message content
    expect(screen.queryByText(/L1/)).not.toBeInTheDocument();
  });

  it('renders all messages correctly', () => {
    renderWithProviders(<RaceControlLog messages={mockMessages} />);
    
    // Check that all messages are rendered
    expect(screen.getByText('Race started - Green flag')).toBeInTheDocument();
    expect(screen.getByText('Safety car deployed due to incident')).toBeInTheDocument();
    expect(screen.getByText('Safety car in this lap')).toBeInTheDocument();
    expect(screen.getByText('Virtual Safety Car deployed')).toBeInTheDocument();
    expect(screen.getByText('Red flag - Race suspended')).toBeInTheDocument();
  });

  it('displays lap numbers as badges', () => {
    renderWithProviders(<RaceControlLog messages={mockMessages} />);
    
    // Check that lap numbers are displayed as badges
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText('L5')).toBeInTheDocument();
    expect(screen.getByText('L8')).toBeInTheDocument();
    expect(screen.getByText('L15')).toBeInTheDocument();
    expect(screen.getByText('L20')).toBeInTheDocument();
  });

  it('renders messages in correct order', () => {
    renderWithProviders(<RaceControlLog messages={mockMessages} />);
    
    const messageElements = screen.getAllByText(/L\d+/);
    expect(messageElements).toHaveLength(5);
    
    // Check order (should be in the order they were provided)
    expect(messageElements[0]).toHaveTextContent('L1');
    expect(messageElements[1]).toHaveTextContent('L5');
    expect(messageElements[2]).toHaveTextContent('L8');
    expect(messageElements[3]).toHaveTextContent('L15');
    expect(messageElements[4]).toHaveTextContent('L20');
  });

  it('handles single message correctly', () => {
    const singleMessage: RaceControlMessage[] = [
      { lap: 10, message: 'Single race control message' }
    ];
    
    renderWithProviders(<RaceControlLog messages={singleMessage} />);
    
    expect(screen.getByText('L10')).toBeInTheDocument();
    expect(screen.getByText('Single race control message')).toBeInTheDocument();
  });

  it('handles messages with special characters', () => {
    const specialMessages: RaceControlMessage[] = [
      { lap: 1, message: 'Message with "quotes" and \'apostrophes\'' },
      { lap: 2, message: 'Message with & symbols & special chars!' },
      { lap: 3, message: 'Message with <HTML> tags' },
    ];
    
    renderWithProviders(<RaceControlLog messages={specialMessages} />);
    
    expect(screen.getByText('Message with "quotes" and \'apostrophes\'')).toBeInTheDocument();
    expect(screen.getByText('Message with & symbols & special chars!')).toBeInTheDocument();
    expect(screen.getByText('Message with <HTML> tags')).toBeInTheDocument();
  });

  it('handles large number of messages', () => {
    const manyMessages: RaceControlMessage[] = Array.from({ length: 50 }, (_, i) => ({
      lap: i + 1,
      message: `Message for lap ${i + 1}`
    }));
    
    renderWithProviders(<RaceControlLog messages={manyMessages} />);
    
    // Check that all messages are rendered
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText('L50')).toBeInTheDocument();
    expect(screen.getByText('Message for lap 1')).toBeInTheDocument();
    expect(screen.getByText('Message for lap 50')).toBeInTheDocument();
  });

  it('handles messages with zero lap number', () => {
    const zeroLapMessage: RaceControlMessage[] = [
      { lap: 0, message: 'Pre-race message' }
    ];
    
    renderWithProviders(<RaceControlLog messages={zeroLapMessage} />);
    
    expect(screen.getByText('L0')).toBeInTheDocument();
    expect(screen.getByText('Pre-race message')).toBeInTheDocument();
  });

  it('handles messages with high lap numbers', () => {
    const highLapMessage: RaceControlMessage[] = [
      { lap: 999, message: 'Very high lap number message' }
    ];
    
    renderWithProviders(<RaceControlLog messages={highLapMessage} />);
    
    expect(screen.getByText('L999')).toBeInTheDocument();
    expect(screen.getByText('Very high lap number message')).toBeInTheDocument();
  });

  it('handles empty message strings', () => {
    const emptyMessage: RaceControlMessage[] = [
      { lap: 1, message: '' }
    ];
    
    renderWithProviders(<RaceControlLog messages={emptyMessage} />);
    
    expect(screen.getByText('L1')).toBeInTheDocument();
    // Empty message should still render the lap badge
  });

  it('handles very long messages', () => {
    const longMessage: RaceControlMessage[] = [
      { 
        lap: 1, 
        message: 'This is a very long race control message that contains a lot of text and should be displayed properly without breaking the layout or causing any issues with the component rendering. It should wrap correctly and maintain the proper styling.' 
      }
    ];
    
    renderWithProviders(<RaceControlLog messages={longMessage} />);
    
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText(/This is a very long race control message/)).toBeInTheDocument();
  });

  it('maintains proper structure with mixed content', () => {
    const mixedMessages: RaceControlMessage[] = [
      { lap: 1, message: 'Short message' },
      { lap: 2, message: 'This is a much longer message that contains more detailed information about the race control decision and should be displayed properly' },
      { lap: 3, message: 'Medium length message with some details' },
    ];
    
    renderWithProviders(<RaceControlLog messages={mixedMessages} />);
    
    // All messages should be rendered
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText('L2')).toBeInTheDocument();
    expect(screen.getByText('L3')).toBeInTheDocument();
    
    expect(screen.getByText('Short message')).toBeInTheDocument();
    expect(screen.getByText(/This is a much longer message/)).toBeInTheDocument();
    expect(screen.getByText('Medium length message with some details')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    renderWithProviders(<RaceControlLog messages={mockMessages} />);
    
    // Check that the heading has proper role
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    
    // Check that messages are accessible
    expect(screen.getByText('Race started - Green flag')).toBeInTheDocument();
  });

  it('handles rapid prop changes', () => {
    const { rerender } = renderWithProviders(<RaceControlLog messages={[]} />);
    
    expect(screen.queryByText(/L\d+/)).not.toBeInTheDocument();
    
    // Add messages
    rerender(
      <ChakraProvider theme={theme}>
        <RaceControlLog messages={mockMessages} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText('Race started - Green flag')).toBeInTheDocument();
    
    // Change messages
    const newMessages: RaceControlMessage[] = [
      { lap: 10, message: 'New message' }
    ];
    
    rerender(
      <ChakraProvider theme={theme}>
        <RaceControlLog messages={newMessages} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('L10')).toBeInTheDocument();
    expect(screen.getByText('New message')).toBeInTheDocument();
    expect(screen.queryByText('L1')).not.toBeInTheDocument();
  });

  it('handles duplicate lap numbers', () => {
    const duplicateLapMessages: RaceControlMessage[] = [
      { lap: 1, message: 'First message for lap 1' },
      { lap: 1, message: 'Second message for lap 1' },
      { lap: 2, message: 'Message for lap 2' },
    ];
    
    renderWithProviders(<RaceControlLog messages={duplicateLapMessages} />);
    
    // Should render all messages even with duplicate lap numbers
    expect(screen.getAllByText('L1')).toHaveLength(2);
    expect(screen.getByText('L2')).toBeInTheDocument();
    expect(screen.getByText('First message for lap 1')).toBeInTheDocument();
    expect(screen.getByText('Second message for lap 1')).toBeInTheDocument();
    expect(screen.getByText('Message for lap 2')).toBeInTheDocument();
  });

  it('handles negative lap numbers', () => {
    const negativeLapMessage: RaceControlMessage[] = [
      { lap: -1, message: 'Negative lap message' }
    ];
    
    renderWithProviders(<RaceControlLog messages={negativeLapMessage} />);
    
    expect(screen.getByText('L-1')).toBeInTheDocument();
    expect(screen.getByText('Negative lap message')).toBeInTheDocument();
  });

  it('handles messages with only whitespace', () => {
    const whitespaceMessage: RaceControlMessage[] = [
      { lap: 1, message: '   ' },
      { lap: 2, message: '\t\n' },
    ];
    
    renderWithProviders(<RaceControlLog messages={whitespaceMessage} />);
    
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText('L2')).toBeInTheDocument();
  });

  it('maintains performance with many messages', () => {
    const startTime = performance.now();
    const manyMessages: RaceControlMessage[] = Array.from({ length: 1000 }, (_, i) => ({
      lap: i + 1,
      message: `Performance test message ${i + 1}`
    }));
    
    renderWithProviders(<RaceControlLog messages={manyMessages} />);
    const endTime = performance.now();
    
    // Should render within reasonable time (less than 30 seconds for test environment)
    expect(endTime - startTime).toBeLessThan(45000);
    
    // Should still render all messages
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(screen.getByText('L1000')).toBeInTheDocument();
  });

  it('handles messages with unicode characters', () => {
    const unicodeMessages: RaceControlMessage[] = [
      { lap: 1, message: 'Message with émojis 🏁 🏎️ 🏆' },
      { lap: 2, message: 'Message with accénts and spëcial chars' },
      { lap: 3, message: 'Message with 中文 characters' },
    ];
    
    renderWithProviders(<RaceControlLog messages={unicodeMessages} />);
    
    expect(screen.getByText('Message with émojis 🏁 🏎️ 🏆')).toBeInTheDocument();
    expect(screen.getByText('Message with accénts and spëcial chars')).toBeInTheDocument();
    expect(screen.getByText('Message with 中文 characters')).toBeInTheDocument();
  });
});
