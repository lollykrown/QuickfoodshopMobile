// Jest resolver = React Native's (jest-expo's default) + react-native-worklets'.
//  - RN's lets `react-native/Libraries/...` subpaths resolve so they can be mocked.
//  - worklets' skips its native-only files, so Reanimated 4's mock can load under Jest.
// jest-expo already sets `resolver`, and Jest allows only one, so they are chained here.
const rnResolver = require('@react-native/jest-preset/jest/resolver');
const workletsResolver = require('react-native-worklets/jest/resolver');

module.exports = (request, options) =>
  workletsResolver(request, {
    ...options,
    defaultResolver: (path, opts) =>
      rnResolver(path, { ...opts, defaultResolver: options.defaultResolver }),
  });
