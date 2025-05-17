import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommitAnchor from '@src/components/PerceptionWorkshop/CommitAnchor';
import { useAbundanceStore } from '@src/store/abundanceStore';

// Mock hooks and store
jest.mock('@src/hooks/useWebAudioTones');
jest.mock('@src/hooks/useSpeechSynthesis');
jest.mock('@src/store/abundanceStore');

const mockCommitAndAnchorFrame = jest.fn();
const mockPlayTone = jest.fn();
const mockSpeak = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  useAbundanceStore.mockReturnValue({
    anchoredFrame: {
      statement: 'Test statement',
      completion: 'Test completion',
      rating: 4
    },
    commitAndAnchorFrame: mockCommitAndAnchorFrame
  });
  
  require('@src/hooks/useWebAudioTones').default.mockReturnValue({
    playTone: mockPlayTone
  });
  
  require('@src/hooks/useSpeechSynthesis').default.mockReturnValue({
    speak: mockSpeak
  });
});

describe('CommitAnchor Component', () => {
  test('renders top-rated frame with statement and completion', () => {
    render(<CommitAnchor />);
    expect(screen.getByText('Test statement')).toBeInTheDocument();
    expect(screen.getByText('Test completion')).toBeInTheDocument();
    expect(screen.getByText('4 Stars')).toBeInTheDocument();
  });

  test('triggers breath loop on mount', async () => {
    render(<CommitAnchor />);
    await waitFor(() => {
      expect(mockPlayTone).toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalledWith('Breathe in');
    }, { timeout: 1000 });
  });

  test('calls commitAndAnchorFrame on button click', () => {
    render(<CommitAnchor />);
    fireEvent.click(screen.getByText('Anchor This Frame'));
    expect(mockCommitAndAnchorFrame).toHaveBeenCalled();
  });

  test('stops breath loop on unmount', () => {
    const { unmount } = render(<CommitAnchor />);
    unmount();
    expect(mockPlayTone).toHaveBeenCalledTimes(1); // Verify cleanup
  });
}); 