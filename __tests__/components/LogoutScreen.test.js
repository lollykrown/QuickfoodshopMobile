import { render, screen } from '@testing-library/react-native';
import LogoutScreen from '@/components/LogoutScreen';

describe('LogoutScreen', () => {
  it('shows a blocking "Logging out..." overlay', () => {
    render(<LogoutScreen />);

    expect(screen.getByText('Logging out...')).toBeTruthy();
    expect(screen.toJSON().props.pointerEvents).toBe('auto');
  });
});
