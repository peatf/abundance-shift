import '@testing-library/jest-dom';

// Mock any global browser APIs that might be needed in tests
global.navigator = {
  userAgent: 'node.js',
};

// If you're mocking Media APIs
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = jest.fn();