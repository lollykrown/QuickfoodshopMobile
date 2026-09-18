import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Index from '@/app/index';
import NotFoundScreen from '@/app/+not-found';
import { useAuth } from '@/contexts/authContext';

jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));

const renderIndexRaw = () =>
  render(
    <PaperProvider>
      <Index />
    </PaperProvider>,
  );

// Render, then let the AsyncStorage launch check finish inside act().
const renderIndex = async () => {
  const utils = renderIndexRaw();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return utils;
};

beforeEach(() => {
  useAuth.mockReturnValue({ isLoggedIn: false, isExisting: null });
});

describe('landing screen (app/index)', () => {
  it('shows a spinner while it checks whether this is the first launch', async () => {
    renderIndexRaw();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    await act(async () => {}); // let the pending check settle
  });

  it('shows the onboarding carousel on the very first launch, and remembers it', async () => {
    await renderIndex();

    expect(await screen.findByText('Local Delivery')).toBeTruthy();
    await expect(AsyncStorage.getItem('alreadyLaunched')).resolves.toBe('true');
  });

  it('skips onboarding on later launches and offers sign-up to new users', async () => {
    await AsyncStorage.setItem('alreadyLaunched', 'true');
    await renderIndex();

    expect(await screen.findByText('How do you want to sign up?')).toBeTruthy();
    expect(screen.queryByText('Local Delivery')).toBeNull();
  });

  it('offers login (no browse option) to returning users', async () => {
    await AsyncStorage.setItem('alreadyLaunched', 'true');
    useAuth.mockReturnValue({ isLoggedIn: false, isExisting: true });
    await renderIndex();

    expect(await screen.findByText('How do you want to login?')).toBeTruthy();
    expect(screen.queryByText('browse store')).toBeNull();
  });

  it('sends signed-in users straight to the home tab', async () => {
    useAuth.mockReturnValue({ isLoggedIn: true, isExisting: true });
    await renderIndex();

    await waitFor(() => expect(__router.replace).toHaveBeenCalledWith('/home'));
  });

  it('stays on the landing screen when signed out', async () => {
    await AsyncStorage.setItem('alreadyLaunched', 'true');
    await renderIndex();
    await screen.findByText('How do you want to sign up?');

    expect(__router.replace).not.toHaveBeenCalled();
  });

  it('keeps going if storage cannot be read', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('disk error'));
    await renderIndex();

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith('Error checking launch status:', expect.any(Error)),
    );
    // never resolves the launch state: still showing the spinner rather than crashing
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    spy.mockRestore();
  });
});

describe('+not-found', () => {
  beforeEach(() => useAuth.mockReturnValue({ avatar: 'avatar.png' }));

  it('explains the page is missing and titles the screen', () => {
    render(<NotFoundScreen />);

    expect(screen.getByText('Oops! Not Found')).toBeTruthy();
    expect(screen.getByText('The requested page is not available')).toBeTruthy();
  });

  it('links back to the home tab', () => {
    render(<NotFoundScreen />);

    act(() => screen.getByText('Go back to Home screen!').props.onPress?.());
    // Link renders a pressable Text; use the press helper for the real interaction
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(screen.getByText('Go back to Home screen!'));

    expect(__router.push).toHaveBeenCalledWith('/home');
  });
});
