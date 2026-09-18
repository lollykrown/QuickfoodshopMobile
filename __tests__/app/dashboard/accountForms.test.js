import { Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { __router } from 'expo-router';
import ChangePassword from '@/app/dashboard/account/changePassword';
import EditProfile from '@/app/dashboard/account/edit-profile';
import { useAuth } from '@/contexts/authContext';
import { changePwd } from '@/services/dashboardApi';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/services/dashboardApi', () => ({ changePwd: jest.fn() }));

const user = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phoneNumber: '07123456789',
  role: 'vendor',
  image: 'a.png',
};

const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);

let alertSpy;
beforeEach(() => {
  jest.clearAllMocks();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => alertSpy.mockRestore());

describe('EditProfile', () => {
  const update = jest.fn();
  beforeEach(() => {
    update.mockReset();
    useAuth.mockReturnValue({ user, avatar: 'avatar.png', update, loading: false });
  });

  it('prefills the form with the current profile', () => {
    renderWithPaper(<EditProfile />);

    expect(screen.getByPlaceholderText('First name').props.value).toBe('Ada');
    expect(screen.getByPlaceholderText('Last name').props.value).toBe('Lovelace');
    expect(screen.getByPlaceholderText('Email').props.value).toBe('ada@example.com');
    expect(screen.getByPlaceholderText('Phone number').props.value).toBe('07123456789');
  });

  it('does not let the email be edited', () => {
    renderWithPaper(<EditProfile />);

    expect(screen.getByPlaceholderText('Email').props.editable).toBe(false);
    expect(screen.getByPlaceholderText('First name').props.editable).toBe(true);
  });

  it('uses the phone keypad for the phone number only', () => {
    renderWithPaper(<EditProfile />);

    expect(screen.getByPlaceholderText('Phone number').props.keyboardType).toBe('phone-pad');
    expect(screen.getByPlaceholderText('First name').props.keyboardType).toBe('email-address');
  });

  it('keeps Save disabled until something changes', async () => {
    renderWithPaper(<EditProfile />);

    fireEvent.press(screen.getByText('Save'));
    await act(async () => {});

    expect(update).not.toHaveBeenCalled();
  });

  it('saves the edited profile and confirms', async () => {
    update.mockResolvedValue(true);
    renderWithPaper(<EditProfile />);

    fireEvent.changeText(screen.getByPlaceholderText('First name'), 'Augusta');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        firstName: 'Augusta',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phoneNumber: '07123456789',
      }),
    );
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Profile updated successfully'));
  });

  it('tells the user when saving fails, with the reason', async () => {
    update.mockResolvedValue({ error: 'Email already in use' });
    renderWithPaper(<EditProfile />);

    fireEvent.changeText(screen.getByPlaceholderText('First name'), 'Augusta');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Update failed', 'Email already in use'));
    expect(alertSpy).not.toHaveBeenCalledWith('Profile updated successfully');
  });

  it('validates before saving', async () => {
    renderWithPaper(<EditProfile />);

    fireEvent.changeText(screen.getByPlaceholderText('First name'), 'A');
    fireEvent.changeText(screen.getByPlaceholderText('Phone number'), '12');
    fireEvent.press(screen.getByText('Save'));

    expect(await screen.findByText('First name is required')).toBeTruthy();
    expect(screen.getByText('Phone number is too short')).toBeTruthy();
    expect(update).not.toHaveBeenCalled();
  });

  it('goes back and toggles the drawer', () => {
    renderWithPaper(<EditProfile />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});

describe('ChangePassword', () => {
  const logout = jest.fn();
  beforeEach(() => {
    logout.mockReset();
    changePwd.mockReset();
    useAuth.mockReturnValue({ user, avatar: 'avatar.png', logout });
  });

  const fill = (current = 'oldpass1', next = 'newpass1', confirm = 'newpass1') => {
    fireEvent.changeText(screen.getByPlaceholderText('Old Password'), current);
    fireEvent.changeText(screen.getByPlaceholderText('New Password'), next);
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), confirm);
  };

  it('asks for the old, new and confirmed password', () => {
    renderWithPaper(<ChangePassword />);

    expect(screen.getByText('Change Password')).toBeTruthy();
    ['Old Password', 'New Password', 'Confirm Password'].forEach((p) =>
      expect(screen.getByPlaceholderText(p)).toBeTruthy(),
    );
  });

  it('validates before calling the API', async () => {
    renderWithPaper(<ChangePassword />);

    fill('oldpass1', 'newpass1', 'different1');
    fireEvent.press(screen.getByText('Save'));

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
    expect(changePwd).not.toHaveBeenCalled();
  });

  it('changes the password for the user\'s role, then signs them out', async () => {
    changePwd.mockResolvedValue({ success: true });
    renderWithPaper(<ChangePassword />);

    fill();
    fireEvent.press(screen.getByText('Save'));

    expect(await screen.findByText('Password changed.')).toBeTruthy();
    expect(changePwd).toHaveBeenCalledWith({
      payload: { currentPassword: 'oldpass1', newPassword: 'newpass1' },
      role: 'vendor',
    });
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('offers to go to login after a successful change', async () => {
    changePwd.mockResolvedValue({ success: true });
    renderWithPaper(<ChangePassword />);
    fill();
    fireEvent.press(screen.getByText('Save'));

    fireEvent.press(await screen.findByText('Go to Login'));

    expect(__router.push).toHaveBeenCalledWith('/customer/login');
  });

  it('shows the backend reason when the change is refused', async () => {
    changePwd.mockRejectedValue(new Error('Current password is wrong'));
    renderWithPaper(<ChangePassword />);

    fill();
    fireEvent.press(screen.getByText('Save'));

    expect(await screen.findByText('Current password is wrong')).toBeTruthy();
    expect(logout).not.toHaveBeenCalled();
    expect(screen.queryByText('Password changed.')).toBeNull();
  });

  it.each(['Please login again', 'Missing authorization header'])(
    'signs out and returns to login when the session is invalid ("%s")',
    async (message) => {
      changePwd.mockRejectedValue(new Error(message));
      renderWithPaper(<ChangePassword />);

      fill();
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
      expect(__router.replace).toHaveBeenCalledWith('vendor/login');
    },
  );

  it('goes back and toggles the drawer', () => {
    renderWithPaper(<ChangePassword />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});
