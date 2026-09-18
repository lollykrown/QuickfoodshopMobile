import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/authContext';
import * as authLib from '@/lib/auth';
import { updateProfile } from '@/services/dashboardApi';

jest.mock('@/lib/auth', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  getAccessToken: jest.fn(),
  getUserData: jest.fn(),
}));
jest.mock('@/services/dashboardApi', () => ({ updateProfile: jest.fn() }));
jest.mock('expo-local-authentication', () => ({ authenticateAsync: jest.fn() }));

const DEFAULT_AVATAR_URL = expect.stringContaining('digitaloceanspaces.com');

const customer = { id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'customer' };

function setup({ token = null, user = null } = {}) {
  authLib.getAccessToken.mockResolvedValue(token);
  authLib.getUserData.mockResolvedValue(user);
  const hook = renderHook(() => useAuth(), { wrapper: AuthProvider });
  return hook;
}

// AuthProvider bootstraps asynchronously (reads storage), so wait for the avatar it sets last.
const settled = (result) => waitFor(() => expect(result.current.avatar).not.toBeNull());

let alertSpy;

beforeEach(() => {
  // mockReset (not clearAllMocks): implementations must not leak between tests.
  Object.values(authLib)
    .filter((fn) => typeof fn?.mockReset === 'function')
    .forEach((fn) => fn.mockReset());
  updateProfile.mockReset();
  LocalAuthentication.authenticateAsync.mockReset();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => alertSpy.mockRestore());

describe('useAuth', () => {
  it('throws when used outside an AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});

describe('bootstrap', () => {
  it('starts signed out when nothing is stored', async () => {
    const { result } = setup();
    await settled(result);

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.userToken).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('restores a stored session', async () => {
    const { result } = setup({ token: 'tok', user: { ...customer, location: 'Sunderland' } });
    await settled(result);

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.userToken).toBe('tok');
    expect(result.current.user).toEqual({ ...customer, location: 'Sunderland' });
  });

  it('adds a default image when the stored user has no location', async () => {
    const { result } = setup({ token: 'tok', user: customer });
    await settled(result);

    expect(result.current.user).toEqual({ ...customer, image: DEFAULT_AVATAR_URL });
  });

  it('flags a returning user from AsyncStorage', async () => {
    await AsyncStorage.setItem('existing', 'true');
    const { result } = setup();
    await waitFor(() => expect(result.current.isExisting).toBe(true));
  });

  it('leaves isExisting unset for a first-time user', async () => {
    const { result } = setup();
    await settled(result);
    expect(result.current.isExisting).toBeNull();
  });

  it('exposes a fallback avatar', async () => {
    const { result } = setup();
    await settled(result);
    expect(result.current.avatar).toBeTruthy();
  });
});

describe('login', () => {
  it('signs in, stores the user and remembers the device as existing', async () => {
    authLib.login.mockResolvedValue({ token: 'tok', user: customer });
    const { result } = setup();
    await settled(result);

    let outcome;
    await act(async () => {
      outcome = await result.current.login('ada@example.com', 'pw', 'customer');
    });

    expect(outcome).toBe(true);
    expect(authLib.login).toHaveBeenCalledWith('ada@example.com', 'pw', 'customer');
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual(customer);
    expect(result.current.isExisting).toBe(true);
    await expect(AsyncStorage.getItem('existing')).resolves.toBe('true');
  });

  it('returns the error and stays signed out when the backend rejects the login', async () => {
    authLib.login.mockResolvedValue('Invalid credentials');
    const { result } = setup();
    await settled(result);

    let outcome;
    await act(async () => {
      outcome = await result.current.login('ada@example.com', 'bad', 'customer');
    });

    expect(outcome).toEqual({ error: 'Invalid credentials' });
    expect(result.current.isLoggedIn).toBe(false);
    await expect(AsyncStorage.getItem('existing')).resolves.toBeNull();
  });
});

describe('update (profile)', () => {
  const start = async () => {
    const hook = setup({ token: 'tok', user: { ...customer, location: 'Sunderland', image: 'img.png' } });
    await settled(hook.result);
    return hook;
  };
  const changed = { id: 'u1', firstName: 'Augusta', lastName: 'King', phoneNumber: '07123456789', email: 'ada@example.com', photo: 'p.png' };

  it.each([
    ['bare profile', changed],
    ['{ data }', { data: changed }],
    ['{ data: { user } }', { data: { user: changed } }],
  ])('accepts a %s response and merges it into the user', async (_label, response) => {
    updateProfile.mockResolvedValue(response);
    const { result } = await start();

    let outcome;
    await act(async () => {
      outcome = await result.current.update({ firstName: 'Augusta' });
    });

    expect(outcome).toBe(true);
    expect(updateProfile).toHaveBeenCalledWith({ payload: { firstName: 'Augusta' } });
    expect(result.current.user).toMatchObject({ firstName: 'Augusta', lastName: 'King', photo: 'p.png' });
  });

  it('keeps the role, location and image already on the user', async () => {
    updateProfile.mockResolvedValue(changed);
    const { result } = await start();

    await act(async () => {
      await result.current.update({});
    });

    expect(result.current.user).toMatchObject({ role: 'customer', location: 'Sunderland', image: 'img.png' });
  });

  it('returns an error when the response has no profile', async () => {
    updateProfile.mockResolvedValue({ status: 'fail' });
    const { result } = await start();

    let outcome;
    await act(async () => {
      outcome = await result.current.update({});
    });

    expect(outcome).toEqual({ error: { status: 'fail' } });
    expect(result.current.user.firstName).toBe('Ada');
  });

  it('returns the error message when the request throws', async () => {
    updateProfile.mockRejectedValue(new Error('Network error'));
    const { result } = await start();

    let outcome;
    await act(async () => {
      outcome = await result.current.update({});
    });

    expect(outcome).toEqual({ error: 'Network error' });
  });
});

describe('logout', () => {
  it('clears the session, alerts, and resets loading', async () => {
    authLib.logout.mockResolvedValue(undefined);
    const { result } = setup({ token: 'tok', user: customer });
    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(authLib.logout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isLoggedIn).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Logged out', 'You have been successfully logged out.');
  });

  it('alerts and keeps the session when logging out fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    authLib.logout.mockRejectedValue(new Error('boom'));
    const { result } = setup({ token: 'tok', user: customer });
    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to log out.');
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLoggedIn).toBe(true);
    spy.mockRestore();
  });

  it('ignores a second logout while one is in progress', async () => {
    let finish;
    authLib.logout.mockImplementation(() => new Promise((resolve) => (finish = resolve)));
    const { result } = setup({ token: 'tok', user: customer });
    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));

    const { logout } = result.current;
    let first;
    let second;
    await act(async () => {
      first = logout();
      second = logout();
      await Promise.resolve();
      finish();
      await Promise.all([first, second]);
    });

    expect(authLib.logout).toHaveBeenCalledTimes(1);
  });
});

