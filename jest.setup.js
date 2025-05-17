// abundance-shift/jest.setup.js
import '@testing-library/jest-dom';

// You can add other global setup here if needed. For example:
// Mocking window.matchMedia (common for UI components)
// global.matchMedia = global.matchMedia || function() {
//   return {
//     matches: false,
//     addListener: jest.fn(),
//     removeListener: jest.fn(),
//   };
// };

// If your Zustand store needs any global reset logic for tests, you could put it here,
// but often it's better handled per test suite or via mocks. 

// Mock navigator.mediaDevices
if (!global.navigator.mediaDevices) {
  global.navigator.mediaDevices = {};
}
global.navigator.mediaDevices.getUserMedia = jest.fn();

// Mock MediaRecorder
if (!global.MediaRecorder) {
  global.MediaRecorder = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    isTypeSupported: jest.fn((mimeType) => true), // Assume type is supported
    ondataavailable: null, // Can be set by tests if needed
    onerror: null, // Can be set by tests if needed
    state: 'inactive',
    mimeType: '',
    addEventListener: jest.fn((event, handler) => {
      if (event === 'dataavailable') global.MediaRecorder.mock.ondataavailable = handler;
      if (event === 'error') global.MediaRecorder.mock.onerror = handler;
    }),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
  global.MediaRecorder.isTypeSupported = jest.fn((mimeType) => true);
}


// Mock URL.createObjectURL and revokeObjectURL
if (!window.URL) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn((blob) => `blob:${blob && blob.type ? blob.type : 'unknown'}/${Math.random()}`);
window.URL.revokeObjectURL = jest.fn();

// Mock AudioContext if needed by useWebAudio or similar
if (!window.AudioContext) {
  window.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn(() => ({
      type: '',
      frequency: { setValueAtTime: jest.fn(), value: 440 },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      onended: null,
    })),
    createGain: jest.fn(() => ({
      gain: { setValueAtTime: jest.fn(), value: 1 },
      connect: jest.fn(),
      disconnect: jest.fn(),
    })),
    destination: {},
    currentTime: 0,
    close: jest.fn(),
    resume: jest.fn(),
    suspend: jest.fn(),
    // Add other AudioContext methods/properties if needed
  }));
} 