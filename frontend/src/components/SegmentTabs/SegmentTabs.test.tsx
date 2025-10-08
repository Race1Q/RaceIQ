// frontend/src/components/SegmentTabs/SegmentTabs.test.tsx
import { render, screen } from '@testing-library/react';
import { SegmentTabs } from './SegmentTabs';

describe('SegmentTabs', () => {
  it('renders without crashing', () => {
    const mockOnChange = jest.fn();
    render(<SegmentTabs value="active" onChange={mockOnChange} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

