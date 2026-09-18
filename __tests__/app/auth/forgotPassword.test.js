import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import ForgotPassword from '@/app/(auth)/[role]/forgotPassword';
import { forgetPwd } from '@/services/api';

jest.mock('@/services/api', () => ({ forgetPwd: jest.fn() }));

const submit = (email) => {
  fireEvent.changeText(screen.getByPlaceholderText('e.g.email@example.com'), email);
  fireEvent.press(screen.getByText('Send Link'));
};

beforeEach(() => {
  forgetPwd.mockReset();
  __setParams({ role: 'customer' });
});

describe('ForgotPassword', () => {
  it('asks for the registered email', () => {
    render(<ForgotPassword />);

    expect(screen.getByText('Forgot Password')).toBeTruthy();
    expect(screen.getByText('Enter your registered email below')).toBeTruthy();
    expect(screen.getByText('Send Link')).toBeTruthy();
  });

  it('rejects an invalid email without calling the API', async () => {
    render(<ForgotPassword />);

    submit('nope');

    expect(await screen.findByText('Invalid email address')).toBeTruthy();
    expect(forgetPwd).not.toHaveBeenCalled();
  });

  it('requests a reset for the role and shows the "check mail" screen', async () => {
    forgetPwd.mockResolvedValue({ success: true });
    __setParams({ role: 'vendor' });
    render(<ForgotPassword />);

    submit('  ada@example.com ');

    expect(await screen.findByText('Check Mail for OTP')).toBeTruthy();
    expect(forgetPwd).toHaveBeenCalledWith({ email: 'ada@example.com', role: 'vendor' });
    expect(screen.getByText('A verification code has been sent to your email.')).toBeTruthy();
  });

  it('continues to OTP entry carrying the email and role', async () => {
    forgetPwd.mockResolvedValue({ success: true });
    render(<ForgotPassword />);

    submit('ada@example.com');
    fireEvent.press(await screen.findByText('Continue'));

    expect(__router.replace).toHaveBeenCalledWith('/otp?email=ada@example.com&role=customer');
  });

  it('shows the backend error under the field and stays on the form', async () => {
    forgetPwd.mockRejectedValue(new Error('No account with that email'));
    render(<ForgotPassword />);

    submit('ghost@example.com');

    expect(await screen.findByText('No account with that email')).toBeTruthy();
    expect(screen.queryByText('Check Mail for OTP')).toBeNull();
  });

  it('links back to sign in for the same role, and goes back from the app bar', () => {
    __setParams({ role: 'rider' });
    render(<ForgotPassword />);

    fireEvent.press(screen.getByText('Sign in'));
    expect(__router.push).toHaveBeenCalledWith('/rider/login');

    fireEvent.press(screen.getByLabelText('Back'));
    expect(__router.back).toHaveBeenCalled();
  });
});
