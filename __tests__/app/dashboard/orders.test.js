import { PaperProvider } from 'react-native-paper';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Confirmation from '@/app/dashboard/orders/confirmation';
import FindRider from '@/app/dashboard/orders/findRider';
import Orders from '@/app/dashboard/orders';
import OrderDetails from '@/app/dashboard/orders/[id]';
import RiderModal from '@/app/dashboard/orders/riderModal';
import { useAuth } from '@/contexts/authContext';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));
let mockRouteMapProps;
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

const user = (role) => ({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role, image: 'a.png' });
const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteMapProps = undefined;
  useAuth.mockReturnValue({ user: user('customer'), avatar: 'a.png', logout: jest.fn(), loading: false });
});

const itHasStandardAppBar = (render_) =>
  it('goes back and toggles the drawer from the app bar', () => {
    render_();
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });

describe('Orders', () => {
  it('separates active from past orders', () => {
    renderWithPaper(<Orders />);

    expect(screen.getByText('Active Orders')).toBeTruthy();
    expect(screen.getByText('Past Orders')).toBeTruthy();
    ['3378', '3399', '3398', '3499'].forEach((n) => expect(screen.getByText(n)).toBeTruthy());
  });

  it('keeps order details hidden until an order is expanded', () => {
    renderWithPaper(<Orders />);
    expect(screen.queryByText('⦿ Puff puff')).toBeNull();

    // the second active order (3399, Blue Lagoon) has the puff puff
    fireEvent.press(screen.getAllByTestId('icon-keyboard-arrow-down')[1]);

    expect(screen.getByText('⦿ Puff puff')).toBeTruthy();
  });

  it('expands and collapses only the order whose arrow was pressed', () => {
    renderWithPaper(<Orders />);
    const arrows = () => screen.getAllByTestId('icon-keyboard-arrow-down');

    fireEvent.press(arrows()[0]); // active: 3378
    expect(screen.getByText('⦿ Spagetti Bolognes')).toBeTruthy();
    expect(screen.queryByText('⦿ Puff puff')).toBeNull();

    fireEvent.press(arrows()[0]);
    expect(screen.queryByText('⦿ Spagetti Bolognes')).toBeNull();
  });

  it('active and past lists expand independently', () => {
    renderWithPaper(<Orders />);

    fireEvent.press(screen.getAllByTestId('icon-keyboard-arrow-down')[2]); // past: 3398

    // 3398 (id 1) is expanded; 3378 (id 11) in the active list is untouched
    expect(screen.getAllByText('⦿ Jollof rice and chicken')).toHaveLength(1);
  });

  it('opens an order from its card', () => {
    renderWithPaper(<Orders />);

    fireEvent.press(screen.getByText('3378'));
    expect(__router.push).toHaveBeenLastCalledWith('/dashboard/orders/11');

    fireEvent.press(screen.getByText('3499'));
    expect(__router.push).toHaveBeenLastCalledWith('/dashboard/orders/2');
  });

  it('offers to order now', () => {
    renderWithPaper(<Orders />);
    fireEvent.press(screen.getByText('Order Now'));
    expect(__router.push).toHaveBeenCalledWith('/search');
  });

  itHasStandardAppBar(() => renderWithPaper(<Orders />));
});

