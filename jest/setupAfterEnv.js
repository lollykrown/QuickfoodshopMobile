// Runs after the Jest framework is installed: shared lifecycle + quieter output.
const AsyncStorage = require('@react-native-async-storage/async-storage');

// The app logs a lot of debug output (auth responses, paths, etc.); keep test output readable.
// console.warn / console.error stay visible so real React warnings are still noticed.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

beforeEach(async () => {
  require('expo-secure-store').__store.clear();
  require('expo-router').__reset();
  await (AsyncStorage.default ?? AsyncStorage).clear();
});
