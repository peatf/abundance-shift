import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from '../../src/hooks/useAudioRecorder';

// Setup browser API mocks
beforeAll(() => {
  // Mock navigator.mediaDevices
  if (!global.navigator) {
    global.navigator = {};
  }
  
  if (!global.navigator.mediaDevices) {
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn()
    };
  }

  // Mock MediaRecorder
  global.MediaRecorder = class {
    constructor() {
      this.start = jest.fn();
      this.stop = jest.fn();
      this.pause = jest.fn();
      this.resume = jest.fn();
    }
    addEventListener = jest.fn();
    static isTypeSupported = jest.fn(() => true);
  };

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
});

describe('Edge Cases', () => {
  it('should handle permission denial gracefully', async () => {
    navigator.mediaDevices.getUserMedia.mockImplementationOnce(() => 
      Promise.reject(new Error('Permission denied'))
    );
    
    const { result } = renderHook(() => useAudioRecorder());
    await act(async () => {
      await result.current.startRecording();
    });
    
    expect(result.current.recorderState).toBe('inactive');
  });

  it('should recover after errors', async () => {
    // First simulate an error
    global.navigator.mediaDevices.getUserMedia = jest.fn(() => 
      Promise.reject(new Error('Device error'))
    );
    
    const { result } = renderHook(() => useAudioRecorder());
    await act(async () => {
      await result.current.startRecording();
    });
    
    // Then allow success
    global.navigator.mediaDevices.getUserMedia = jest.fn(() => 
      Promise.resolve({ getTracks: () => [] })
    );
    
    expect(result.current.recorderState).toBe('inactive');
  });

  it('should handle browser compatibility', () => {
    const originalMediaDevices = global.navigator.mediaDevices;
    delete global.navigator.mediaDevices;
    
    const { result } = renderHook(() => useAudioRecorder());
    expect(result.current.isSupported).toBe(false);
    
    global.navigator.mediaDevices = originalMediaDevices;
  });
});