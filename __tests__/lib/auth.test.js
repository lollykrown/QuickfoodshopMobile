const API = 'https://app.quickfoodshop.co.uk/v1';

const jsonResponse = (body, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => body,
});

// The auth module keeps `isLoggingOut` at module scope and registers axios interceptors on import,
// so every test gets a fresh copy (and therefore a fresh mock keychain/NetInfo).
function load({ queue } = {}) {
  jest.resetModules();
  if (queue) jest.doMock('@/utils/networkQueue', () => queue);
  const auth = require('@/lib/auth');
  const secure = require('expo-secure-store');
  const NetInfo = require('@react-native-community/netinfo');
  // Must be the same `react-native` instance that lib/auth just loaded.
  const { Alert } = require('react-native');
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  // Fake transport for the axios instance. `sent` snapshots each request as it is made (axios
  // reuses and mutates the config object on retry, so a live reference would be misleading).
  const sent = [];
  auth.fetchWithCred.defaults.adapter = jest.fn(async (config) => {
    sent.push({
      url: config.url,
      method: config.method,
      authorization: config.headers?.Authorization,
    });
    return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
  });
  return { auth, secure, NetInfo, sent, alertSpy, adapter: auth.fetchWithCred.defaults.adapter };
}

const unauthorized = (config) =>
  Object.assign(new Error('Request failed with status code 401'), {
    isAxiosError: true,
    config,
    response: { status: 401, data: {} },
  });

