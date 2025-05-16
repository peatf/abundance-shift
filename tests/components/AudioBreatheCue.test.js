import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioBreatheCue from '@src/components/AudioBreatheCue';
import { useAbundanceStore } from '@src/store/abundanceStore';
import useWebAudioTones from '@src/hooks/useWebAudioTones';
import useSpeechSynthesis from '@src/hooks/useSpeechSynthesis';

jest.mock('@src/store/abundanceStore');
jest.mock('@src/hooks/useWebAudioTones');
jest.mock('@src/hooks/useSpeechSynthesis');

describe('AudioBreatheCue Component', () => {
  const mockPlayTone = jest.fn();
  const mockSpeak = jest.fn();
  const mockStopAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    useWebAudioTones.mockReturnValue({
      playTone: mockPlayTone,
      stopAll: mockStopAll
    });
    
    useSpeechSynthesis.mockReturnValue({
      speak: mockSpeak,
      cancel: jest.fn()
    });
    
    useAbundanceStore.mockReturnValue({
      finishImmediateReliefPractice: jest.fn()
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('starts breath cycle on mount', () => {
    render(<AudioBreatheCue />);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockSpeak).toHaveBeenCalledWith('Breathe in');
    expect(mockPlayTone).toHaveBeenCalled();
  });

  test('cycles through breath phases', () => {
    render(<AudioBreatheCue />);
    
    act(() => {
      jest.advanceTimersByTime(3000); // Inhale
    });
    expect(mockSpeak).toHaveBeenCalledWith('Hold');
    
    act(() => {
      jest.advanceTimersByTime(3000); // Hold
    });
    expect(mockSpeak).toHaveBeenCalledWith('Breathe out');
  });

  test('pauses and resumes breath cycle', () => {
    render(<AudioBreatheCue />);
    
    fireEvent.click(screen.getByText('Pause'));
    expect(mockStopAll).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Resume'));
    expect(mockSpeak).toHaveBeenCalledWith('Breathe in');
  });

  test('toggles chime-only mode', () => {
    render(<AudioBreatheCue />);
    fireEvent.click(screen.getByLabelText('Chime-only mode'));
    expect(mockSpeak).not.toHaveBeenCalled();
    expect(mockPlayTone).toHaveBeenCalled();
  });

  // TODO: Test full 90s cycle completion
  // TODO: Test visual pulse animation states
}); 