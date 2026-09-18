// Runs before each test file's environment is set up: native-module mocks.

// constants/config.js warns when the key is missing; tests get a placeholder (config.test.js overrides it).
process.env.EXPO_PUBLIC_GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 'test-google-key';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// In-memory keychain. `__store` is exposed so tests can seed/inspect it.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});

jest.mock('expo-router', () => require('./mocks/expo-router'));

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

// expo-image is a native view; render a plain View that keeps the props tests care about
// (source, accessibilityLabel, onLoadEnd via fireEvent(image, 'loadEnd')).
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Image = React.forwardRef(function MockExpoImage(props, ref) {
    return React.createElement(View, { ...props, ref, testID: props.testID ?? 'expo-image' });
  });
  return { Image };
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