describe('lib/auth', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
    jest.dontMock('@/utils/networkQueue');
  });

  describe('login', () => {
    it.each([
      ['customer', '/auth/login'],
      ['vendor', '/vendor/auth/login'],
      ['rider', '/auth/rider/login'],
    ])('posts to the %s endpoint', async (role, path) => {
      const { auth } = load();
      global.fetch.mockResolvedValue(jsonResponse({ token: 't', user: { id: 1 } }));

      await auth.login('a@b.co', 'secret1', role);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API}${path}`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email: 'a@b.co', password: 'secret1' }),
        }),
      );
    });

    it('returns the token and the user with the role attached', async () => {
      const { auth } = load();
      global.fetch.mockResolvedValue(jsonResponse({ token: 't', user: { id: 1, email: 'a@b.co' } }));

      await expect(auth.login('a@b.co', 'pw', 'vendor')).resolves.toEqual({
        token: 't',
        user: { id: 1, email: 'a@b.co', role: 'vendor' },
      });
    });

    it('persists the token and user data in secure storage', async () => {
      const { auth, secure } = load();
      global.fetch.mockResolvedValue(jsonResponse({ token: 't', user: { id: 1 } }));

      await auth.login('a@b.co', 'pw', 'customer');

      expect(secure.__store.get('accessToken')).toBe('t');
      expect(JSON.parse(secure.__store.get('userData'))).toEqual({ id: 1, role: 'customer' });
    });

    it.each([['token'], ['accessToken'], ['access_token']])(
      'accepts the token under `%s`',
      async (key) => {
        const { auth } = load();
        global.fetch.mockResolvedValue(jsonResponse({ [key]: 'tok', user: {} }));
        await expect(auth.login('a@b.co', 'pw', 'customer')).resolves.toMatchObject({ token: 'tok' });
      },
    );

    it('falls back to data.data.user when the user is nested', async () => {
      const { auth } = load();
      global.fetch.mockResolvedValue(
        jsonResponse({ token: 't', data: { user: { id: 9, firstName: 'Ada' } } }),
      );

      const { user } = await auth.login('a@b.co', 'pw', 'customer');
      expect(user).toEqual({ id: 9, firstName: 'Ada', role: 'customer' });
    });

    it('stores a refresh token only when the backend returns one', async () => {
      const first = load();
      global.fetch.mockResolvedValue(jsonResponse({ token: 't', user: {} }));
      await first.auth.login('a@b.co', 'pw', 'customer');
      expect(first.secure.__store.has('refreshToken')).toBe(false);

      const second = load();
      global.fetch.mockResolvedValue(jsonResponse({ token: 't', refreshToken: 'r1', user: {} }));
      await second.auth.login('a@b.co', 'pw', 'customer');
      expect(second.secure.__store.get('refreshToken')).toBe('r1');

      const third = load();
      global.fetch.mockResolvedValue(jsonResponse({ token: 't', refresh_token: 'r2', user: {} }));
      await third.auth.login('a@b.co', 'pw', 'customer');
      expect(third.secure.__store.get('refreshToken')).toBe('r2');
    });

    it('throws when a successful response has no token', async () => {
      const { auth } = load();
      global.fetch.mockResolvedValue(jsonResponse({ user: {} }));
      await expect(auth.login('a@b.co', 'pw', 'customer')).rejects.toThrow(
        'NO TOKEN IN LOGIN RESPONSE',
      );
    });

    it('alerts and returns the backend message on failure, storing nothing', async () => {
      const { auth, secure, alertSpy } = load();
      global.fetch.mockResolvedValue(jsonResponse({ message: 'Invalid credentials' }, false, 401));

      await expect(auth.login('a@b.co', 'bad', 'customer')).resolves.toBe('Invalid credentials');
      expect(alertSpy).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
      expect(secure.__store.size).toBe(0);
    });

    it('falls back to a generic message when the backend gives none', async () => {
      const { auth, alertSpy } = load();
      global.fetch.mockResolvedValue(jsonResponse({}, false, 500));
      await auth.login('a@b.co', 'bad', 'customer');
      expect(alertSpy).toHaveBeenCalledWith('Login Failed', 'Unknown error');
    });
  });

  describe('stored session', () => {
    it('getAccessToken / getUserData return null when signed out', async () => {
      const { auth } = load();
      await expect(auth.getAccessToken()).resolves.toBeNull();
      await expect(auth.getUserData()).resolves.toBeNull();
    });

    it('reads the token and parses the stored user', async () => {
      const { auth, secure } = load();
      secure.__store.set('accessToken', 'tok');
      secure.__store.set('userData', JSON.stringify({ id: 3, role: 'rider' }));

      await expect(auth.getAccessToken()).resolves.toBe('tok');
      await expect(auth.getUserData()).resolves.toEqual({ id: 3, role: 'rider' });
    });
  });

  describe('refreshToken', () => {
    it('returns null without calling the network when there is no refresh token', async () => {
      const { auth } = load();
      await expect(auth.refreshToken()).resolves.toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('exchanges the refresh token and stores the new access token and user', async () => {
      const { auth, secure } = load();
      secure.__store.set('refreshToken', 'r1');
      global.fetch.mockResolvedValue(
        jsonResponse({ accessToken: 'new', user: { id: 1, firstName: 'Ada' } }),
      );

      await expect(auth.refreshToken()).resolves.toBe('new');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API}/refresh`,
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'r1' }) }),
      );
      expect(secure.__store.get('accessToken')).toBe('new');
      expect(JSON.parse(secure.__store.get('userData'))).toEqual({ id: 1, firstName: 'Ada' });
    });

    it('leaves the stored user alone when the response has none', async () => {
      const { auth, secure } = load();
      secure.__store.set('refreshToken', 'r1');
      secure.__store.set('userData', JSON.stringify({ id: 7 }));
      global.fetch.mockResolvedValue(jsonResponse({ accessToken: 'new' }));

      await auth.refreshToken();
      expect(JSON.parse(secure.__store.get('userData'))).toEqual({ id: 7 });
    });

    it('logs the user out and returns null when the refresh is rejected', async () => {
      const { auth, secure } = load();
      secure.__store.set('accessToken', 'old');
      secure.__store.set('refreshToken', 'expired');
      secure.__store.set('userData', '{}');
      global.fetch.mockResolvedValue(jsonResponse({ message: 'expired' }, false, 401));

      await expect(auth.refreshToken()).resolves.toBeNull();
      expect(secure.__store.size).toBe(0);
    });
  });

  describe('logout', () => {
    const seed = (secure) => {
      secure.__store.set('accessToken', 'tok');
      secure.__store.set('refreshToken', 'r');
      secure.__store.set('userData', '{}');
    };

    it('calls the logout endpoint without an auth header and clears all secure storage', async () => {
      const { auth, secure, sent } = load();
      seed(secure);

      await auth.logout();

      expect(sent).toHaveLength(1);
      expect(sent[0].url).toBe('/auth/logout');
      expect(sent[0].method).toBe('get');
      expect(sent[0].authorization).toBeUndefined();
      expect(secure.__store.size).toBe(0);
    });

    it('still clears local credentials when the server call fails', async () => {
      const { auth, secure, adapter } = load();
      seed(secure);
      adapter.mockRejectedValue(
        Object.assign(new Error('500'), { response: { status: 500, data: { message: 'boom' } } }),
      );

      await expect(auth.logout()).resolves.toBeUndefined();
      expect(secure.__store.size).toBe(0);
    });

    it('ignores a second logout while one is in flight', async () => {
      const { auth, secure, adapter } = load();
      seed(secure);

      await Promise.all([auth.logout(), auth.logout()]);

      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it('can log out again afterwards', async () => {
      const { auth, adapter } = load();
      await auth.logout();
      await auth.logout();
      expect(adapter).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchWithCred request interceptor', () => {
    it('adds the stored access token as a Bearer header', async () => {
      const { auth, secure, sent } = load();
      secure.__store.set('accessToken', 'tok');

      await auth.fetchWithCred.get('/auth/profile');

      expect(sent[0].authorization).toBe('Bearer tok');
    });

    it('sends no Authorization header when signed out', async () => {
      const { auth, sent } = load();
      await auth.fetchWithCred.get('/auth/profile');
      expect(sent[0].authorization).toBeUndefined();
    });

    it('skips auth handling entirely when skipAuth is set', async () => {
      const { auth, secure, NetInfo, sent } = load();
      secure.__store.set('accessToken', 'tok');
      NetInfo.fetch.mockClear();

      await auth.fetchWithCred.get('/public', { skipAuth: true });

      expect(NetInfo.fetch).not.toHaveBeenCalled();
      expect(sent[0].authorization).toBeUndefined();
    });

    it('queues the request instead of sending it while offline', async () => {
      const queue = {
        enqueueRequest: jest.fn(() => Promise.resolve({ data: 'queued', status: 202 })),
        startNetworkListener: jest.fn(),
      };
      const { auth, NetInfo, adapter } = load({ queue });
      NetInfo.fetch.mockResolvedValue({ isConnected: false });

      await auth.fetchWithCred.get('/auth/profile');

      expect(queue.enqueueRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/profile' }));
      expect(adapter).not.toHaveBeenCalled();
    });

    it('holds a request while offline and completes it, with the token, once back online', async () => {
      const { auth, secure, NetInfo, adapter, sent } = load();
      secure.__store.set('accessToken', 'tok');
      NetInfo.fetch.mockResolvedValue({ isConnected: false });

      const pending = auth.fetchWithCred.get('/auth/profile');
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(adapter).not.toHaveBeenCalled();

      NetInfo.fetch.mockResolvedValue({ isConnected: true });
      NetInfo.addEventListener.mock.calls[0][0]({ isConnected: true });

      const res = await pending;
      expect(res.data).toEqual({ ok: true });
      expect(adapter).toHaveBeenCalledTimes(1);
      expect(sent[0]).toMatchObject({ url: '/auth/profile', authorization: 'Bearer tok' });
    });

    it('starts the offline replay listener on the axios instance', () => {
      const queue = { enqueueRequest: jest.fn(), startNetworkListener: jest.fn() };
      const { auth } = load({ queue });
      expect(queue.startNetworkListener).toHaveBeenCalledWith(auth.fetchWithCred);
    });

    it('is configured for the API with credentials', () => {
      const { auth } = load();
      expect(auth.fetchWithCred.defaults.baseURL).toBe(API);
      expect(auth.fetchWithCred.defaults.withCredentials).toBe(true);
    });
  });

  describe('fetchWithCred 401 handling', () => {
    it('refreshes the token and retries the request once with the new token', async () => {
      const { auth, secure, adapter, sent } = load();
      secure.__store.set('accessToken', 'old');
      secure.__store.set('refreshToken', 'r1');
      global.fetch.mockResolvedValue(jsonResponse({ accessToken: 'new' }));
      adapter.mockImplementationOnce(async (config) => {
        sent.push({ url: config.url, method: config.method, authorization: config.headers?.Authorization });
        throw unauthorized(config);
      });

      const res = await auth.fetchWithCred.get('/auth/profile');

      expect(res.data).toEqual({ ok: true });
      expect(adapter).toHaveBeenCalledTimes(2);
      expect(sent[0].authorization).toBe('Bearer old');
      expect(sent[1].authorization).toBe('Bearer new');
    });

    it('does not retry forever when the retried request is unauthorized again', async () => {
      const { auth, secure, adapter } = load();
      secure.__store.set('accessToken', 'old');
      secure.__store.set('refreshToken', 'r1');
      global.fetch.mockResolvedValue(jsonResponse({ accessToken: 'new' }));
      adapter.mockImplementation(async (config) => {
        if (config.url === '/auth/logout') return { data: {}, status: 200, headers: {}, config };
        throw unauthorized(config);
      });

      await expect(auth.fetchWithCred.get('/auth/profile')).rejects.toThrow('401');

      const profileCalls = adapter.mock.calls.filter(([c]) => c.url === '/auth/profile');
      expect(profileCalls).toHaveLength(2);
    });

    it('logs out and rejects when the token cannot be refreshed', async () => {
      const { auth, secure, adapter } = load();
      secure.__store.set('accessToken', 'old');
      secure.__store.set('userData', '{}');
      // No refresh token stored -> refreshToken() resolves null.
      adapter.mockImplementation(async (config) => {
        if (config.url === '/auth/logout') return { data: {}, status: 200, headers: {}, config };
        throw unauthorized(config);
      });

      await expect(auth.fetchWithCred.get('/auth/profile')).rejects.toThrow('401');

      expect(adapter.mock.calls.map(([c]) => c.url)).toContain('/auth/logout');
      expect(secure.__store.size).toBe(0);
    });

    it('passes through non-401 errors untouched', async () => {
      const { auth, adapter } = load();
      const serverError = Object.assign(new Error('500'), {
        isAxiosError: true,
        response: { status: 500 },
      });
      adapter.mockRejectedValue(serverError);

      await expect(auth.fetchWithCred.get('/x')).rejects.toBe(serverError);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('passes offline errors through without trying to refresh', async () => {
      const { auth, adapter } = load();
      const offline = Object.assign(new Error('offline'), { isOffline: true, response: { status: 401 } });
      adapter.mockRejectedValue(offline);

      await expect(auth.fetchWithCred.get('/x')).rejects.toBe(offline);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

describe('lib/auth (logout edge cases)', () => {
  it('rejects ordinary requests while a logout is in progress', async () => {
    const { auth, adapter } = load();
    let finish;
    adapter.mockImplementationOnce(
      () => new Promise((resolve) => (finish = () => resolve({ data: {}, status: 200, headers: {}, config: {} }))),
    );

    const loggingOut = auth.logout();
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(auth.fetchWithCred.get('/auth/profile')).rejects.toThrow('Logout in progress');

    finish();
    await loggingOut;
  });

  // logout() swallows server errors (local credentials are cleared regardless) but logs them.
  it.each([
    ['a server message', { response: { data: { message: 'Session not found' } } }, 'Session not found'],
    ['a server error without a message', { response: { data: {} } }, 'Server error'],
    ['no response at all', { request: {} }, 'Network error'],
    ['anything else', new Error('boom'), 'Unexpected error'],
  ])('logs %s from the logout endpoint as "%s"', async (_label, failure, expected) => {
    const { auth, adapter } = load();
    adapter.mockRejectedValue(failure);

    await auth.logout();

    expect(console.log).toHaveBeenCalledWith('Logout failed:', expect.objectContaining({ message: expected }));
  });
});
