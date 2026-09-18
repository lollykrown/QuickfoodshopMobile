// Lightweight expo-router stand-in. Tests drive it with the helpers at the bottom:
//   const { __router, __setParams, __setPathname } = require('expo-router');
const React = require('react');
const { View, Text } = require('react-native');

const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
};

let params = {};
let pathname = '/';

const useRouter = () => router;
const useLocalSearchParams = () => params;
const useGlobalSearchParams = () => params;
const usePathname = () => pathname;
const useSegments = () => pathname.split('/').filter(Boolean);
const useFocusEffect = (cb) => React.useEffect(() => cb(), [cb]);

const Link = ({ href, asChild, children, ...props }) => {
  const onPress = () => router.push(href);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onPress });
  }
  return React.createElement(Text, { ...props, onPress, accessibilityRole: 'link' }, children);
};

const Redirect = ({ href }) =>
  React.createElement(Text, { testID: 'redirect' }, String(href));

const Slot = () => React.createElement(View, { testID: 'slot' });

// Options are exposed as JSON on accessibilityValue.text (functions are dropped):
//   JSON.parse(screen.getByTestId('screen:modal').props.accessibilityValue.text)
const Screen = ({ name, options }) =>
  React.createElement(
    View,
    { testID: `screen:${name}`, accessibilityValue: { text: JSON.stringify(options ?? {}) } },
    options && options.title ? React.createElement(Text, null, options.title) : null,
    options && options.tabBarIcon
      ? [true, false].map((focused) =>
          React.createElement(
            View,
            { key: String(focused), testID: `tabicon:${name}:${focused ? 'focused' : 'idle'}` },
            options.tabBarIcon({ color: '#000', focused }),
          ),
        )
      : null,
    options && options.tabBarBadge != null
      ? React.createElement(Text, { testID: `badge:${name}` }, String(options.tabBarBadge))
      : null,
  );

const Protected = ({ guard, children }) => (guard ? children : null);

const makeNavigator = (testID) => {
  const Navigator = ({ children, screenOptions }) =>
    React.createElement(
      View,
      { testID, accessibilityValue: { text: JSON.stringify(screenOptions ?? {}) } },
      children,
    );
  Navigator.Screen = Screen;
  Navigator.Protected = Protected;
  return Navigator;
};

module.exports = {
  useRouter,
  useLocalSearchParams,
  useGlobalSearchParams,
  usePathname,
  useSegments,
  useFocusEffect,
  Link,
  Redirect,
  Slot,
  Stack: makeNavigator('stack'),
  Tabs: makeNavigator('tabs'),
  router,
  __router: router,
  __setParams: (p) => {
    params = p || {};
  },
  __setPathname: (p) => {
    pathname = p;
  },
  __reset: () => {
    params = {};
    pathname = '/';
    Object.values(router).forEach((fn) => fn.mockClear && fn.mockClear());
    router.canGoBack.mockImplementation(() => true);
  },
};
