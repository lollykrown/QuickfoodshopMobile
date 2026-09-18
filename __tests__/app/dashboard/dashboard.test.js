import { Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Dashboard from '@/app/dashboard';
import Account from '@/app/dashboard/account';
import { useAuth } from '@/contexts/authContext';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));

// react-native-svg-charts is an old chart lib; capture what the screen feeds it.
let mockBarChartProps;
let mockXAxisProps;
jest.mock('react-native-svg-charts', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BarChart: (props) => {
      mockBarChartProps = props;
      return React.createElement(View, { testID: 'bar-chart' }, props.children);
    },
    Grid: () => null,
    XAxis: (props) => {
      mockXAxisProps = props;
      return React.createElement(View, { testID: 'x-axis' });
    },
  };
});

const user = (role) => ({ firstName: 'ada', lastName: 'lovelace', role, image: 'a.png' });
const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockBarChartProps = undefined;
  mockXAxisProps = undefined;
  useAuth.mockReturnValue({ user: user('customer'), avatar: 'avatar.png', logout: jest.fn(), loading: false });
});

describe('Dashboard', () => {
  it('welcomes the user by name', () => {
    renderWithPaper(<Dashboard />);

    expect(screen.getByText('Welcome Back!')).toBeTruthy();
    expect(screen.getByText('ada lovelace')).toBeTruthy();
  });

  it('links the bell to notifications', () => {
    renderWithPaper(<Dashboard />);
    fireEvent.press(screen.getByTestId('icon-notifications-outline'));
    expect(__router.push).toHaveBeenCalledWith('/dashboard/notifications?prev=dash');
  });

  it('goes back and toggles the drawer', () => {
    renderWithPaper(<Dashboard />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });

  it('lists recent orders and opens one', () => {
    renderWithPaper(<Dashboard />);

    expect(screen.getByText('Recent Orders')).toBeTruthy();
    expect(screen.getAllByText('Open Sea restaurant')).toHaveLength(9);

    fireEvent.press(screen.getAllByText('Open Sea restaurant')[2]);
    expect(__router.push).toHaveBeenCalledWith('/dashboard/orders/3');
  });

  describe('as a customer', () => {
    it('shows My Orders and Transactions shortcuts, and no vendor widgets', () => {
      renderWithPaper(<Dashboard />);

      fireEvent.press(screen.getByText('My Orders'));
      expect(__router.push).toHaveBeenLastCalledWith('/dashboard/orders');
      fireEvent.press(screen.getByText('Transactions'));
      expect(__router.push).toHaveBeenLastCalledWith('/dashboard/transactions');

      expect(screen.queryByText('Total Income')).toBeNull();
      expect(screen.queryByTestId('bar-chart')).toBeNull();
    });
  });

  describe('as a vendor', () => {
    beforeEach(() =>
      useAuth.mockReturnValue({ user: user('vendor'), avatar: 'avatar.png', logout: jest.fn(), loading: false }),
    );

    it('shows income, order and vendor tiles that link onwards', () => {
      renderWithPaper(<Dashboard />);

      fireEvent.press(screen.getByText('Total Income'));
      expect(__router.push).toHaveBeenLastCalledWith('/dashboard/orders');
      fireEvent.press(screen.getByText('All Orders'));
      expect(__router.push).toHaveBeenLastCalledWith('/dashboard/orders');
      fireEvent.press(screen.getByText('Vendors'));
      expect(__router.push).toHaveBeenLastCalledWith('/dashboard/transactions');

      expect(screen.queryByText('My Orders')).toBeNull();
    });

    it('draws a weekly bar chart labelled Mon-Sun', () => {
      renderWithPaper(<Dashboard />);

      expect(screen.getByTestId('bar-chart')).toBeTruthy();
      const labels = mockBarChartProps.data.map((_, i) => mockXAxisProps.formatLabel(null, i));
      expect(labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('colours bars by load: green up to 40, amber up to 80, red above', () => {
      renderWithPaper(<Dashboard />);

      const fills = mockBarChartProps.data.map((d) => [d.value, d.svg.fill]);
      expect(fills).toEqual([
        [50, '#F59E0B'],
        [10, '#10B981'],
        [40, '#10B981'],
        [95, '#EF4444'],
        [85, '#EF4444'],
        [70, '#F59E0B'],
        [35, '#10B981'],
      ]);
    });
  });

  describe('as a rider', () => {
    it('shows neither the customer nor the vendor tiles', () => {
      useAuth.mockReturnValue({ user: user('rider'), avatar: 'avatar.png', logout: jest.fn(), loading: false });
      renderWithPaper(<Dashboard />);

      expect(screen.queryByText('My Orders')).toBeNull();
      expect(screen.queryByText('Total Income')).toBeNull();
      expect(screen.getByText('Recent Orders')).toBeTruthy();
    });
  });
});

describe('Account', () => {
  let alertSpy;
  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => alertSpy.mockRestore());

  it('shows who is signed in and as what', () => {
    renderWithPaper(<Account />);

    expect(screen.getByText('My Account')).toBeTruthy();
    expect(screen.getByText('ada lovelace')).toBeTruthy();
    expect(screen.getByText('customer Account')).toBeTruthy();
  });

  it('opens edit-profile and change-password', () => {
    renderWithPaper(<Account />);

    fireEvent.press(screen.getByText('Edit Profile'));
    expect(__router.push).toHaveBeenLastCalledWith('/dashboard/account/edit-profile');

    fireEvent.press(screen.getByText('Change Password'));
    expect(__router.push).toHaveBeenLastCalledWith('/dashboard/account/changePassword');
  });

  it('asks before logging out, and logs out only when confirmed', () => {
    const logout = jest.fn();
    useAuth.mockReturnValue({ user: user('customer'), avatar: 'a.png', logout, loading: false });
    renderWithPaper(<Account />);

    fireEvent.press(screen.getByText('Log out'));

    expect(alertSpy).toHaveBeenCalledWith('Logout', 'Are you sure you want to logout?', expect.any(Array));
    expect(logout).not.toHaveBeenCalled();
    const [, confirm] = alertSpy.mock.calls[0][2];
    confirm.onPress();
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('shows progress and blocks a second tap while logging out', () => {
    useAuth.mockReturnValue({ user: user('customer'), avatar: 'a.png', logout: jest.fn(), loading: true });
    renderWithPaper(<Account />);

    expect(screen.getByText('Logging out...')).toBeTruthy();
    fireEvent.press(screen.getByText('Logging out...'));
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('goes back and toggles the drawer', () => {
    renderWithPaper(<Account />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});
