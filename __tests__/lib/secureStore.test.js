import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { deleteItem, getItem, saveItem } from '@/lib/secureStore';

describe('secureStore', () => {
  describe('native', () => {
    it('saves with the WHEN_UNLOCKED keychain option', async () => {
      await saveItem('accessToken', 'abc');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'abc', {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    });

    it('round-trips a value', async () => {
      await saveItem('k', 'v');
      await expect(getItem('k')).resolves.toBe('v');
    });

    it('returns null for a missing key', async () => {
      await expect(getItem('missing')).resolves.toBeNull();
    });

    it('deletes a value', async () => {
      await saveItem('k', 'v');
      await deleteItem('k');
      await expect(getItem('k')).resolves.toBeNull();
    });
  });

  describe('web', () => {
    let restore;

    beforeEach(() => {
      SecureStore.setItemAsync.mockClear();
      SecureStore.getItemAsync.mockClear();
      SecureStore.deleteItemAsync.mockClear();
      restore = jest.replaceProperty(Platform, 'OS', 'web');
    });

    afterEach(() => restore.restore());

    it('never persists secrets (auth relies on cookies there)', async () => {
      await saveItem('accessToken', 'abc');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('reads nothing and deletes nothing', async () => {
      await expect(getItem('accessToken')).resolves.toBeUndefined();
      await deleteItem('accessToken');
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });
});
