// secureStore.ts
import * as SecureStore from 'expo-secure-store';

export async function saveItem(key, value) {
  return SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

export async function getItem(key) {
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key) {
  return SecureStore.deleteItemAsync(key);
}