describe('OrderDetails', () => {
  it('shows the order, vendor, items, extras and payment', () => {
    renderWithPaper(<OrderDetails />);

    expect(screen.getByText('Order Details')).toBeTruthy();
    expect(screen.getByText('Order #5678')).toBeTruthy();
    expect(screen.getByText('Mar 12, 2025')).toBeTruthy();
    expect(screen.getByText('Open Sea Restaurant')).toBeTruthy();
    expect(screen.getByText('⦿ Jollof rice and chicken')).toBeTruthy();
    expect(screen.getByText('⦿ Coca cola')).toBeTruthy();
    expect(screen.getByText('Card **** **** **** 2346')).toBeTruthy();
  });

  it('itemises the payment summary', () => {
    renderWithPaper(<OrderDetails />);

    expect(screen.getByText('Payment Summary')).toBeTruthy();
    expect(screen.getByText('£300')).toBeTruthy();
    expect(screen.getByText('£2.00')).toBeTruthy();
    expect(screen.getByText('Free')).toBeTruthy();
    expect(screen.getByText('£302.00')).toBeTruthy();
  });

  it('has a feedback box', () => {
    renderWithPaper(<OrderDetails />);
    expect(
      screen.getByPlaceholderText('I love the service, and the items were fairly priced'),
    ).toBeTruthy();
  });

  it('lets the user start finding a rider', () => {
    renderWithPaper(<OrderDetails />);
    fireEvent.press(screen.getByText('Find Rider'));
    expect(__router.push).toHaveBeenCalledWith('/dashboard/orders/findRider');
  });

  describe('per role', () => {
    it('customers see the delivery code', () => {
      renderWithPaper(<OrderDetails />);
      expect(screen.getByText('98776')).toBeTruthy();
      expect(screen.queryByText('Customer Details')).toBeNull();
    });

    it('vendors see the customer details instead', () => {
      useAuth.mockReturnValue({ user: user('vendor'), avatar: 'a.png' });
      renderWithPaper(<OrderDetails />);

      expect(screen.getByText('Customer Details')).toBeTruthy();
      expect(screen.getByText('Ada Lovelace')).toBeTruthy();
      expect(screen.getByText('ada@example.com')).toBeTruthy();
      expect(screen.getByText('View Profile')).toBeTruthy();
      expect(screen.queryByText('98776')).toBeNull();
    });

    it('riders see neither', () => {
      useAuth.mockReturnValue({ user: user('rider'), avatar: 'a.png' });
      renderWithPaper(<OrderDetails />);

      expect(screen.queryByText('Customer Details')).toBeNull();
      expect(screen.queryByText('98776')).toBeNull();
    });
  });

  itHasStandardAppBar(() => renderWithPaper(<OrderDetails />));
});

describe('FindRider', () => {
  it('shows the order, its route and the riders nearby', () => {
    renderWithPaper(<FindRider />);

    expect(screen.getByText('Find Rider')).toBeTruthy();
    expect(screen.getByText(/Order #5678/)).toBeTruthy();
    expect(screen.getByText('Riders in London')).toBeTruthy();
    expect(screen.getAllByText('Riders Name')).toHaveLength(5);
    expect(screen.getByTestId('route-map')).toBeTruthy();
  });

  it('routes the map to the delivery point', () => {
    renderWithPaper(<FindRider />);

    expect(mockRouteMapProps.end).toEqual({ latitude: 54.9032838, longitude: -1.3779205 });
    expect(mockRouteMapProps.strokeColor).toBe('#FF6600');
  });

  it('opens the assign-rider sheet from Assign', () => {
    renderWithPaper(<FindRider />);

    fireEvent.press(screen.getAllByText('Assign')[0]);

    expect(__router.push).toHaveBeenCalledWith('/dashboard/orders/riderModal');
  });

  itHasStandardAppBar(() => renderWithPaper(<FindRider />));
});

describe('RiderModal', () => {
  it('asks for confirmation of the rider/customer pair', () => {
    renderWithPaper(<RiderModal />);

    expect(screen.getByText('Assign rider to customer?')).toBeTruthy();
    expect(screen.getByText('Jonathan Mike')).toBeTruthy();
    expect(screen.getByText('Tobi Makinde')).toBeTruthy();
  });

  it('confirming replaces the sheet with the confirmation screen', () => {
    renderWithPaper(<RiderModal />);

    fireEvent.press(screen.getByText('Confirm'));

    expect(__router.replace).toHaveBeenCalledWith('/dashboard/orders/confirmation');
  });
});

describe('Confirmation', () => {
  it('confirms the assignment and returns to the dashboard', () => {
    renderWithPaper(<Confirmation />);

    expect(screen.getByText('Rider Assigned!')).toBeTruthy();
    expect(screen.getByText('Rider has been assigned successfully!')).toBeTruthy();

    fireEvent.press(screen.getByText('Back to Dashboard'));
    expect(__router.push).toHaveBeenCalledWith('/dashboard');
  });
});
