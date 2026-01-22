// apiClient.ts
import axios from 'axios';
import { getAccessToken, refreshToken, logout } from '../lib/secureStore';

const api = axios.create(
    { 
        baseURL: 'https://app.quickfoodshop.co.uk/v1' ,
        headers: {
            accept: "application/json",
            // cache: 'no-store',
        },
    });

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        await logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;