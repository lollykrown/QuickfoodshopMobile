// Google Maps Platform key (Places autocomplete + Directions).
// Set EXPO_PUBLIC_GOOGLE_API_KEY in a gitignored .env.local (see .env.example).
// EXPO_PUBLIC_* values are inlined into the JS bundle, so restrict the key in Google Cloud
// (bundle id / package name + API restrictions) rather than relying on secrecy.
export const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? '';

if (__DEV__ && !GOOGLE_API_KEY) {
  console.warn('EXPO_PUBLIC_GOOGLE_API_KEY is not set: address search and route maps will not work.');
}
