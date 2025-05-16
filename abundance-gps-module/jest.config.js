module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.js'], // if you have one, e.g., for @testing-library/jest-dom
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    // Handle CSS imports (if any) or other non-JS assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // You might need to map paths if using aliases
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverage: true,
  coverageReporters: ["json", "html", "text", "lcov"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
    "/dist/",
    // Files that are mostly boilerplate or stubs can be ignored initially
    "src/hooks/useSpeechSynthesis.js", // Example if it's a stub
    "src/hooks/useAudioRecorder.js",  // Example if it's a stub
    "src/components/common/Modal.js", // Example if it's a stub
    "src/components/common/Icon.js", // Example if complex icon handling is stubbed
    "src/components/common/LoadingSpinner.js",
    "src/components/OpennessPrimer/SequenceMemoryTap.js", // If mostly stubbed
    // Add other specific files that are not yet fully implemented
  ],
};