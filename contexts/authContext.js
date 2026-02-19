// authContext.tsx
import img from '@/assets/images/avatar.png';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  login as authLogin,
  refreshToken as authRefreshToken,
  getAccessToken,
  getUserData,
  logout as authLogout, updateProfile
} from '../lib/auth';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isExisting, setIsExisting] = useState(null);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
const isLoggingOutRef = useRef(false);

  // Bootstrap: check existing token + user data
  useEffect(() => {
    const bootstrap = async () => {
      // simulate delay
      // await new Promise((res) => setTimeout(() => {
      //   res(null)
      // }, 2000))
      const existing = await AsyncStorage.getItem('existing');
      if (existing){ 
        setIsExisting(true)
      }
      //testing
      //AsyncStorage.removeItem('existing')

      const token = await getAccessToken();
      const userData = await getUserData();
      setUserToken(token);
      if (!userData?.location) {
        setUser({
          ...userData,
          image:
            'https://quickfoods.lon1.digitaloceanspaces.com/quickfoods/5ee24051-f0b1-43b5-bf0c-b8bb932cfbe9_1769210301204_2996F1DD-1F92-4340-B4A8-B8FA9AEA56B6.png',
        });
      } else {
        setUser(userData);
      }
      setAvatar(img);

      setLoading(false);
    };
    bootstrap();
  }, []);
  // Standard login
  const login = async (email, password, role) => {
    const data = await authLogin(email, password, role);
    const existing = await AsyncStorage.getItem('existing');

    if (data.token) {
      setUserToken(data.token);
      setUser({...data.user});
      if (existing===null ){ 
        await AsyncStorage.setItem('existing','true')
        setIsExisting(true)
      }else{
        setIsExisting(true)
      }

      return true;
    }
    return { error: data };
  };
  // Standard login
  const update = async (payload) => {
    const data = await updateProfile(payload);
    // console.log('Context',data)
    if (data.email) {
      const { id, firstName, lastName, phoneNumber, email, photo } = data;
      setUser({ id, firstName, lastName, phoneNumber, email, photo });
      return true;
    }
    return { error: data };
  };

  // Standard logout
const logout = async () => {
    if (isLoggingOutRef.current) return; // 🔒 true lock
    isLoggingOutRef.current = true; // 🔒 engage lock

  try {
    setLoading(true);

    await authLogout();
    setUserToken(null);
    setUser(null);

    Alert.alert('Logged out', 'You have been successfully logged out.');
  } catch (err) {
    console.error('Logout error:', err);
    Alert.alert('Error', 'Failed to log out.');
  } finally {
    setLoading(false);
    isLoggingOutRef.current = false;
  }
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
    <AuthContext.Provider
      value={{
        userToken,
        avatar,
        isLoggedIn,
        isExisting,
        user,
        loading,
        login,
        update,
        logout,
        biometricLogin,
        refresh,
      }}
    >
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
