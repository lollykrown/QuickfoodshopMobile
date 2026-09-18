import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Tracking from '@/app/dashboard/tracking';
import TrackingId from '@/app/dashboard/tracking/[id]';
import TrackingModal from '@/app/dashboard/tracking/trackingModal';
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

const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);
const colorOf = (element) => StyleSheet.flatten(element.props.style)?.color;

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ logout: jest.fn(), loading: false });
});

describe('Tracking', () => {
  it('lists current and delivered orders', () => {
    renderWithPaper(<Tracking />);

    expect(screen.getByText('Current Tracking')).toBeTruthy();
    expect(screen.getByText('Delivered')).toBeTruthy();
    // 2 current + 3 delivered
    expect(screen.getAllByText('#5678')).toHaveLength(5);
  });

  it('shows each order\'s status in the "processing" colour', () => {
    renderWithPaper(<Tracking />);

    const statuses = screen.getAllByText('processing');
    expect(statuses).toHaveLength(5);
    expect(colorOf(statuses[0])).toBe('#FFA84A');
  });

  it('opens the tracking details when a card is pressed', () => {
    renderWithPaper(<Tracking />);

    fireEvent.press(screen.getAllByText('#5678')[0]);

    expect(__router.push).toHaveBeenCalledWith('/dashboard/tracking/2');
  });

  it('every current and delivered card opens the tracking details', () => {
    renderWithPaper(<Tracking />);

    screen.getAllByText('#5678').forEach((card) => fireEvent.press(card));

    expect(__router.push).toHaveBeenCalledTimes(5);
    __router.push.mock.calls.forEach(([path]) => expect(path).toBe('/dashboard/tracking/2'));
  });

  it('goes back and toggles the drawer', () => {
    renderWithPaper(<Tracking />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});

describe('TrackingId (details)', () => {
  it('shows the tracking id, delivery code and rider', () => {
    renderWithPaper(<TrackingId />);

    expect(screen.getByText('Tracking Details')).toBeTruthy();
    expect(screen.getByText('Tracking ID: QFTN1234567')).toBeTruthy();
    expect(screen.getByText('1339')).toBeTruthy();
    expect(screen.getByText('Your Rider:')).toBeTruthy();
    expect(screen.getByText('James Walter')).toBeTruthy();
    expect(screen.getByText('12 mins')).toBeTruthy();
  });

  it('shows the dispatched status in the "dispatched" colour', () => {
    renderWithPaper(<TrackingId />);
    expect(colorOf(screen.getByText('dispatched'))).toBe('#9747FF');
  });

  it('draws the route to the delivery point', () => {
    renderWithPaper(<TrackingId />);

    expect(screen.getByTestId('route-map')).toBeTruthy();
    expect(mockRouteMapProps.end).toEqual({ latitude: 54.9032838, longitude: -1.3779205 });
  });

  it('opens the delivery-code explanation from the info icon', () => {
    renderWithPaper(<TrackingId />);

    fireEvent.press(screen.getByTestId('icon-info-circle'));

    expect(__router.push).toHaveBeenCalledWith('/dashboard/tracking/trackingModal');
  });

  it('goes back and toggles the drawer', () => {
    renderWithPaper(<TrackingId />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});

describe('TrackingModal', () => {
  it('shows the delivery code prominently', () => {
    renderWithPaper(<TrackingModal />);

    expect(screen.getByText('Meet your rider and say')).toBeTruthy();
    expect(screen.getByText('"1339"')).toBeTruthy();
  });

  it('explains the five hand-over steps', () => {
    renderWithPaper(<TrackingModal />);

    expect(screen.getByText('How it works:')).toBeTruthy();
    [
      'Rider arives at your location',
      'Meet your rider and say your code',
      'Rider confirms that the code matches with theirs.',
      'Rider confirms your delivery',
      'Rider hands over package to you',
    ].forEach((step) => expect(screen.getByText(step)).toBeTruthy());
    for (let n = 1; n <= 5; n++) expect(screen.getByTestId(`icon-numeric-${n}-circle`)).toBeTruthy();
  });

  it('closes with the close button', () => {
    renderWithPaper(<TrackingModal />);
    fireEvent.press(screen.getByTestId('icon-close'));
    expect(__router.back).toHaveBeenCalled();
  });
});
