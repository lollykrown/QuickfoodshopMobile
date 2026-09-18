import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import MyCart from '@/app/(tabs)/myCart';
import Delivery from '@/app/(tabs)/myCart/delivery';
import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/contexts/cartContext';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/contexts/cartContext', () => ({ useCart: jest.fn() }));

// Delivery composes three heavy children; stand-ins let the tests drive their callbacks.
let mockRouteMapProps;
jest.mock('@/components/AddressInput', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onSelect, address }) =>
      React.createElement(
        Text,
        {
          onPress: () =>
            onSelect({ address: '1 High Street, Sunderland', lat: 54.9, lng: -1.39, postcode: 'SR1 1AA' }),
        },
        `address-picker:${address ?? ''}`,
      ),
  };
});
jest.mock('@/components/CurrentLocation', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onSelect }) =>
      React.createElement(
        Text,
        { onPress: () => onSelect({ address: 'Here Now', lat: 1, lng: 2 }) },
        'current-location',
      ),
  };
});
jest.mock('@/components/MapScreen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => {
      mockRouteMapProps = props;
      return React.createElement(View, { testID: 'route-map' });
    },
  };
});

const line = (id, overrides = {}) => ({
  id,
  name: `Item ${id}`,
  description: `Description ${id}`,
  price: 10,
  quantity: 2,
  category: 'Food',
  ...overrides,
});

const cart = (overrides = {}) => ({
  cartItems: [],
  deliveryAddress: null,
  totalPrice: 0,
  updateQuantity: jest.fn(),
  removeItem: jest.fn(),
  removeAddress: jest.fn(),
  clearCart: jest.fn(),
  setAddress: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ avatar: 'avatar.png' });
  global.alert = jest.fn();
});

afterEach(() => {
  delete global.alert;
});

describe('MyCart (empty)', () => {
  beforeEach(() => useCart.mockReturnValue(cart()));

  it('says the cart is empty and offers to browse', () => {
    render(<MyCart />);

    expect(screen.getByText('Cart is Empty')).toBeTruthy();
    fireEvent.press(screen.getByText('Browse Items'));
    expect(__router.push).toHaveBeenCalledWith('/search');
  });

  it('has no checkout controls', () => {
    render(<MyCart />);
    expect(screen.queryByText('Clear Cart')).toBeNull();
    expect(screen.queryByText('Proceed')).toBeNull();
  });
});

describe('MyCart (with items)', () => {
  const items = [line('a'), line('b', { name: 'Plantain', category: undefined, price: 5, quantity: 1 })];

  it('lists each line with its details', () => {
    useCart.mockReturnValue(cart({ cartItems: items, totalPrice: 25 }));
    render(<MyCart />);

    expect(screen.getByText('Item a')).toBeTruthy();
    expect(screen.getByText('Description a')).toBeTruthy();
    expect(screen.getByText('£10.00')).toBeTruthy();
    expect(screen.getByText('Plantain')).toBeTruthy();
    expect(screen.getByText('£5.00')).toBeTruthy();
  });

  it('changes quantity with the +/- buttons', () => {
    const state = cart({ cartItems: [line('a')], totalPrice: 20 });
    useCart.mockReturnValue(state);
    render(<MyCart />);

    fireEvent.press(screen.getByTestId('icon-plus-square'));
    fireEvent.press(screen.getByTestId('icon-minus-square'));

    expect(state.updateQuantity).toHaveBeenNthCalledWith(1, 'a', 1);
    expect(state.updateQuantity).toHaveBeenNthCalledWith(2, 'a', -1);
  });

  it('removes a line with the bin icon, keeping the address while other lines remain', () => {
    const state = cart({ cartItems: items, totalPrice: 25 });
    useCart.mockReturnValue(state);
    render(<MyCart />);

    fireEvent.press(screen.getAllByTestId('icon-trash-outline')[0]);

    expect(state.removeItem).toHaveBeenCalledWith('a');
    expect(state.removeAddress).not.toHaveBeenCalled();
  });

  it('also clears the delivery address when the last line is removed', () => {
    const state = cart({ cartItems: [line('a')], totalPrice: 20 });
    useCart.mockReturnValue(state);
    render(<MyCart />);

    fireEvent.press(screen.getByTestId('icon-trash-outline'));

    expect(state.removeAddress).toHaveBeenCalled();
    expect(state.removeItem).toHaveBeenCalledWith('a');
  });

  it('Clear Cart empties the cart and the address', () => {
    const state = cart({ cartItems: items, totalPrice: 25 });
    useCart.mockReturnValue(state);
    render(<MyCart />);

    fireEvent.press(screen.getByText('Clear Cart'));

    expect(state.removeAddress).toHaveBeenCalled();
    expect(state.clearCart).toHaveBeenCalled();
  });

  it('opens an item in its category (defaulting to food)', () => {
    useCart.mockReturnValue(cart({ cartItems: items, totalPrice: 25 }));
    render(<MyCart />);

    fireEvent.press(screen.getByText('Item a'));
    expect(__router.push).toHaveBeenLastCalledWith('/stores/food/a');

    fireEvent.press(screen.getByText('Plantain'));
    expect(__router.push).toHaveBeenLastCalledWith('/stores/food/b');
  });

  it('lets the user change the delivery address', () => {
    useCart.mockReturnValue(cart({ cartItems: items, totalPrice: 25 }));
    render(<MyCart />);

    fireEvent.press(screen.getByText('Change Delivery Address'));

    expect(__router.push).toHaveBeenCalledWith('/myCart/delivery');
  });

  it('goes back and toggles the drawer from the app bar', () => {
    useCart.mockReturnValue(cart({ cartItems: items, totalPrice: 25 }));
    render(<MyCart />);

    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));

    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });

  describe('without a delivery address', () => {
    it('hides the payment summary and asks for an address first', () => {
      useCart.mockReturnValue(cart({ cartItems: items, totalPrice: 25 }));
      render(<MyCart />);

      expect(screen.queryByText('Payment Summary')).toBeNull();
      fireEvent.press(screen.getByText('Proceed'));
      expect(__router.push).toHaveBeenLastCalledWith('/myCart/delivery');
    });
  });

  describe('with a delivery address', () => {
    const withAddress = (extra = {}) =>
      useCart.mockReturnValue(
        cart({
          cartItems: [line('a')],
          totalPrice: 20,
          deliveryAddress: { address: '1 High Street', ...extra },
        }),
      );

    it('summarises subtotal, 4% tax, 5% service fee, delivery and total', () => {
      withAddress(); // no distance -> flat £2.00 delivery
      render(<MyCart />);

      expect(screen.getByText('Payment Summary')).toBeTruthy();
      expect(screen.getByText('£20.00')).toBeTruthy(); // subtotal
      expect(screen.getByText('£0.80')).toBeTruthy(); // 4%
      expect(screen.getByText('£1.00')).toBeTruthy(); // 5%
      expect(screen.getByText('£2.00')).toBeTruthy(); // delivery
      expect(screen.getByText('£23.80')).toBeTruthy(); // total
    });

    it('prices delivery at £1.20 per km when the route distance is known', () => {
      withAddress({ distance: 5000 });
      render(<MyCart />);

      expect(screen.getByText('£6.00')).toBeTruthy(); // 5 km
      expect(screen.getByText('£27.80')).toBeTruthy(); // 20 + 0.80 + 1.00 + 6.00
    });

    it('offers Pay, which heads to /payment', () => {
      // NOTE: there is no /payment route yet (see CLAUDE.md "Known issues"). This pins the
      // current navigation target so the gap is noticed when the screen is added.
      withAddress();
      render(<MyCart />);

      fireEvent.press(screen.getByText('Pay'));

      expect(__router.push).toHaveBeenCalledWith('/payment');
    });
  });
});

