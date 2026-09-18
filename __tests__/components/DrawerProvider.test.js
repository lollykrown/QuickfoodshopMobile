import { Alert, Modal, PanResponder, StyleSheet, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { __router } from 'expo-router';
import DrawerProvider, { useDrawer } from '@/contexts/DrawerProvider';

const user = { firstName: 'Ada', lastName: 'Lovelace', role: 'customer', image: 'https://example.com/a.png' };

// Exposes the drawer API through buttons.
function Controls() {
  const drawer = useDrawer();
  return (
    <>
      <Text onPress={drawer.open}>ctl-open</Text>
      <Text onPress={drawer.close}>ctl-close</Text>
      <Text onPress={drawer.toggle}>ctl-toggle</Text>
    </>
  );
}

function setup(props = {}) {
  const items = props.drawerItems ?? [
    { label: 'Dashboard', icon: 'view-dashboard', active: true, onPress: jest.fn() },
    { label: 'Orders', icon: 'human-queue', active: false, badge: 3, onPress: jest.fn() },
  ];
  const logout = jest.fn();
  render(
    <PaperProvider>
      <DrawerProvider drawerItems={items} user={user} logout={logout} isLoggedIn {...props}>
        <Controls />
      </DrawerProvider>
    </PaperProvider>,
  );
  return { items, logout };
}

const openDrawer = () => fireEvent.press(screen.getByText('ctl-open'));

let alertSpy;
beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => alertSpy.mockRestore());

describe('useDrawer', () => {
  it('is null outside a provider', () => {
    let value = 'unset';
    function Probe() {
      value = useDrawer();
      return null;
    }
    render(<Probe />);
    expect(value).toBeNull();
  });
});

