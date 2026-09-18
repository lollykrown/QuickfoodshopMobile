import { render, screen } from '@testing-library/react-native';
import AddressInput from '@/components/AddressInput';

jest.mock('@/constants/config', () => ({ GOOGLE_API_KEY: 'test-key' }));

// Capture what AddressInput hands to the Places widget and expose its imperative API.
let mockPlacesProps;
const mockSetAddressText = jest.fn();
jest.mock('react-native-google-places-autocomplete', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GooglePlacesAutocomplete: React.forwardRef(function MockPlaces(props, ref) {
      mockPlacesProps = props;
      React.useImperativeHandle(ref, () => ({ setAddressText: mockSetAddressText }));
      return React.createElement(View, { testID: 'places' });
    }),
  };
});

const details = (components, lat = 54.9, lng = -1.39) => ({
  address_components: components,
  geometry: { location: { lat, lng } },
});

describe('AddressInput', () => {
  beforeEach(() => {
    mockSetAddressText.mockClear();
    mockPlacesProps = undefined;
  });

  it('configures Places for UK addresses with the configured API key', () => {
    render(<AddressInput />);

    expect(screen.getByTestId('places')).toBeTruthy();
    expect(mockPlacesProps).toMatchObject({
      placeholder: 'Enter New Address',
      fetchDetails: true,
      debounce: 300,
      query: { key: 'test-key', language: 'en', components: 'country:gb' },
    });
  });

  it('pushes the address prop into the text field, and again when it changes', () => {
    const { rerender } = render(<AddressInput address="1 High Street" />);
    expect(mockSetAddressText).toHaveBeenLastCalledWith('1 High Street');

    rerender(<AddressInput address="2 Low Road" />);
    expect(mockSetAddressText).toHaveBeenLastCalledWith('2 Low Road');
  });

  it('tolerates the widget clearing its text', () => {
    render(<AddressInput />);
    expect(() => mockPlacesProps.clear()).not.toThrow();
  });

  it('renders a search icon as the left button', () => {
    render(<AddressInput />);
    render(mockPlacesProps.renderLeftButton());
    expect(screen.getByTestId('icon-search')).toBeTruthy();
  });

  describe('selecting a suggestion', () => {
    const select = (onSelect, data, det) => {
      render(<AddressInput onSelect={onSelect} />);
      mockPlacesProps.onPress(data, det);
    };

    it('reports address, coordinates, postcode and county', () => {
      const onSelect = jest.fn();
      select(
        onSelect,
        { description: '1 High Street, Sunderland' },
        details([
          { long_name: 'SR1 1AA', types: ['postal_code'] },
          { long_name: 'Tyne and Wear', types: ['administrative_area_level_2', 'political'] },
          { long_name: 'England', types: ['administrative_area_level_1', 'political'] },
        ]),
      );

      expect(onSelect).toHaveBeenCalledWith({
        address: '1 High Street, Sunderland',
        lat: 54.9,
        lng: -1.39,
        postcode: 'SR1 1AA',
        county: 'Tyne and Wear',
      });
    });

    it('falls back to the level-1 area when there is no level-2 county', () => {
      const onSelect = jest.fn();
      select(
        onSelect,
        { description: 'x' },
        details([{ long_name: 'England', types: ['administrative_area_level_1'] }]),
      );
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ county: 'England' }));
    });

    it('uses null for a missing postcode and county', () => {
      const onSelect = jest.fn();
      select(onSelect, { description: 'x' }, details([]));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ postcode: null, county: null }),
      );
    });

    it('does not throw without an onSelect handler', () => {
      render(<AddressInput />);
      expect(() => mockPlacesProps.onPress({ description: 'x' }, details([]))).not.toThrow();
    });
  });
});
