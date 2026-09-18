// Stand-in for every @expo/vector-icons entry point (root and per-family subpaths).
// The real icons load fonts asynchronously, which triggers act() warnings and adds nothing to tests.
// Each icon renders as <Text testID="icon-<name>" accessibilityLabel="<name>" />.
const React = require('react');
const { Text } = require('react-native');

function Icon({ name, size, color, ...props }) {
  return React.createElement(Text, {
    accessibilityRole: 'image',
    accessibilityLabel: name,
    testID: `icon-${name}`,
    ...props,
  });
}

// `import Foo from '@expo/vector-icons/Foo'` uses the function itself;
// `import { Foo } from '@expo/vector-icons'` reads a capitalised property, which is also the Icon.
module.exports = new Proxy(Icon, {
  get(target, prop) {
    // Some consumers (e.g. react-native-paper) read `require(...).default` directly.
    if (prop === 'default') return Icon;
    if (prop in target) return Reflect.get(target, prop);
    if (typeof prop === 'string' && /^[A-Z]/.test(prop)) return Icon;
    return undefined;
  },
});
