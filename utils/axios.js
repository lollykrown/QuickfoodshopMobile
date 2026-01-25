// apiClient.ts
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { getAccessToken } from '../services/auth';
import { enqueueRequest, startNetworkListener } from './networkQueue';
// import { logout } from './api';

// 🔌 start listening once

const fetchWithCred = axios.create({
  baseURL: 'https://app.quickfoodshop.co.uk/v1',
  headers: {
    accept: 'application/json',
    // cache: 'no-store',
  },
});
startNetworkListener(fetchWithCred);

// 🚫 Block requests when offline
fetchWithCred.interceptors.request.use(
  async (config) => {
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

    // const originalRequest = error.config;

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   const newToken = await refreshToken();

    //   if (newToken) {
    //     originalRequest.headers.Authorization = `Bearer ${newToken}`;
    //     return fetchWithCred(originalRequest);
    //   } else {
    //     await logout();
    //   }
    // }

    return Promise.reject(error);
  },
);

export default fetchWithCred;
