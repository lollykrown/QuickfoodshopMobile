module.exports = {
  preset: 'jest-expo',
  // Watchman can't read ~/Documents on macOS (see metro.config.js); use Jest's Node crawler.
  watchman: false,
  setupFiles: ['<rootDir>/jest/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest/setupAfterEnv.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@expo/vector-icons(/.*)?$': '<rootDir>/jest/mocks/vector-icons.js',
  },
  // Tests live in __tests__/ (not app/, where Expo Router would treat them as routes).
  testMatch: ['<rootDir>/__tests__/**/*.test.{js,jsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'contexts/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    'services/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    'constants/**/*.{js,jsx}',
  ],
};
