import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImmediateReliefPracticeMenu from '@src/components/ImmediateReliefPractice/ImmediateReliefPracticeMenu';
import { useAbundanceStore } from '@src/store/abundanceStore';

// Mock store
jest.mock('@src/store/abundanceStore');

const mockStartExercise = jest.fn();
const mockSkipPractice = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  useAbundanceStore.mockReturnValue({
    startImmediateReliefExercise: mockStartExercise,
    skipImmediateReliefPractice: mockSkipPractice
  });
});

describe('ImmediateReliefPracticeMenu Component', () => {
  test('renders all practice options', () => {
    render(<ImmediateReliefPracticeMenu />);
    expect(screen.getByText('Pattern Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Breathing Exercise')).toBeInTheDocument();
    expect(screen.getByText('Guided Visualization')).toBeInTheDocument();
  });

  test('triggers exercise start when selecting pattern puzzle', () => {
    render(<ImmediateReliefPracticeMenu />);
    fireEvent.click(screen.getByText('Pattern Puzzle'));
    expect(mockStartExercise).toHaveBeenCalledWith('pattern-puzzle');
  });

  test('triggers exercise start when selecting breathing exercise', () => {
    render(<ImmediateReliefPracticeMenu />);
    fireEvent.click(screen.getByText('Breathing Exercise'));
    expect(mockStartExercise).toHaveBeenCalledWith('breathing');
  });

  test('handles skip practice action', () => {
    render(<ImmediateReliefPracticeMenu />);
    fireEvent.click(screen.getByText('Skip for Now'));
    expect(mockSkipPractice).toHaveBeenCalled();
  });

  test('shows practice descriptions on hover', () => {
    render(<ImmediateReliefPracticeMenu />);
    fireEvent.mouseEnter(screen.getByText('Pattern Puzzle'));
    expect(screen.getByText(/helps redirect your focus/i)).toBeInTheDocument();
  });
}); 