// secureStore.js
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function saveItem(key, value) {
  if (Platform.OS === 'web') {
    // Web auth uses HTTP-only session cookies
    // DO NOT store sensitive data
    return;
  }

  return SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

export async function getItem(key) {
  if (Platform.OS === 'web') {
    return;
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key) {
  if (Platform.OS === 'web') {
    return;
  }
  return SecureStore.deleteItemAsync(key);
}