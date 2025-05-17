// abundance-shift/jest.config.js
module.exports = {
  // Global settings applicable to all projects, or remove if handled per project
  clearMocks: true,
  // Coverage can be collected per project and aggregated if needed
  // collectCoverage: true, // Best to configure this within each project if paths differ
  // coverageDirectory: 'coverage',

  projects: [
    // Configuration for tests in the root directory (e.g., __tests__, tests)
    {
      displayName: 'root-tests',
      rootDir: '<rootDir>',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: [
        '<rootDir>/__tests__/**/*.test.[jt]s?(x)',
        '<rootDir>/tests/**/*.test.[jt]s?(x)',
        '!<rootDir>/abundance-gps-module/tests/**/*.test.[jt]s?(x)'
      ],
      transform: {
        '^.+\.[tj]sx?$': 'babel-jest',
      },
      moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/abundance-gps-module/src/$1',
        '\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      // Define collectCoverageFrom specifically for what's relevant to root tests
      collectCoverageFrom: [
        '<rootDir>/src/**/*.{js,jsx}', // e.g., root hooks
        // Do NOT include submodule here if it's its own project
        '!**/node_modules/**',
        '!**/dist/**',
      ],
    },
    {
      displayName: 'submodule-tests',
      rootDir: '<rootDir>/abundance-gps-module',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'],
      moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
        '\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
      },
      transform: {
        '^.+\.[tj]sx?$': 'babel-jest'
      }
    }
  ],
}; 