describe('Delivery', () => {
  const setup = (extra = {}) => {
    const state = cart({ cartItems: [line('a', { location: { latitude: 54.9, longitude: -1.4 } })], ...extra });
    useCart.mockReturnValue(state);
    render(<Delivery />);
    return state;
  };

  it('shows the checkout steps and an empty selection prompt', () => {
    setup();

    ['Delivery', 'Payment', 'Summary', 'Selected location'].forEach((t) =>
      expect(screen.getByText(t)).toBeTruthy(),
    );
    expect(screen.getByText(/No location selected/)).toBeTruthy();
  });

  it('shows the chosen address and stores it on the cart', () => {
    const state = setup({ deliveryAddress: { note: 'ring bell' } });

    fireEvent.press(screen.getByText(/address-picker/));

    expect(screen.getByText('1 High Street, Sunderland')).toBeTruthy();
    expect(state.setAddress).toHaveBeenCalledWith({
      note: 'ring bell',
      address: '1 High Street, Sunderland',
      lat: 54.9,
      lng: -1.39,
      postcode: 'SR1 1AA',
    });
  });

  it('accepts the device location too', () => {
    const state = setup();

    fireEvent.press(screen.getByText('current-location'));

    expect(screen.getByText('Here Now')).toBeTruthy();
    expect(state.setAddress).toHaveBeenCalledWith(expect.objectContaining({ address: 'Here Now' }));
  });

  it('feeds the picked coordinates to the route map, starting from the vendor location', () => {
    setup();
    expect(mockRouteMapProps.start).toEqual({ latitude: 54.9, longitude: -1.4 });
    expect(mockRouteMapProps.end).toEqual({});

    fireEvent.press(screen.getByText(/address-picker/));

    expect(mockRouteMapProps.end).toEqual({ latitude: 54.9, longitude: -1.39 });
    expect(mockRouteMapProps.strokeColor).toBe('#FF6600');
  });

  it('shows the route ETA and distance once the map reports them', () => {
    setup();
    expect(screen.queryByText('8 mins')).toBeNull();

    fireEvent.press(screen.getByText(/address-picker/));
    const { act } = require('@testing-library/react-native');
    act(() => mockRouteMapProps.onRouteInfo({ eta: '8 mins', distance: '2.1 km' }));

    expect(screen.getByText('8 mins')).toBeTruthy();
    expect(screen.getByText('2.1 km')).toBeTruthy();
  });

  it('refuses to continue without an address', () => {
    setup();

    fireEvent.press(screen.getByText('Save and Continue'));

    expect(global.alert).toHaveBeenCalledWith(
      'Please select a delivery address before proceeding to payment.',
    );
    expect(__router.push).not.toHaveBeenCalled();
  });

  it('returns to the cart once an address is chosen', () => {
    setup();

    fireEvent.press(screen.getByText(/address-picker/));
    fireEvent.press(screen.getByText('Save and Continue'));

    expect(__router.push).toHaveBeenCalledWith('/myCart');
  });

  it('goes back and toggles the drawer from the app bar', () => {
    setup();
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});
