import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import AuthLayout from '@/app/(auth)/_layout';
import LoginRedirect from '@/app/(auth)/[role]/login';
import ModalScreen from '@/app/modal';

jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));

describe('(auth) layout', () => {
  it('renders the auth screens for signed-out users', () => {
    useAuth.mockReturnValue({ isLoggedIn: false });
    render(<AuthLayout />);

    expect(screen.getByTestId('slot')).toBeTruthy();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('sends signed-in users to /home instead', () => {
    useAuth.mockReturnValue({ isLoggedIn: true });
    render(<AuthLayout />);

    expect(screen.getByTestId('redirect').props.children).toBe('/home');
    expect(screen.queryByTestId('slot')).toBeNull();
  });
});

describe('/[role]/login', () => {
  it('immediately forwards to the login modal, keeping role and prev', () => {
    __setParams({ role: 'vendor', prev: 'home' });
    render(<LoginRedirect />);

    expect(__router.replace).toHaveBeenCalledWith('/modal?role=vendor&prev=home');
  });
});

describe('login modal', () => {
  const login = jest.fn();

  const setup = (params = { role: 'customer', prev: 'home' }, auth = {}) => {
    __setParams(params);
    useAuth.mockReturnValue({ login, loading: false, ...auth });
    return render(<ModalScreen />);
  };

  const fill = (email = 'ada@example.com', password = 'secret1') => {
    fireEvent.changeText(screen.getByPlaceholderText('Email'), email);
    fireEvent.changeText(screen.getByPlaceholderText('Password'), password);
  };

  beforeEach(() => login.mockReset());

  it('titles the form with the chosen role', () => {
    setup({ role: 'rider' });
    expect(screen.getByText(/Login\s+as a rider/)).toBeTruthy();
  });

  it('has no role suffix when none is given', () => {
    setup({});
    expect(screen.queryByText(/as a/)).toBeNull();
  });

  it('validates before calling the backend', async () => {
    setup();

    fill('not-an-email', '123');
    fireEvent.press(screen.getByText('Login'));

    expect(await screen.findByText('Invalid email address')).toBeTruthy();
    expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in with the role and goes home on success', async () => {
    login.mockResolvedValue(true);
    setup({ role: 'vendor', prev: 'home' });

    fill();
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => expect(login).toHaveBeenCalledWith('ada@example.com', 'secret1', 'vendor'));
    await waitFor(() => expect(__router.replace).toHaveBeenCalledWith('/home'));
  });

  it('shows the backend error and stays put when login fails', async () => {
    login.mockResolvedValue({ error: 'Invalid credentials' });
    setup();

    fill();
    fireEvent.press(screen.getByText('Login'));

    expect(await screen.findByText('Invalid credentials')).toBeTruthy();
    expect(__router.replace).not.toHaveBeenCalledWith('/home');
  });

  it('links to signup and forgot-password for the same role', () => {
    setup({ role: 'customer' });

    fireEvent.press(screen.getByText('Sign up'));
    expect(__router.push).toHaveBeenCalledWith('customer/signup');

    fireEvent.press(screen.getByText('Forgot Password?'));
    expect(__router.replace).toHaveBeenCalledWith('customer/forgotPassword');
  });

  it('the close button goes home when opened from a screen (prev), else back to the start', () => {
    const { unmount } = setup({ role: 'customer', prev: 'home' });
    fireEvent.press(screen.getByTestId('icon-close'));
    expect(__router.replace).toHaveBeenCalledWith('/home');
    unmount();

    __router.push.mockClear();
    setup({ role: 'customer' });
    fireEvent.press(screen.getByTestId('icon-close'));
    expect(__router.push).toHaveBeenCalledWith('/');
  });

  it('shows a busy label while submitting', () => {
    setup({ role: 'customer' }, { loading: true });
    expect(screen.getByText('Submitting..')).toBeTruthy();
  });
});
