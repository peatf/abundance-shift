import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OpennessPrimer from '@src/components/OpennessPrimer';
import { useAbundanceStore, opennessPrimerSubStages } from '@src/store/abundanceStore';
import PatternAlignmentPuzzle from '@src/components/OpennessPrimer/PatternAlignmentPuzzle';

// Mock the Zustand store
const mockSucceedOpennessPrimer = jest.fn();
const mockFailOpennessPrimerAttempt = jest.fn();

jest.mock('@src/store/abundanceStore', () => ({
  ...jest.requireActual('@src/store/abundanceStore'),
  useAbundanceStore: jest.fn(),
  opennessPrimerSubStages: jest.requireActual('@src/store/abundanceStore').opennessPrimerSubStages,
}));

// Mock sub-stage components
jest.mock('@src/components/OpennessPrimer/PatternAlignmentPuzzle', () => ({ onSuccess, onFailure }) => (
  <div data-testid="pattern-puzzle">
    PatternAlignmentPuzzle
    <button onClick={onSuccess}>Success</button>
    <button onClick={onFailure}>Failure</button>
  </div>
));
jest.mock('@src/components/SequenceMemoryTap', () => ({ onSuccess, onFailure }) => (
  <div data-testid="sequence-tap">
    SequenceMemoryTap
    <button onClick={onSuccess}>Success</button>
    <button onClick={onFailure}>Failure</button>
  </div>
));

const mockStoreState = (state) => {
  useAbundanceStore.mockImplementation((selector) => selector(state));
};

describe('OpennessPrimer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock state for openness primer
    mockStoreState({
      opennessPrimerCurrentExercise: opennessPrimerSubStages.PATTERN_PUZZLE,
      opennessPrimerAttempts: 0,
      succeedOpennessPrimer: mockSucceedOpennessPrimer,
      failOpennessPrimerAttempt: mockFailOpennessPrimerAttempt,
    });
  });

  test('renders PatternAlignmentPuzzle when current exercise is PATTERN_PUZZLE', () => {
    mockStoreState({
      opennessPrimerCurrentExercise: opennessPrimerSubStages.PATTERN_PUZZLE,
      opennessPrimerAttempts: 0,
      succeedOpennessPrimer: mockSucceedOpennessPrimer,
      failOpennessPrimerAttempt: mockFailOpennessPrimerAttempt,
    });
    render(<OpennessPrimer />);
    expect(screen.getByTestId('pattern-puzzle')).toBeInTheDocument();
    expect(screen.queryByTestId('sequence-tap')).not.toBeInTheDocument();
  });

  test('renders SequenceMemoryTap when current exercise is SEQUENCE_TAP', () => {
    mockStoreState({
      opennessPrimerCurrentExercise: opennessPrimerSubStages.SEQUENCE_TAP,
      opennessPrimerAttempts: 1, // Assuming attempts increment switches exercise
      succeedOpennessPrimer: mockSucceedOpennessPrimer,
      failOpennessPrimerAttempt: mockFailOpennessPrimerAttempt,
    });
    render(<OpennessPrimer />);
    expect(screen.getByTestId('sequence-tap')).toBeInTheDocument();
    expect(screen.queryByTestId('pattern-puzzle')).not.toBeInTheDocument();
  });

  test('calls succeedOpennessPrimer when the current exercise reports success', () => {
    render(<OpennessPrimer />);
    // Assuming PatternAlignmentPuzzle is the current exercise and it renders a button to signal success
    fireEvent.click(screen.getByText('Success'));
    expect(mockSucceedOpennessPrimer).toHaveBeenCalledTimes(1);
    expect(mockFailOpennessPrimerAttempt).not.toHaveBeenCalled();
  });

  test('calls failOpennessPrimerAttempt when the current exercise reports failure', () => {
    render(<OpennessPrimer />);
    // Assuming PatternAlignmentPuzzle is the current exercise and it renders a button to signal failure
    fireEvent.click(screen.getByText('Failure'));
    expect(mockFailOpennessPrimerAttempt).toHaveBeenCalledTimes(1);
    expect(mockSucceedOpennessPrimer).not.toHaveBeenCalled();
  });

  // TODO: Add tests for when max attempts are reached (though this logic might be in the store action)
}); 