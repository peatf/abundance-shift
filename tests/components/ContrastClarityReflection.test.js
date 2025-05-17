import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContrastClarityReflection from '@src/components/ContrastClarityReflection';
import { useAbundanceStore } from '@src/store/abundanceStore';
import useAudioRecorder from '@root_src/hooks/useAudioRecorder';

// Mock dependencies
jest.mock('@src/store/abundanceStore');
// Provide a factory function for the hook mock
jest.mock('@root_src/hooks/useAudioRecorder', () => ({
  __esModule: true, // This is important for default exports
  default: jest.fn(),
}));

const mockSetClarityReflection = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  useAbundanceStore.mockReturnValue({
    setClarityReflectionText: mockSetClarityReflection,
    setClarityReflectionAudio: mockSetClarityReflection,
    clarityReflectionInput: '', // Add initial state properties if needed for default rendering
    clarityReflectionType: 'text', // Default type for initial render
    proceedFromClarity: jest.fn(), // Mock this function
    showToast: jest.fn(), // Mock this function
  });
  
  // Define the default mocked return value for useAudioRecorder
  // Ensure it matches the hook's actual return structure and property names
  useAudioRecorder.mockReturnValue({
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    pauseRecording: jest.fn(), // Add pause/resume mocks
    resumeRecording: jest.fn(),
    audioBlob: null,
    audioUrl: null,
    recorderState: 'inactive', // Use recorderState
    isSupported: true, // Use isSupported
    resetRecording: jest.fn(), // Add reset mock
    recordingTime: 0, // Add recordingTime
  });
});

describe('ContrastClarityReflection Component', () => {
  test('defaults to text input mode and shows text input', () => {
    render(<ContrastClarityReflection />);
    // Check for the text input area using its aria-label
    expect(screen.getByLabelText('Clarity reflection text input')).toBeInTheDocument();
    // Check for the button to switch to audio
    expect(screen.getByRole('button', { name: /Audio Note/i })).toBeInTheDocument();
  });

  test('switches to audio recording mode and shows audio controls', () => {
    render(<ContrastClarityReflection />);
    // Click the button to switch to audio mode
    fireEvent.click(screen.getByRole('button', { name: /Audio Note/i }));
    
    // Check for the button to switch back to text and the Start Recording button
    expect(screen.getByRole('button', { name: /Text Input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Recording/i })).toBeInTheDocument();
  });

  test('handles text reflection submission', () => {
    const mockProceedFromClarity = jest.fn();
    useAbundanceStore.mockReturnValue({
      setClarityReflectionText: mockSetClarityReflection,
      clarityReflectionInput: '', // Initial state
      clarityReflectionType: 'text', // Initial type
      proceedFromClarity: mockProceedFromClarity, // Mock for this test
      showToast: jest.fn(),
    });
    
    render(<ContrastClarityReflection />);
    const textarea = screen.getByLabelText('Clarity reflection text input');
    fireEvent.change(textarea, {
      target: { value: 'Test reflection' }
    });
    
    // Click the Continue button
    fireEvent.click(screen.getByRole('button', { name: /Continue to Immediate Relief/i }));
    
    expect(mockSetClarityReflection).toHaveBeenCalledWith('Test reflection');
    expect(mockProceedFromClarity).toHaveBeenCalled();
  });

  test('handles audio recording button clicks (basic)', () => {
    render(<ContrastClarityReflection />);
    
    // Switch to audio mode
    fireEvent.click(screen.getByRole('button', { name: /Audio Note/i }));
    
    // Mock the hook return value to simulate recording state
    useAudioRecorder.mockReturnValue({
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      audioBlob: null,
      audioUrl: null,
      recorderState: 'inactive', // Start in inactive state
      isSupported: true,
      resetRecording: jest.fn(),
      recordingTime: 0,
    });
     render(<ContrastClarityReflection />); // Re-render to pick up mock change

    // Click Start Recording
    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    expect(useAudioRecorder().startRecording).toHaveBeenCalled(); // Check if startRecording was called

    // Mock the hook return value to simulate recording state
    useAudioRecorder.mockReturnValue({
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      audioBlob: null,
      audioUrl: null,
      recorderState: 'recording', // Simulate recording state
      isSupported: true,
      resetRecording: jest.fn(),
      recordingTime: 5, // Simulate some recording time
    });
     render(<ContrastClarityReflection />); // Re-render to pick up mock change

    // Click Stop Recording
    fireEvent.click(screen.getByRole('button', { name: /Stop Recording/i }));
    expect(useAudioRecorder().stopRecording).toHaveBeenCalled(); // Check if stopRecording was called

    // Note: Testing the full audio flow including playing, deleting, and saving
    // the recorded audio requires more intricate mocking of the audio element
    // and the hook's state transitions, which is beyond the scope of these basic fixes.
    // The primary goal here is to fix the current element not found errors.
  });

  // TODO: Add tests for audio playback, delete, and saving recorded audio.
}); 