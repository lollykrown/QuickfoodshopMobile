import * as Location from 'expo-location';

export const geocode = async (address) => {
  const result = await Location.geocodeAsync(address);

  if (!result.length) return null;

  return {
    latitude: result[0].latitude,
    longitude: result[0].longitude,
  };
};