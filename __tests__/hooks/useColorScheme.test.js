import { renderHook } from '@testing-library/react-native';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'dark'),
}));

describe('use-color-scheme (native)', () => {
  it('re-exports the React Native hook', () => {
    const { useColorScheme } = require('@/hooks/use-color-scheme');
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe('dark');
  });
});

describe('use-color-scheme (web)', () => {
  it('renders as "light" until hydrated, then follows the device scheme', () => {
    const { useColorScheme } = require('@/hooks/use-color-scheme.web');
    const seen = [];
    renderHook(() => {
      const scheme = useColorScheme();
      seen.push(scheme);
      return scheme;
    });

    // First (server-compatible) render is always light; the post-hydration render is real.
    expect(seen[0]).toBe('light');
    expect(seen[seen.length - 1]).toBe('dark');
  });
});
