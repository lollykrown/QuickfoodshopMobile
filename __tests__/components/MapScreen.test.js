import polyline from '@mapbox/polyline';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import RouteMap from '@/components/MapScreen';
import WebMap from '@/components/MapScreen.web';
import { useCart } from '@/contexts/cartContext';

jest.mock('@/constants/config', () => ({ GOOGLE_API_KEY: 'test-key' }));
jest.mock('@/contexts/cartContext', () => ({ useCart: jest.fn() }));
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mapRef = { fitToCoordinates: jest.fn(), animateToRegion: jest.fn() };
  const MapView = React.forwardRef(function MockMapView({ children }, ref) {
    React.useImperativeHandle(ref, () => mapRef);
    return React.createElement(View, { testID: 'map' }, children);
  });
  const Marker = ({ coordinate, children }) =>
    React.createElement(View, { testID: 'marker', accessibilityLabel: JSON.stringify(coordinate) }, children);
  const Polyline = ({ coordinates, strokeColor, strokeWidth }) =>
    React.createElement(View, {
      testID: 'polyline',
      accessibilityLabel: JSON.stringify({ coordinates, strokeColor, strokeWidth }),
    });
  return { __esModule: true, default: MapView, Marker, Polyline, __mapRef: mapRef };
});

const { __mapRef: mapRef } = require('react-native-maps');

const DEFAULT_START = { latitude: 54.9010769, longitude: -1.3947494 };
const DEFAULT_END = { latitude: 54.9032838, longitude: -1.3779205 };
const START = { latitude: 51.5, longitude: -0.12 };
const END = { latitude: 51.51, longitude: -0.1 };
const ROUTE_POINTS = [
  [54.9, -1.39],
  [54.91, -1.38],
];

const directions = (overrides = {}) => ({
  routes: [
    {
      legs: [{ distance: { text: '2.1 km', value: 2100 }, duration: { text: '8 mins' } }],
      overview_polyline: { points: polyline.encode(ROUTE_POINTS) },
    },
  ],
  ...overrides,
});

const setAddress = jest.fn();
const deliveryAddress = { address: '1 High Street' };

beforeEach(() => {
  jest.clearAllMocks();
  useCart.mockReturnValue({ deliveryAddress, setAddress });
  global.fetch = jest.fn().mockResolvedValue({ json: async () => directions() });
});

afterEach(() => {
  delete global.fetch;
});

// Render, then let the directions request and its state updates settle inside act().
async function renderMap(props = {}) {
  const utils = render(<RouteMap {...props} />);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return utils;
}

const polylineProps = () => JSON.parse(screen.getByTestId('polyline').props.accessibilityLabel);

describe('RouteMap', () => {
  it('requests directions between the default points using the configured key', async () => {
    await renderMap();

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch.mock.calls[0][0]).toBe(
      'https://maps.googleapis.com/maps/api/directions/json' +
        `?origin=${DEFAULT_START.latitude},${DEFAULT_START.longitude}` +
        `&destination=${DEFAULT_END.latitude},${DEFAULT_END.longitude}` +
        '&key=test-key',
    );
  });

  it('uses custom start and end points', async () => {
    await renderMap({ start: START, end: END });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch.mock.calls[0][0]).toContain('origin=51.5,-0.12&destination=51.51,-0.1');
  });

  it('marks the start and end points', async () => {
    await renderMap({ start: START, end: END });

    const markers = screen.getAllByTestId('marker').map((m) => JSON.parse(m.props.accessibilityLabel));
    expect(markers).toEqual([START, END]);
  });

  it('draws the decoded route with the given stroke', async () => {
    await renderMap({ start: START, end: END, strokeColor: 'blue', strokeWidth: 6 });

    await waitFor(() => expect(screen.getByTestId('polyline')).toBeTruthy());
    const { coordinates, strokeColor, strokeWidth } = polylineProps();
    expect(strokeColor).toBe('blue');
    expect(strokeWidth).toBe(6);
    expect(coordinates).toHaveLength(2);
    expect(coordinates[0].latitude).toBeCloseTo(54.9, 4);
    expect(coordinates[1].longitude).toBeCloseTo(-1.38, 4);
  });

  it('reports distance and ETA to the parent', async () => {
    const onRouteInfo = jest.fn();
    await renderMap({ start: START, end: END, onRouteInfo });

    await waitFor(() =>
      expect(onRouteInfo).toHaveBeenCalledWith({ distance: '2.1 km', eta: '8 mins' }),
    );
  });

  it('saves distance (metres) and ETA onto the delivery address', async () => {
    await renderMap({ start: START, end: END });

    await waitFor(() =>
      expect(setAddress).toHaveBeenCalledWith({ ...deliveryAddress, distance: 2100, eta: '8 mins' }),
    );
  });

  it('fits the map to both points and the route', async () => {
    await renderMap({ start: START, end: END });

    await waitFor(() => expect(mapRef.fitToCoordinates).toHaveBeenCalled());
    const [coords, options] = mapRef.fitToCoordinates.mock.calls[0];
    expect(coords.slice(0, 2)).toEqual([START, END]);
    expect(coords).toHaveLength(4);
    expect(options).toEqual({
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  });

  it('draws nothing and reports nothing when no route is found', async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ routes: [] }) });
    const onRouteInfo = jest.fn();
    await renderMap({ start: START, end: END, onRouteInfo });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await act(async () => {});

    expect(screen.queryByTestId('polyline')).toBeNull();
    expect(onRouteInfo).not.toHaveBeenCalled();
    expect(setAddress).not.toHaveBeenCalled();
  });

  it('does not request directions until it has real coordinates for both ends', async () => {
    // The delivery screen starts with no destination (end = {}).
    await renderMap({ start: START, end: {} });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByTestId('polyline')).toBeNull();
  });

  it('logs and carries on when the request fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('offline');
    global.fetch.mockRejectedValue(failure);
    await renderMap({ start: START, end: END });

    await waitFor(() => expect(spy).toHaveBeenCalledWith('Error fetching route:', failure));
    expect(screen.getByTestId('map')).toBeTruthy();
    spy.mockRestore();
  });

  it('recentres on the destination when the snap button is pressed', async () => {
    await renderMap({ start: START, end: END });

    fireEvent.press(screen.getByLabelText('Center map on destination'));

    expect(mapRef.animateToRegion).toHaveBeenCalledWith(
      { ...END, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
  });
});

describe('RouteMap (web)', () => {
  it('shows a placeholder instead of a map', () => {
    render(<WebMap />);
    expect(screen.getByText('Maps are only available in the iOS and Android apps.')).toBeTruthy();
  });
});
