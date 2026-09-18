import * as Linking from 'expo-linking';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Support from '@/app/(tabs)/support';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('expo-linking', () => ({ openURL: jest.fn() }));

describe('Support', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the customer care line and social channels', () => {
    render(<Support />);

    expect(screen.getByText('Call us!')).toBeTruthy();
    expect(screen.getByText('+44 (07) 597 399 738')).toBeTruthy();
    expect(screen.getByText('Customer Care Line')).toBeTruthy();
    expect(screen.getByText('Chat with us on social media!')).toBeTruthy();
    expect(screen.getByTestId('icon-facebook')).toBeTruthy();
    expect(screen.getByTestId('icon-instagram-with-circle')).toBeTruthy();
  });

  it('dials the customer care number when tapped', () => {
    render(<Support />);

    fireEvent.press(screen.getByText('Customer Care Line'));

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+447597399738');
  });

  it('goes back and toggles the drawer from the app bar', () => {
    render(<Support />);

    fireEvent.press(screen.getByLabelText('Back'));
    expect(__router.back).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});
