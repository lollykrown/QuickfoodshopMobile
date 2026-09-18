import { PaperProvider } from 'react-native-paper';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import Favorites from '@/app/dashboard/favorites';
import Notifications from '@/app/dashboard/notifications';
import NotificationDetail from '@/app/dashboard/notifications/[notificationId]';
import Settings from '@/app/dashboard/settings';
import { useAuth } from '@/contexts/authContext';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));

const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);
const logout = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ logout, loading: false, user: { image: 'u.png' }, avatar: 'a.png' });
});

// Every dashboard screen has the same app bar: back on the left, drawer toggle on the right.
const itHasStandardAppBar = (render_) =>
  it('goes back and toggles the drawer from the app bar', () => {
    render_();
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });

describe('Settings', () => {
  const switches = () => screen.getAllByRole('switch');

  it('lists the three notification channels with their default state', () => {
    renderWithPaper(<Settings />);

    expect(screen.getByText('Email Notification')).toBeTruthy();
    expect(screen.getByText('SMS Notification')).toBeTruthy();
    expect(screen.getByText('Push Notification')).toBeTruthy();
    // email on, SMS off, push on
    expect(switches().map((s) => s.props.value)).toEqual([true, false, true]);
  });

  it.each([
    ['email', 0, [false, false, true]],
    ['SMS', 1, [true, true, true]],
    ['push', 2, [true, false, false]],
  ])('the %s switch flips only its own channel', (_name, index, expected) => {
    renderWithPaper(<Settings />);

    fireEvent(switches()[index], 'valueChange', !switches()[index].props.value);

    expect(switches().map((s) => s.props.value)).toEqual(expected);
  });

  it('logs out from the Log out row', () => {
    renderWithPaper(<Settings />);
    fireEvent.press(screen.getByText('Log out'));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  itHasStandardAppBar(() => renderWithPaper(<Settings />));
});

describe('Favorites', () => {
  it('shows the saved items', () => {
    renderWithPaper(<Favorites />);

    expect(screen.getAllByText('Rice and Jollof with vegetables salad')).toHaveLength(3);
    expect(screen.getAllByText('Open Sea Restaurant')).toHaveLength(3);
    expect(screen.getAllByText('£150.00')).toHaveLength(3);
    expect(screen.getAllByTestId('icon-trash')).toHaveLength(3);
  });

  itHasStandardAppBar(() => renderWithPaper(<Favorites />));
});

describe('Notifications', () => {
  it('lists the notifications and opens one', () => {
    __setParams({ prev: 'home' });
    renderWithPaper(<Notifications />);

    expect(screen.getByText('Mark All Read')).toBeTruthy();
    expect(screen.getAllByText('New restaurant added !')).toHaveLength(4);

    fireEvent.press(screen.getAllByText('New restaurant added !')[1]);

    expect(__router.push).toHaveBeenCalledWith('/dashboard/notifications/2');
  });

  itHasStandardAppBar(() => renderWithPaper(<Notifications />));
});

describe('NotificationDetail', () => {
  it('shows the notification', () => {
    __setParams({ notificationId: '2' });
    renderWithPaper(<NotificationDetail />);

    expect(screen.getByText('New restaurant added !')).toBeTruthy();
    expect(screen.getByText('Open Sea Restaurant')).toBeTruthy();
    expect(screen.getByTestId('expo-image').props.source).toEqual({ uri: 'https://picsum.photos/500' });
  });

  itHasStandardAppBar(() => renderWithPaper(<NotificationDetail />));
});