describe('DrawerProvider', () => {
  it('renders children and keeps the drawer closed initially', () => {
    setup();
    expect(screen.getByText('ctl-open')).toBeTruthy();
    expect(screen.queryByText('Menu')).toBeNull();
    expect(screen.queryByText('Dashboard')).toBeNull();
  });

  it('opens with open() and lists the menu items', () => {
    setup();

    openDrawer();

    expect(screen.getByText('Menu')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Orders')).toBeTruthy();
  });

  it('shows a badge on items that have one', () => {
    setup();
    openDrawer();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('closes with close() and toggles with toggle()', () => {
    setup();

    openDrawer();
    fireEvent.press(screen.getByText('ctl-close'));
    expect(screen.queryByText('Menu')).toBeNull();

    fireEvent.press(screen.getByText('ctl-toggle'));
    expect(screen.getByText('Menu')).toBeTruthy();
    fireEvent.press(screen.getByText('ctl-toggle'));
    expect(screen.queryByText('Menu')).toBeNull();
  });

  it('runs an item\'s handler and then closes the drawer', async () => {
    const { items } = setup();
    openDrawer();

    fireEvent.press(screen.getByText('Orders'));

    expect(items[1].onPress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Menu')).toBeNull());
  });

  it('logo press goes home and closes the drawer', async () => {
    setup();
    openDrawer();

    fireEvent.press(screen.getAllByTestId('expo-image')[0]);

    expect(__router.replace).toHaveBeenCalledWith('/home');
    await waitFor(() => expect(screen.queryByText('Menu')).toBeNull());
  });

  describe('signed in', () => {
    it('shows the user\'s name and role, and opens the account page when pressed', () => {
      setup();
      openDrawer();

      expect(screen.getByText('Ada Lovelace')).toBeTruthy();
      expect(screen.getByText('customer')).toBeTruthy();

      fireEvent.press(screen.getByText('Ada Lovelace'));

      expect(__router.push).toHaveBeenCalledWith('/dashboard/account');
      expect(screen.queryByText('Menu')).toBeNull();
    });

    it('asks for confirmation before logging out', () => {
      const { logout } = setup();
      openDrawer();

      fireEvent.press(screen.getByText('Log Out'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.any(Array),
      );
      expect(logout).not.toHaveBeenCalled();
      expect(screen.queryByText('Menu')).toBeNull();
    });

    it('logs out only when the alert is confirmed', () => {
      const { logout } = setup();
      openDrawer();
      fireEvent.press(screen.getByText('Log Out'));
      const buttons = alertSpy.mock.calls[0][2];

      expect(buttons.map((b) => b.text)).toEqual(['Cancel', 'Logout']);
      act(() => buttons[0].onPress?.());
      expect(logout).not.toHaveBeenCalled();

      act(() => buttons[1].onPress());
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('signed out', () => {
    it('shows the menu without logout or a user card', () => {
      setup({ isLoggedIn: false, user: null });
      openDrawer();

      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.queryByText('Log Out')).toBeNull();
      expect(screen.queryByText('Ada Lovelace')).toBeNull();
    });
  });
});

describe('DrawerProvider (gestures and dismissal)', () => {
  let config;

  beforeEach(() => {
    const create = PanResponder.create;
    jest.spyOn(PanResponder, 'create').mockImplementation((c) => {
      config = c;
      return create(c);
    });
  });
  afterEach(() => PanResponder.create.mockRestore());

  const release = (gesture) => act(() => config.onPanResponderRelease(null, gesture));

  it('closes on Android back (onRequestClose)', () => {
    setup();
    openDrawer();

    act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());

    expect(screen.queryByText('Menu')).toBeNull();
  });

  it('closes when the dimmed overlay is tapped', () => {
    setup();
    openDrawer();

    // The overlay is the full-screen (absoluteFill) pressable behind the drawer.
    const [overlay] = screen.UNSAFE_root.findAll((node) => {
      const style = StyleSheet.flatten(node.props.style);
      return typeof node.props.onPress === 'function' && style?.top === 0 && style?.bottom === 0;
    });
    fireEvent.press(overlay);

    expect(screen.queryByText('Menu')).toBeNull();
  });

  describe('a left-hand drawer', () => {
    it('only claims mostly-horizontal drags', () => {
      setup();
      expect(config.onMoveShouldSetPanResponder(null, { dx: 30, dy: 5 })).toBe(true);
      expect(config.onMoveShouldSetPanResponder(null, { dx: 3, dy: 0 })).toBe(false);
      expect(config.onMoveShouldSetPanResponder(null, { dx: 30, dy: 40 })).toBe(false);
    });

    it('follows the finger while dragging', () => {
      setup();
      openDrawer();
      expect(() => {
        config.onPanResponderMove(null, { dx: -50 });
        config.onPanResponderMove(null, { dx: 500 }); // clamped, not an error
        config.onPanResponderMove(null, { dx: -900 });
      }).not.toThrow();
    });

    it('stays open after a long drag or a fast flick', () => {
      setup();
      openDrawer();

      release({ dx: 120, vx: 0 });
      expect(screen.getByText('Menu')).toBeTruthy();

      release({ dx: 5, vx: 0.9 });
      expect(screen.getByText('Menu')).toBeTruthy();
    });

    it('closes after a short, slow drag', () => {
      setup();
      openDrawer();

      release({ dx: 10, vx: 0 });

      expect(screen.queryByText('Menu')).toBeNull();
    });
  });

  describe('a right-hand drawer', () => {
    it('stays open after a long leftward drag or a fast leftward flick', () => {
      setup({ side: 'right' });
      openDrawer();

      release({ dx: -120, vx: 0 });
      expect(screen.getByText('Menu')).toBeTruthy();

      release({ dx: -5, vx: -0.9 });
      expect(screen.getByText('Menu')).toBeTruthy();
    });

    it('closes after a short drag, and tracks the finger while dragging', () => {
      setup({ side: 'right' });
      openDrawer();

      expect(() => {
        config.onPanResponderMove(null, { dx: 50 });
        config.onPanResponderMove(null, { dx: -500 });
      }).not.toThrow();
      release({ dx: -10, vx: 0 });

      expect(screen.queryByText('Menu')).toBeNull();
    });
  });
});
