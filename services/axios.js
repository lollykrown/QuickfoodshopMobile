// apiClient.ts
import axios from 'axios';
import { getAccessToken, refreshToken } from '../services/auth';
// import { logout } from './api';

const fetchWithCred = axios.create(
    { 
        baseURL: 'https://app.quickfoodshop.co.uk/v1' ,
        headers: {
            accept: "application/json",
            // cache: 'no-store',
        },
    });

fetchWithCred.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  // console.log('token', token)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

fetchWithCred.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      //no refressh token fron the backend upon login

      // originalRequest._retry = true;
      // const newToken = await refreshToken();
      // if (newToken) {
      //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
      //   return fetchWithCred(originalRequest);
      // } else {
        // await logout();
      // }
    }
    return Promise.reject(error);
  }
);

export default fetchWithCred;