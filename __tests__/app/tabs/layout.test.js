import { render, screen, within } from '@testing-library/react-native';
import TabLayout from '@/app/(tabs)/_layout';
import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/contexts/cartContext';

jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/contexts/cartContext', () => ({ useCart: jest.fn() }));

describe('(tabs) layout', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ isLoggedIn: false });
    useCart.mockReturnValue({ cartCount: 0 });
  });

  it('defines the four tabs in order with their titles', () => {
    render(<TabLayout />);

    const names = screen.getAllByTestId(/^screen:/).map((node) => node.props.testID);
    expect(names).toEqual([
      'screen:home/index',
      'screen:search/index',
      'screen:myCart',
      'screen:support/index',
    ]);
    ['Home', 'Search', 'My Cart', 'Support'].forEach((title) =>
      expect(screen.getByText(title)).toBeTruthy(),
    );
  });

  it.each([
    ['home/index', 'home', 'home-outline'],
    ['search/index', 'search', 'search'],
    ['myCart', 'cart', 'cart-outline'],
    ['support/index', 'person', 'person-outline'],
  ])('%s uses a filled icon when focused and an outline when not', (name, focused, idle) => {
    render(<TabLayout />);

    const inside = (kind) => screen.getByTestId(`tabicon:${name}:${kind}`);
    expect(within(inside('focused')).getByTestId(`icon-${focused}`)).toBeTruthy();
    expect(within(inside('idle')).getByTestId(`icon-${idle}`)).toBeTruthy();
  });

  it('shows no badge on the cart tab when the cart is empty', () => {
    render(<TabLayout />);
    expect(screen.queryByTestId('badge:myCart')).toBeNull();
  });

  it('shows the number of cart lines as a badge', () => {
    useCart.mockReturnValue({ cartCount: 3 });
    render(<TabLayout />);
    expect(screen.getByTestId('badge:myCart').props.children).toBe('3');
  });
});
