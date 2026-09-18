import * as Location from 'expo-location';
import { geocode } from '@/lib/getLatLng';

jest.mock('expo-location', () => ({ geocodeAsync: jest.fn() }));

describe('geocode', () => {
  it('returns the coordinates of the first match', async () => {
    Location.geocodeAsync.mockResolvedValue([
      { latitude: 54.9, longitude: -1.39, accuracy: 10 },
      { latitude: 1, longitude: 2 },
    ]);

    await expect(geocode('1 High Street, Sunderland')).resolves.toEqual({
      latitude: 54.9,
      longitude: -1.39,
    });
    expect(Location.geocodeAsync).toHaveBeenCalledWith('1 High Street, Sunderland');
  });

  it('returns null when nothing matches', async () => {
    Location.geocodeAsync.mockResolvedValue([]);
    await expect(geocode('nowhere')).resolves.toBeNull();
  });

  it('propagates geocoder errors', async () => {
    Location.geocodeAsync.mockRejectedValue(new Error('denied'));
    await expect(geocode('x')).rejects.toThrow('denied');
  });
});