describe('refresh', () => {
  it('replaces the token and user when the refresh succeeds', async () => {
    authLib.refreshToken.mockResolvedValue('fresh');
    const { result } = setup({ token: 'old', user: { ...customer, location: 'x' } });
    await settled(result);
    authLib.getUserData.mockResolvedValue({ ...customer, firstName: 'Renewed', location: 'x' });

    let outcome;
    await act(async () => {
      outcome = await result.current.refresh();
    });

    expect(outcome).toBe(true);
    expect(result.current.userToken).toBe('fresh');
    expect(result.current.user.firstName).toBe('Renewed');
  });

  it('returns false and leaves state alone when there is no new token', async () => {
    authLib.refreshToken.mockResolvedValue(null);
    const { result } = setup({ token: 'old', user: customer });
    await settled(result);

    let outcome;
    await act(async () => {
      outcome = await result.current.refresh();
    });

    expect(outcome).toBe(false);
    expect(result.current.userToken).toBe('old');
  });
});

describe('biometricLogin', () => {
  it('fails without touching the session when biometrics are rejected', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: false });
    const { result } = setup();
    await settled(result);

    let outcome;
    await act(async () => {
      outcome = await result.current.biometricLogin();
    });

    expect(outcome).toBe(false);
    expect(authLib.getAccessToken).toHaveBeenCalledTimes(1); // only the bootstrap read
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('signs in with the stored token and user after a successful scan', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true });
    const { result } = setup();
    await settled(result);
    authLib.getAccessToken.mockResolvedValue('stored');
    authLib.getUserData.mockResolvedValue(customer);

    let outcome;
    await act(async () => {
      outcome = await result.current.biometricLogin();
    });

    expect(outcome).toBe(true);
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: 'Unlock with biometrics' }),
    );
    expect(result.current.userToken).toBe('stored');
    expect(result.current.user).toEqual(customer);
  });

  it('tries a token refresh when no access token is stored', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true });
    const { result } = setup();
    await settled(result);
    authLib.refreshToken.mockResolvedValue('refreshed');
    authLib.getUserData.mockResolvedValue(customer);

    let outcome;
    await act(async () => {
      outcome = await result.current.biometricLogin();
    });

    expect(outcome).toBe(true);
    expect(result.current.userToken).toBe('refreshed');
  });

  it('logs out and fails when neither a token nor a refresh is available', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true });
    const { result } = setup();
    await settled(result);
    authLib.refreshToken.mockResolvedValue(null);

    let outcome;
    await act(async () => {
      outcome = await result.current.biometricLogin();
    });

    expect(outcome).toBe(false);
    expect(authLib.logout).toHaveBeenCalledTimes(1);
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('fails when there is a token but no stored user', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true });
    const { result } = setup();
    await settled(result);
    authLib.getAccessToken.mockResolvedValue('stored');
    authLib.getUserData.mockResolvedValue(null);

    let outcome;
    await act(async () => {
      outcome = await result.current.biometricLogin();
    });

    expect(outcome).toBe(false);
    expect(result.current.isLoggedIn).toBe(false);
  });
});
