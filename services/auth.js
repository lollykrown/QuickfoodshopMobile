// authService.ts
import { saveItem, getItem, deleteItem } from '../lib/secureStore'
import { Alert } from 'react-native';

const API_BASE = 'https://app.quickfoodshop.co.uk/v1';
const ACCESS_TOKEN_KEY = 'accessToken';
// const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (res.ok) {
    await saveItem(ACCESS_TOKEN_KEY, data.token);
    // await saveItem(REFRESH_TOKEN_KEY, data.refreshToken);
    await saveItem(USER_DATA_KEY, JSON.stringify(data.user));
    return data;
  } else {
    Alert.alert('Login Failed', data.message || 'Unknown error');
    return null;
  }
}

export async function getAccessToken() {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getUserData() {
  const userJson = await getItem(USER_DATA_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// export async function refreshToken() {
//   const refresh = await getItem(REFRESH_TOKEN_KEY);
//   if (!refresh) return null;

//   const res = await fetch(`${API_BASE}/refresh`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refreshToken: refresh }),
//   });
//   const data = await res.json();

//   if (res.ok) {
//     await saveItem(ACCESS_TOKEN_KEY, data.accessToken);
//     if (data.user) await saveItem(USER_DATA_KEY, JSON.stringify(data.user));
//     return data.accessToken;
//   } else {
//     await logout();
//     return null;
//   }
// }

export async function logout() {
  await deleteItem(ACCESS_TOKEN_KEY);
  // await deleteItem(REFRESH_TOKEN_KEY);
  await deleteItem(USER_DATA_KEY);
}