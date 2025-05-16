import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlternativeFrameGeneration from '@src/components/AlternativeFrameGeneration';
import { useAbundanceStore } from '@src/store/abundanceStore';

// Mock Zustand store
jest.mock('@src/store/abundanceStore');

// Mock StarRating to avoid testing its implementation here
jest.mock('@src/components/StarRating', () => ({ onChange }) => (
  <div data-testid="star-rating">
    <button onClick={() => onChange(3)}>Rate 3 Stars</button>
  </div>
));

const mockUpdateFrame = jest.fn();
useAbundanceStore.mockReturnValue({
  alternativeFrames: [
    { id: 'temp', text: 'This is temporary because...', userCompletion: '', rating: 0 }
  ],
  updateAlternativeFrameCompletion: mockUpdateFrame,
  updateAlternativeFrameRating: mockUpdateFrame
});

describe('AlternativeFrameGeneration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders frame templates with prompts', () => {
    render(<AlternativeFrameGeneration />);
    expect(screen.getByText('This is temporary because...')).toBeInTheDocument();
  });

  test('updates frame completion on user input', () => {
    render(<AlternativeFrameGeneration />);
    const input = screen.getByLabelText(/Complete this frame/i);
    fireEvent.change(input, { target: { value: 'things change' } });
    expect(mockUpdateFrame).toHaveBeenCalledWith('temp', 'things change');
  });

  test('integrates with StarRating for frame ratings', () => {
    render(<AlternativeFrameGeneration />);
    fireEvent.click(screen.getByText('Rate 3 Stars'));
    expect(mockUpdateFrame).toHaveBeenCalledWith('temp', 3);
  });

  // TODO: Test validation for incomplete frames
  // TODO: Test navigation to CommitAnchor step
}); 