import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import SignupForm from '@/app/(auth)/[role]/signup';

const valid = {
  'First name': 'Ada',
  'Last name': 'Lovelace',
  Email: 'ada@example.com',
  'Phone number': '07123456789',
  Password: 'secret1',
  'Confirm Password': 'secret1',
};

const fill = (values) =>
  Object.entries(values).forEach(([placeholder, text]) =>
    fireEvent.changeText(screen.getByPlaceholderText(placeholder), text),
  );

beforeEach(() => __setParams({ role: 'customer' }));

describe('SignupForm', () => {
  it('shows the form with all six fields', () => {
    render(<SignupForm />);

    expect(screen.getByText('Create Account')).toBeTruthy();
    Object.keys(valid).forEach((placeholder) =>
      expect(screen.getByPlaceholderText(placeholder)).toBeTruthy(),
    );
    expect(screen.getByText('Sign Up')).toBeTruthy();
    expect(screen.getByText('Sign up with Google')).toBeTruthy();
  });

  it('links to the login screen for the same role', () => {
    __setParams({ role: 'rider' });
    render(<SignupForm />);

    fireEvent.press(screen.getByText('Login'));

    expect(__router.push).toHaveBeenCalledWith('rider/login');
  });

  it('goes back from the back button', () => {
    render(<SignupForm />);
    fireEvent.press(screen.getByTestId('icon-arrow-back-ios-new'));
    expect(__router.back).toHaveBeenCalled();
  });

  it('shows every validation error and does not navigate when submitted empty', async () => {
    render(<SignupForm />);

    fireEvent.press(screen.getByText('Sign Up'));

    expect(await screen.findByText('First name is required')).toBeTruthy();
    expect(screen.getByText('Last name is required')).toBeTruthy();
    expect(screen.getByText('Invalid email address')).toBeTruthy();
    expect(screen.getByText('Phone number is too short')).toBeTruthy();
    expect(__router.push).not.toHaveBeenCalledWith('/otp');
  });

  it('flags mismatched passwords', async () => {
    render(<SignupForm />);

    fill({ ...valid, 'Confirm Password': 'different1' });
    fireEvent.press(screen.getByText('Sign Up'));

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
    expect(__router.push).not.toHaveBeenCalledWith('/otp');
  });

  it('continues to OTP entry with a valid form, without the password confirmation', async () => {
    render(<SignupForm />);

    fill(valid);
    fireEvent.press(screen.getByText('Sign Up'));

    await waitFor(() => expect(__router.push).toHaveBeenCalledWith('/otp'));
    expect(console.log).toHaveBeenCalledWith('Signup payload:', {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '07123456789',
      password: 'secret1',
    });
  });
});
