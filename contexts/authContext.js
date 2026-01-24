// authContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  login as authLogin,
  refreshToken as authRefreshToken,
  getAccessToken,
  getUserData, 
} from '../services/auth';
import {   logout as authLogout,} from '../services/api'
import { saveItem, getItem } from '../lib/secureStore';


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // debugging
//   useEffect(() => {
//   console.log('🟢 AUTH PROVIDER STATE UPDATED:', {
//     userToken,
//     user,
//     isLoggedIn: Boolean(userToken),
//   });
// }, [userToken, user]);

  // Bootstrap: check existing token + user data
  useEffect(() => {
    const bootstrap = async () => {
      // simulate delay
      // await new Promise((res) => setTimeout(() => {
      //   res(null)
      // }, 2000))

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
    // console.log('Context',data)
    if (data) {
      setUserToken(data.token);
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

    const isLoggedIn = Boolean(userToken);
  return (
    <AuthContext.Provider value={{ userToken, isLoggedIn, user, loading, login, logout, biometricLogin, refresh }}>
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