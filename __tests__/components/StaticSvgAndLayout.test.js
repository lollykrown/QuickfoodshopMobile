import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import StackedBackground from '@/components/StackedBG';
import GoogleLogo from '@/components/GoogleLogo';
import HorizontalLine from '@/components/Horizontal Lines';
import { Protected } from '@/components/Guard';
import { __router } from 'expo-router';

describe('StackedBackground', () => {
  it('renders its children over the background', () => {
    render(
      <StackedBackground>
        <Text>Foreground</Text>
      </StackedBackground>,
    );
    expect(screen.getByText('Foreground')).toBeTruthy();
  });

  it('stacks two background images', () => {
    render(<StackedBackground />);
    const background = screen.toJSON().children[0];
    expect(background.children).toHaveLength(2);
  });
});

describe('GoogleLogo', () => {
  it('renders an SVG at the default size', () => {
    render(<GoogleLogo />);
    expect(screen.toJSON()).not.toBeNull();
  });

  it('accepts a custom size', () => {
    expect(() => render(<GoogleLogo size={40} />)).not.toThrow();
  });
});

describe('HorizontalLine', () => {
  it('renders a dashed line', () => {
    render(<HorizontalLine width={200} />);
    expect(screen.toJSON()).not.toBeNull();
  });
});

// components/Guard.jsx is not used by any screen yet (routes use Stack.Protected), but it is
// exported and its behaviour is small and worth pinning down.
describe('Protected (Guard)', () => {
  it('renders children when the guard passes', () => {
    render(
      <Protected guard>
        <Text>Secret</Text>
      </Protected>,
    );
    expect(screen.getByText('Secret')).toBeTruthy();
    expect(__router.replace).not.toHaveBeenCalled();
  });

  it('renders nothing and redirects to /login when the guard fails', () => {
    render(
      <Protected guard={false}>
        <Text>Secret</Text>
      </Protected>,
    );
    expect(screen.queryByText('Secret')).toBeNull();
    expect(__router.replace).toHaveBeenCalledWith('/login');
  });
});
