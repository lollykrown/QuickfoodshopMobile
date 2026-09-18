import * as SplashScreen from 'expo-splash-screen';
import { render, screen } from '@testing-library/react-native';
import { __setPathname } from 'expo-router';
import RootLayout from '@/app/_layout';
import { useAuth } from '@/contexts/authContext';

// Providers become pass-throughs so the layout's own logic is what's under test.
jest.mock('@/contexts/authContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: jest.fn(),
}));
jest.mock('@/contexts/cartContext', () => ({ CartProvider: ({ children }) => children }));
let mockDrawerProps;
jest.mock('@/contexts/DrawerProvider', () => ({
  __esModule: true,
  default: (props) => {
    mockDrawerProps = props;
    return props.children;
  },
}));

const logout = jest.fn();
const auth = (overrides = {}) => ({
  isLoggedIn: false,
  user: null,
  loading: false,
  logout,
  ...overrides,
});

// Captured before any test clears mocks: the layout holds the splash screen at import time.
const preventedAtImport = SplashScreen.preventAutoHideAsync.mock.calls.length;

beforeEach(() => {
  SplashScreen.hideAsync.mockClear();
  mockDrawerProps = undefined;
});

describe('RootLayout', () => {
  it('keeps the native splash screen up while the app boots', () => {
    expect(preventedAtImport).toBe(1);
  });

  it('renders nothing (and keeps the splash) while auth is loading', () => {
    useAuth.mockReturnValue(auth({ loading: true }));
    render(<RootLayout />);

    expect(screen.toJSON()).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('hides the splash once auth has loaded', () => {
    useAuth.mockReturnValue(auth());
    render(<RootLayout />);

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('hides the splash only once, however often it re-renders', () => {
    useAuth.mockReturnValue(auth());
    const { rerender } = render(<RootLayout />);

    rerender(<RootLayout />);
    rerender(<RootLayout />);

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  describe('routes', () => {
    it('registers the public screens', () => {
      useAuth.mockReturnValue(auth());
      render(<RootLayout />);

      ['(tabs)', '(auth)', 'stores', 'index', 'modal'].forEach((name) =>
        expect(screen.getByTestId(`screen:${name}`)).toBeTruthy(),
      );
    });

    it('hides the dashboard from signed-out users', () => {
      useAuth.mockReturnValue(auth({ isLoggedIn: false }));
      render(<RootLayout />);
      expect(screen.queryByTestId('screen:dashboard')).toBeNull();
    });

    it('exposes the dashboard to signed-in users', () => {
      useAuth.mockReturnValue(auth({ isLoggedIn: true, user: { role: 'customer' } }));
      render(<RootLayout />);
      expect(screen.getByTestId('screen:dashboard')).toBeTruthy();
    });

    it('presents the login screen as a titled form sheet', () => {
      useAuth.mockReturnValue(auth());
      render(<RootLayout />);
      expect(screen.getByText('Login')).toBeTruthy();
    });
  });

  describe('drawer wiring', () => {
    it('gives signed-out users a single login entry', () => {
      useAuth.mockReturnValue(auth());
      render(<RootLayout />);

      expect(mockDrawerProps.drawerItems.map((i) => i.label)).toEqual(['Login to account']);
      expect(mockDrawerProps.isLoggedIn).toBe(false);
      expect(mockDrawerProps.side).toBe('left');
    });

    it('builds the menu from the signed-in user\'s role', () => {
      const user = { role: 'vendor', firstName: 'Ada' };
      useAuth.mockReturnValue(auth({ isLoggedIn: true, user }));
      render(<RootLayout />);

      expect(mockDrawerProps.drawerItems.map((i) => i.label)).toContain('My Store');
      expect(mockDrawerProps.user).toBe(user);
      expect(mockDrawerProps.logout).toBe(logout);
    });

    it('marks the entry for the current path active', () => {
      __setPathname('/dashboard/orders');
      useAuth.mockReturnValue(auth({ isLoggedIn: true, user: { role: 'customer' } }));
      render(<RootLayout />);

      const active = mockDrawerProps.drawerItems.filter((i) => i.active).map((i) => i.label);
      expect(active).toEqual(['Orders']);
    });
  });

  it('shows the logging-out overlay if auth starts loading again after boot', () => {
    useAuth.mockReturnValue(auth({ isLoggedIn: true, user: { role: 'customer' } }));
    const { rerender } = render(<RootLayout />);
    expect(screen.queryByText('Logging out...')).toBeNull();

    useAuth.mockReturnValue(auth({ isLoggedIn: true, user: { role: 'customer' }, loading: true }));
    rerender(<RootLayout />);

    expect(screen.getByText('Logging out...')).toBeTruthy();
  });
});
