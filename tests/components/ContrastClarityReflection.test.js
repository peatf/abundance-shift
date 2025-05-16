import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContrastClarityReflection from '@src/components/ContrastClarityReflection';
import { useAbundanceStore } from '@src/store/abundanceStore';
import useAudioRecorder from '@src/hooks/useAudioRecorder';

// Mock dependencies
jest.mock('@src/store/abundanceStore');
jest.mock('@src/hooks/useAudioRecorder');

const mockSetClarityReflection = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  useAbundanceStore.mockReturnValue({
    setClarityReflectionText: mockSetClarityReflection,
    setClarityReflectionAudio: mockSetClarityReflection
  });
  
  useAudioRecorder.mockReturnValue({
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    deleteRecording: jest.fn(),
    audioUrl: null,
    recorderState: 'idle'
  });
});

describe('ContrastClarityReflection Component', () => {
  test('defaults to text input mode', () => {
    render(<ContrastClarityReflection />);
    expect(screen.getByLabelText('Your Reflection')).toBeInTheDocument();
    expect(screen.getByText('Record Audio Instead')).toBeInTheDocument();
  });

  test('switches to audio recording mode', () => {
    render(<ContrastClarityReflection />);
    fireEvent.click(screen.getByText('Record Audio Instead'));
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
    expect(screen.getByText('Switch to Text')).toBeInTheDocument();
  });

  test('handles text reflection submission', () => {
    render(<ContrastClarityReflection />);
    fireEvent.change(screen.getByLabelText('Your Reflection'), {
      target: { value: 'Test reflection' }
    });
    fireEvent.click(screen.getByText('Save'));
    expect(mockSetClarityReflection).toHaveBeenCalledWith('Test reflection');
  });

  test('handles audio recording flow', () => {
    useAudioRecorder.mockReturnValueOnce({
      ...useAudioRecorder(),
      recorderState: 'recording'
    });
    
    render(<ContrastClarityReflection />);
    fireEvent.click(screen.getByText('Record Audio Instead'));
    fireEvent.click(screen.getByText('Start Recording'));
    expect(useAudioRecorder().startRecording).toHaveBeenCalled();
    
    // Simulate recording state
    useAudioRecorder.mockReturnValueOnce({
      ...useAudioRecorder(),
      recorderState: 'recorded',
      audioUrl: 'test-audio-url'
    });
    
    fireEvent.click(screen.getByText('Save'));
    expect(mockSetClarityReflection).toHaveBeenCalledWith('test-audio-url');
  });
}); 