// authContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  login as authLogin,
  logout as authLogout,
  refreshToken as authRefreshToken,
  getAccessToken,
  getUserData,
} from '../services/auth';
import { saveItem, getItem } from '../lib/secureStore';


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: check existing token + user data
  useEffect(() => {
    const bootstrap = async () => {
      const token = await getAccessToken();
      const userData = await getUserData();
      setUserToken(token);
      setUser(userData);
      setLoading(false);
    };
    bootstrap();
  }, []);

  // Standard login
  const login = async (email, password) => {
    const data = await authLogin(email, password);
    if (data) {
      setUserToken(data.accessToken);
      setUser(data.user);
      return true;
    }
    return false;
  };

  // Standard logout
  const logout = async () => {
    await authLogout();
    setUserToken(null);
    setUser(null);
  };

  // Refresh token manually
  const refresh = async () => {
    const newToken = await authRefreshToken();
    if (newToken) {
      const userData = await getUserData();
      setUserToken(newToken);
      setUser(userData);
      return true;
    }
    return false;
  };

  // Biometric auto-login
  const biometricLogin = async () => {
    // Step 1: biometric auth
    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock with biometrics',
      cancelLabel: 'Cancel',
    });

    if (!biometricResult.success) return false;

    // Step 2: get access token
    let token = await getAccessToken();

    // Step 3: if token missing or expired, try refresh token
    if (!token) {
      token = await authRefreshToken();
      if (!token) {
        await authLogout();
        return false; // cannot login
      }
    }

    // Step 4: get user data
    const userData = await getUserData();
    if (!userData) return false;

    // Step 5: update context state
    setUserToken(token);
    setUser(userData);
    return true;
  };

  return (
    <AuthContext.Provider value={{ userToken, user, loading, login, logout, biometricLogin, refresh }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};