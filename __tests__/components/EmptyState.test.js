import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import EmptyState from '@/components/EmptyState';

describe('EmptyState', () => {
  it('shows the message and a default call to action', () => {
    render(<EmptyState text="Your cart is empty" />);

    expect(screen.getByText('Your cart is empty')).toBeTruthy();
    expect(screen.getByText('order now')).toBeTruthy();
  });

  it('sends the user to search by default', () => {
    render(<EmptyState text="Nothing here" />);

    fireEvent.press(screen.getByText('order now'));

    expect(__router.push).toHaveBeenCalledWith('/search');
  });

  it('supports a custom button label and destination', () => {
    render(<EmptyState text="No orders" buttonText="browse stores" url="/stores" />);

    fireEvent.press(screen.getByText('browse stores'));

    expect(__router.push).toHaveBeenCalledWith('/stores');
  });

  it('renders a custom icon instead of the default bag', () => {
    render(<EmptyState text="No orders" icon={<Text>custom-icon</Text>} />);
    expect(screen.getByText('custom-icon')).toBeTruthy();
  });
});
