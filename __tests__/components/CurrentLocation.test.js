import * as Location from 'expo-location';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CurrentLocationButton from '@/components/CurrentLocation';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

const coords = { latitude: 54.9, longitude: -1.39 };
const press = () => fireEvent.press(screen.getByText('Use current location'));

beforeEach(() => {
  jest.clearAllMocks();
  global.alert = jest.fn();
  Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Location.getCurrentPositionAsync.mockResolvedValue({ coords });
  Location.reverseGeocodeAsync.mockResolvedValue([
    { name: '10', street: 'Main Street', city: 'Sunderland', postalCode: 'SR1 1AA', region: 'Tyne and Wear' },
  ]);
});

afterEach(() => {
  delete global.alert;
});

describe('CurrentLocationButton', () => {
  it('renders the call to action', () => {
    render(<CurrentLocationButton onSelect={() => {}} />);
    expect(screen.getByText('Use current location')).toBeTruthy();
    expect(screen.getByTestId('icon-my-location')).toBeTruthy();
  });

  it('reverse-geocodes the device position and reports a formatted place', async () => {
    const onSelect = jest.fn();
    render(<CurrentLocationButton onSelect={onSelect} />);

    press();

    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 4 });
    expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith(coords);
    expect(onSelect).toHaveBeenCalledWith({
      address: '10, Main Street, Sunderland, SR1 1AA',
      lat: 54.9,
      lng: -1.39,
      postcode: 'SR1 1AA',
      county: 'Tyne and Wear',
    });
  });

  it('skips missing address parts and nulls missing postcode/region', async () => {
    Location.reverseGeocodeAsync.mockResolvedValue([
      { name: null, street: 'Main Street', city: null, postalCode: null, region: null },
    ]);
    const onSelect = jest.fn();
    render(<CurrentLocationButton onSelect={onSelect} />);

    press();

    await waitFor(() => expect(onSelect).toHaveBeenCalled());
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ address: 'Main Street', postcode: null, county: null }),
    );
  });

  it('alerts and stops when permission is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const onSelect = jest.fn();
    render(<CurrentLocationButton onSelect={onSelect} />);

    press();

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Location permission is required'));
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    // and the button is usable again
    expect(screen.getByText('Use current location')).toBeTruthy();
  });

  it('alerts and recovers when the lookup fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    Location.getCurrentPositionAsync.mockRejectedValue(new Error('GPS off'));
    const onSelect = jest.fn();
    render(<CurrentLocationButton onSelect={onSelect} />);

    press();

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Unable to get location'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText('Use current location')).toBeTruthy();
    spy.mockRestore();
  });

  it('shows a spinner instead of the label while working', async () => {
    let finish;
    Location.getCurrentPositionAsync.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    render(<CurrentLocationButton onSelect={() => {}} />);

    press();

    await waitFor(() => expect(screen.queryByText('Use current location')).toBeNull());

    finish({ coords });
    await waitFor(() => expect(screen.getByText('Use current location')).toBeTruthy());
  });

  it('works without an onSelect handler', async () => {
    render(<CurrentLocationButton />);
    press();
    await waitFor(() => expect(Location.reverseGeocodeAsync).toHaveBeenCalled());
  });
});
