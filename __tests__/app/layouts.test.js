import { render, screen } from '@testing-library/react-native';
import DashboardLayout from '@/app/dashboard/_layout';
import OrdersLayout from '@/app/dashboard/orders/_layout';
import TrackingLayout from '@/app/dashboard/tracking/_layout';
import CartLayout from '@/app/(tabs)/myCart/_layout';
import StoresLayout from '@/app/stores/_layout';

const optionsOf = (testID) => JSON.parse(screen.getByTestId(testID).props.accessibilityValue.text);
const screenNames = () => screen.getAllByTestId(/^screen:/).map((n) => n.props.testID.replace('screen:', ''));

describe('dashboard layout', () => {
  it('registers every dashboard section, sliding in from the right without headers', () => {
    render(<DashboardLayout />);

    expect(screenNames()).toEqual([
      'account/index',
      'activeRiders/index',
      'favorites/index',
      'invoice/index',
      'notifications/index',
      'orders',
      'settings/index',
      'tracking',
      'transactions/index',
    ]);
    expect(optionsOf('stack')).toEqual({ headerShown: false, animation: 'slide_from_right' });
  });
});

describe('orders layout', () => {
  it('registers the order screens', () => {
    render(<OrdersLayout />);
    expect(screenNames()).toEqual(['index', 'findRider', '[id]', 'riderModal']);
    expect(optionsOf('stack')).toEqual({ headerShown: false, animation: 'slide_from_right' });
  });

  it('presents the rider assignment as a form sheet', () => {
    render(<OrdersLayout />);
    expect(optionsOf('screen:riderModal')).toMatchObject({
      presentation: 'formSheet',
      sheetAllowedDetents: [0.375, 0.45],
      title: 'Assign Rider',
      sheetGrabberVisible: true,
    });
  });
});

describe('tracking layout', () => {
  it('registers the tracking screens', () => {
    render(<TrackingLayout />);
    expect(screenNames()).toEqual(['index', '[id]', 'trackingModal']);
  });

  it('presents the delivery-code explanation as a form sheet', () => {
    render(<TrackingLayout />);
    expect(optionsOf('screen:trackingModal')).toMatchObject({
      presentation: 'formSheet',
      sheetAllowedDetents: [0.4, 0.6, 0.9],
      headerShown: false,
    });
  });
});

describe('header-less stack layouts', () => {
  it.each([
    ['my cart', CartLayout],
    ['stores', StoresLayout],
  ])('%s hides the native header', (_name, Layout) => {
    render(<Layout />);
    expect(optionsOf('stack')).toEqual({ headerShown: false });
  });
});
