// authService.ts
import { Alert } from 'react-native';
import { deleteItem, getItem, saveItem } from './secureStore';
import NetInfo from '@react-native-community/netinfo';
import axios, { Cancel } from 'axios';
import { enqueueRequest, startNetworkListener } from '@/utils/networkQueue';

const API_BASE = 'https://app.quickfoodshop.co.uk/v1';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

let isLoggingOut = false;

const fetchWithCred = axios.create({
  baseURL: 'https://app.quickfoodshop.co.uk/v1',
  withCredentials: true,
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json'
    // cache: 'no-store',
  },
});
startNetworkListener(fetchWithCred);

// 🚫 Block requests when offline
fetchWithCred.interceptors.request.use(
  async (config) => {
    if (config.skipAuth) {
      return config;
    }
    if (isLoggingOut) {
      return Promise.reject(new Cancel("Logout in progress"));
    }
    const netState = await NetInfo.fetch();

    if (netState.isConnected === false) {
      return enqueueRequest(config);
    }

    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 🔁 Handle token refresh
fetchWithCred.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 👇 offline errors — don't retry
    if (error?.isOffline) {
      return Promise.reject(error);
    }
    if (isLoggingOut) {
      return Promise.reject(error);
    }
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return fetchWithCred(originalRequest);
      } else {
        if (!isLoggingOut) {
          await logout();
        }
      }
    }

    return Promise.reject(error);
  },
);


async function login(email, password, role) {
  const url = role === 'customer' ? '/auth/login' : role === 'vendor' ? '/vendor/auth/login' : '/auth/rider/login';
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // console.log('LOGIN',data)

  if (res.ok) {
    const token = data.token || data.accessToken || data.access_token;

    // console.log('NORMALIZED TOKEN 👉', token);

    if (!token) throw new Error('NO TOKEN IN LOGIN RESPONSE');

    const user = { ...(data.user ?? data.data?.user), role };

    await saveItem(ACCESS_TOKEN_KEY, token);
    // Only present if the backend returns one; without it, a 401 falls through to logout.
    const refresh = data.refreshToken ?? data.refresh_token;
    if (refresh) await saveItem(REFRESH_TOKEN_KEY, refresh);
    await saveItem(USER_DATA_KEY, JSON.stringify(user))

    return { token, user };
  } else {
    Alert.alert('Login Failed', data.message || 'Unknown error');
    return data.message;
  }
}

async function getAccessToken() {
  return getItem(ACCESS_TOKEN_KEY);
}

async function getUserData() {
  const userJson = await getItem(USER_DATA_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

async function refreshToken() {
  const refresh = await getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  const data = await res.json();

  if (res.ok) {
    await saveItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.user) await saveItem(USER_DATA_KEY, JSON.stringify(data.user));
    return data.accessToken;
  } else {
    await logout();
    return null;
  }
}

const logoutAction = async () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    const response = await fetchWithCred.get('/auth/logout',{skipAuth: true,});
    console.log('Logout response:', response);
    return response;
  } catch (error) {
    console.log('er',error)
    if (error?.response) {
      // Server responded with non-2xx
      throw new Error(error?.response?.data?.message ?? 'Server error');
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }

    console.log(error);
    throw new Error('Unexpected error');
  }finally{
    isLoggingOut = false;
  }
};

async function logout() {
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    await logoutAction();
  } catch (error) {
    console.log('Logout failed:', error);
  } finally {
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
    await deleteItem(USER_DATA_KEY);
    isLoggingOut = false;
  }
}

export { fetchWithCred, login, getAccessToken, getUserData, refreshToken, logout };