import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatternMicroPuzzleRelief from '@src/components/PatternMicroPuzzleRelief';
import { useAbundanceStore } from '@src/store/abundanceStore';

jest.mock('@src/store/abundanceStore');

const mockCompleteExercise = jest.fn();
const mockSkipPuzzle = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAbundanceStore.mockReturnValue({
    completeImmediateReliefExercise: mockCompleteExercise,
    skipImmediateReliefPuzzle: mockSkipPuzzle
  });
});

describe('PatternMicroPuzzleRelief Component', () => {
  test('renders 4x4 puzzle grid', () => {
    render(<PatternMicroPuzzleRelief />);
    expect(screen.getAllByRole('gridcell').length).toBe(16);
  });

  test('highlights target cells on mount', () => {
    render(<PatternMicroPuzzleRelief />);
    expect(screen.getAllByLabelText('target cell').length).toBe(3);
  });

  test('completes after 3 correct matches', () => {
    render(<PatternMicroPuzzleRelief />);
    const targets = screen.getAllByLabelText('target cell');
    targets.forEach(target => fireEvent.click(target));
    expect(mockCompleteExercise).toHaveBeenCalled();
  });

  test('shows skip option', () => {
    render(<PatternMicroPuzzleRelief />);
    fireEvent.click(screen.getByText('Skip Puzzle'));
    expect(mockSkipPuzzle).toHaveBeenCalled();
  });

  // TODO: Test timer functionality with jest.useFakeTimers()
  // TODO: Test incorrect selection handling
}); 