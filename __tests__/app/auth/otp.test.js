import { Alert, TextInput } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import OTPScreen from '@/app/(auth)/otp';
import { getOTP, resetPwd } from '@/services/api';

jest.mock('@/services/api', () => ({ getOTP: jest.fn(), resetPwd: jest.fn() }));

const digitInputs = () => screen.UNSAFE_getAllByType(TextInput);

const typeCode = (code) =>
  code.split('').forEach((digit, i) => fireEvent.changeText(digitInputs()[i], digit));

let alertSpy;

beforeEach(() => {
  getOTP.mockReset();
  resetPwd.mockReset();
  __setParams({ role: 'customer', email: 'ada@example.com' });
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => alertSpy.mockRestore());

describe('OTP entry', () => {
  it('shows six empty digit boxes', () => {
    render(<OTPScreen />);

    expect(screen.getByText('Check Mail for OTP')).toBeTruthy();
    expect(digitInputs()).toHaveLength(6);
    digitInputs().forEach((input) => expect(input.props.value).toBe(''));
  });

  it('ignores non-numeric input', () => {
    render(<OTPScreen />);

    fireEvent.changeText(digitInputs()[0], 'a');

    expect(digitInputs()[0].props.value).toBe('');
  });

  it('keeps Continue disabled until all six digits are entered', () => {
    render(<OTPScreen />);

    typeCode('123');
    fireEvent.press(screen.getByText('Continue'));

    expect(screen.queryByText('Change New Password')).toBeNull();
  });

  it('moves on to choosing a new password once the sixth digit is typed', () => {
    render(<OTPScreen />);

    typeCode('123456');

    expect(screen.getByText('Change New Password')).toBeTruthy();
    expect(screen.queryByText('Enter the code sent to your email here.')).toBeNull();
  });

  it('accepts a pasted six-digit code in one go', () => {
    render(<OTPScreen />);

    fireEvent.changeText(digitInputs()[0], '654321');

    expect(screen.getByText('Change New Password')).toBeTruthy();
  });

  it('goes back from the app bar', () => {
    render(<OTPScreen />);
    fireEvent.press(screen.getByLabelText('Back'));
    expect(__router.back).toHaveBeenCalled();
  });

  it('Backspace on an empty box does not crash', () => {
    render(<OTPScreen />);
    expect(() =>
      fireEvent(digitInputs()[2], 'keyPress', { nativeEvent: { key: 'Backspace' } }),
    ).not.toThrow();
  });

  describe('resending the code', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('resends to the same email and role, confirms, and starts a 30s cooldown', async () => {
      getOTP.mockResolvedValue({ success: true });
      render(<OTPScreen />);

      await act(async () => fireEvent.press(screen.getByText('Resend OTP')));

      expect(getOTP).toHaveBeenCalledWith({ email: 'ada@example.com', role: 'customer' });
      expect(alertSpy).toHaveBeenCalledWith('OTP has been sent to your email');
      expect(screen.getByText('Resend OTP in 30s')).toBeTruthy();
    });

    it('counts the cooldown down and re-enables resending at zero', async () => {
      getOTP.mockResolvedValue({ success: true });
      render(<OTPScreen />);
      await act(async () => fireEvent.press(screen.getByText('Resend OTP')));

      act(() => jest.advanceTimersByTime(3000));
      expect(screen.getByText('Resend OTP in 27s')).toBeTruthy();

      act(() => jest.advanceTimersByTime(27000));
      expect(screen.getByText('Resend OTP')).toBeTruthy();
    });

    it('does not resend during the cooldown', async () => {
      getOTP.mockResolvedValue({ success: true });
      render(<OTPScreen />);
      await act(async () => fireEvent.press(screen.getByText('Resend OTP')));

      await act(async () => fireEvent.press(screen.getByText(/Resend OTP in/)));

      expect(getOTP).toHaveBeenCalledTimes(1);
    });

    it('shows the error when resending fails', async () => {
      getOTP.mockRejectedValue(new Error('Too many requests'));
      render(<OTPScreen />);

      await act(async () => fireEvent.press(screen.getByText('Resend OTP')));

      expect(screen.getByText('Too many requests')).toBeTruthy();
    });
  });
});

describe('choosing a new password', () => {
  const reachPasswordStep = () => {
    render(<OTPScreen />);
    typeCode('123456');
  };
  const fillPasswords = (password = 'newpass1', confirm = 'newpass1') => {
    fireEvent.changeText(screen.getByPlaceholderText('New Password'), password);
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), confirm);
  };

  it('validates the passwords before calling the API', async () => {
    reachPasswordStep();

    fillPasswords('newpass1', 'other123');
    fireEvent.press(screen.getByText('Reset Password'));

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
    expect(resetPwd).not.toHaveBeenCalled();
  });

  it('submits the OTP, email and the password the user actually typed', async () => {
    resetPwd.mockResolvedValue({ success: true });
    reachPasswordStep();

    fillPasswords('MyNewPass1!', 'MyNewPass1!');
    fireEvent.press(screen.getByText('Reset Password'));

    await waitFor(() =>
      expect(resetPwd).toHaveBeenCalledWith({
        payload: { otp_token: '123456', email: 'ada@example.com', password: 'MyNewPass1!' },
        role: 'customer',
      }),
    );
  });

  it('shows the success screen and continues to login', async () => {
    resetPwd.mockResolvedValue({ success: true });
    reachPasswordStep();

    fillPasswords();
    fireEvent.press(screen.getByText('Reset Password'));

    expect(await screen.findByText('Account Created.')).toBeTruthy();
    fireEvent.press(screen.getByText('Go to Login'));
    expect(__router.push).toHaveBeenCalledWith('/customer/login');
  });

  it('shows the failure reason (e.g. expired OTP) on the same screen', async () => {
    resetPwd.mockRejectedValue(new Error('OTP expired'));
    reachPasswordStep();

    fillPasswords();
    fireEvent.press(screen.getByText('Reset Password'));

    expect(await screen.findByText('OTP expired')).toBeTruthy();
    expect(screen.queryByText('Account Created.')).toBeNull();
  });

  it('clears the previous error when the user tries again', async () => {
    resetPwd.mockRejectedValueOnce(new Error('OTP expired')).mockResolvedValueOnce({ success: true });
    reachPasswordStep();
    fillPasswords();

    fireEvent.press(screen.getByText('Reset Password'));
    await screen.findByText('OTP expired');

    fireEvent.press(screen.getByText('Reset Password'));

    expect(await screen.findByText('Account Created.')).toBeTruthy();
    expect(screen.queryByText('OTP expired')).toBeNull();
  });
});
