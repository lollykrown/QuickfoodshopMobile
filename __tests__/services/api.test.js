import {
  CONFIG,
  fetchAllData,
  fetchAllStores,
  fetchFood,
  fetchFoodByID,
  fetchFoodExtras,
  fetchGroceries,
  fetchGroceriesStores,
  fetchPopularDishes,
  fetchPopularStores,
  fetchRestaurants,
  fetchStoreByID,
  forgetPwd,
  getOTP,
  resetPwd,
} from '@/services/api';

const BASE = 'https://app.quickfoodshop.co.uk/v1';

const ok = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body });
const fail = (body = {}, statusText = 'Server Error', status = 500) => ({
  ok: false,
  status,
  statusText,
  json: async () => body,
});

const lastCall = () => global.fetch.mock.calls[global.fetch.mock.calls.length - 1];

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

describe('CONFIG', () => {
  it('points at the production API with JSON headers', () => {
    expect(CONFIG.BASE_URL).toBe(BASE);
    expect(CONFIG.headers).toMatchObject({
      accept: 'application/json',
      'Content-Type': 'application/json',
    });
  });
});

describe('public GET helpers', () => {
  // [helper, args, expected URL, response body, expected return value]
  const cases = [
    [
      'fetchAllData',
      fetchAllData,
      { query: 'jollof rice' },
      `${BASE}/items/customers/all?search=jollof%20rice`,
      { data: [{ id: 1 }] },
      [{ id: 1 }],
    ],
    [
      'fetchFood',
      fetchFood,
      { query: 'a&b' },
      `${BASE}/items/customers/food?search=a%26b`,
      { data: ['food'] },
      ['food'],
    ],
    [
      'fetchFoodExtras',
      fetchFoodExtras,
      { query: 'sauce' },
      `${BASE}/items/customers/extras?search=sauce`,
      { data: ['extra'] },
      ['extra'],
    ],
    [
      'fetchGroceries',
      fetchGroceries,
      { query: 'rice' },
      `${BASE}/items/customers/groceries?search=rice`,
      { data: ['g'] },
      ['g'],
    ],
    [
      'fetchFoodByID',
      fetchFoodByID,
      { id: 'abc123' },
      `${BASE}/items/customers/abc123`,
      { data: { _id: 'abc123' } },
      { _id: 'abc123' },
    ],
    [
      'fetchStoreByID',
      fetchStoreByID,
      { id: 's1' },
      `${BASE}/stores/s1`,
      { data: { _id: 's1' } },
      { _id: 's1' },
    ],
    [
      'fetchRestaurants',
      fetchRestaurants,
      { query: 'pizza' },
      `${BASE}/stores/restaurant?search=pizza`,
      { data: { stores: ['r'] } },
      ['r'],
    ],
    [
      'fetchGroceriesStores',
      fetchGroceriesStores,
      { query: 'mart' },
      `${BASE}/stores/groceries?search=mart`,
      { data: { stores: ['gs'] } },
      ['gs'],
    ],
  ];

  it.each(cases)('%s requests the right URL and unwraps the payload', async (_n, fn, args, url, body, expected) => {
    global.fetch.mockResolvedValue(ok(body));

    await expect(fn(args)).resolves.toEqual(expected);

    expect(lastCall()[0]).toBe(url);
    expect(lastCall()[1]).toMatchObject({ method: 'GET', headers: CONFIG.headers });
  });

  it.each(cases)('%s throws when the response is not ok', async (_n, fn, args) => {
    global.fetch.mockResolvedValue(fail());
    await expect(fn(args)).rejects.toThrow(/Failed to fetch data/);
  });

  it('includes the HTTP status text in the error message', async () => {
    global.fetch.mockResolvedValue(fail({}, 'Bad Gateway', 502));
    await expect(fetchFood({ query: 'x' })).rejects.toThrow('Failed to fetch data: Bad Gateway');
  });

  it('fetchGroceries uses its own error message', async () => {
    global.fetch.mockResolvedValue(fail());
    await expect(fetchGroceries({ query: 'x' })).rejects.toThrow('Failed to fetch data groceries');
  });

  it('propagates network failures', async () => {
    global.fetch.mockRejectedValue(new Error('Network request failed'));
    await expect(fetchFood({ query: 'x' })).rejects.toThrow('Network request failed');
  });
});

describe('popular items', () => {
  it('fetchPopularDishes returns the raw JSON body', async () => {
    global.fetch.mockResolvedValue(ok({ data: ['dish'], status: 'success' }));

    await expect(fetchPopularDishes()).resolves.toEqual({ data: ['dish'], status: 'success' });
    expect(lastCall()[0]).toBe(`${BASE}/items/customers/popular-dishes`);
  });

  it('fetchPopularDishes throws its own error', async () => {
    global.fetch.mockResolvedValue(fail());
    await expect(fetchPopularDishes()).rejects.toThrow('Failed to fetch popular dishes');
  });

  it('fetchPopularStores throws its own error', async () => {
    global.fetch.mockResolvedValue(fail());
    await expect(fetchPopularStores()).rejects.toThrow('Failed to fetch popular stores');
  });

  // Known gap (see CLAUDE.md): fetchPopularStores currently reuses the popular-dishes endpoint.
  it('fetchPopularStores currently hits the popular-dishes endpoint', async () => {
    global.fetch.mockResolvedValue(ok({ data: [] }));
    await fetchPopularStores();
    expect(lastCall()[0]).toBe(`${BASE}/items/customers/popular-dishes`);
  });
});

describe('fetchAllStores', () => {
  it('lists every store when there is no query', async () => {
    global.fetch.mockResolvedValue(ok({ data: { stores: ['a', 'b'] } }));

    await expect(fetchAllStores({})).resolves.toEqual(['a', 'b']);
    expect(lastCall()[0]).toBe(`${BASE}/stores`);
  });

  it('searches by name when there is a query', async () => {
    global.fetch.mockResolvedValue(ok({ data: { stores: ['a'] } }));

    await fetchAllStores({ query: 'Joe & Co' });
    expect(lastCall()[0]).toBe(`${BASE}/stores/search?name=Joe%20%26%20Co`);
  });

  it('accepts a bare array in data as well as data.stores', async () => {
    global.fetch.mockResolvedValue(ok({ data: ['x', 'y'] }));
    await expect(fetchAllStores({ query: 'x' })).resolves.toEqual(['x', 'y']);
  });

  it('throws with the status text on failure', async () => {
    global.fetch.mockResolvedValue(fail({}, 'Not Found', 404));
    await expect(fetchAllStores({})).rejects.toThrow('Failed to fetch data: Not Found');
  });
});

describe('password reset helpers', () => {
  describe.each([
    ['forgetPwd', forgetPwd],
    ['getOTP', getOTP],
  ])('%s', (_name, fn) => {
    it.each([
      ['customer', '/auth/forget-password'],
      ['vendor', '/vendor/auth/forget-password'],
      ['rider', '/auth/rider/forget-password'],
    ])('posts the email to the %s endpoint', async (role, path) => {
      global.fetch.mockResolvedValue(ok({}));

      await expect(fn({ email: 'a@b.co', role })).resolves.toEqual({ success: true });

      expect(lastCall()[0]).toBe(`${BASE}${path}`);
      expect(lastCall()[1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.co' }),
      });
    });

    it('surfaces the backend message on failure', async () => {
      global.fetch.mockResolvedValue(fail({ message: 'No such user' }, 'Not Found', 404));
      await expect(fn({ email: 'a@b.co', role: 'customer' })).rejects.toThrow('No such user');
    });

    it('falls back to a generic message', async () => {
      global.fetch.mockResolvedValue(fail({}));
      await expect(fn({ email: 'a@b.co', role: 'customer' })).rejects.toThrow(
        'Failed to reset password',
      );
    });
  });

  it('getOTP is the same function as forgetPwd (resend uses the same endpoint)', () => {
    expect(getOTP).toBe(forgetPwd);
  });

  describe('resetPwd', () => {
    const payload = { otp_token: '123456', email: 'a@b.co', password: 'MyNewPass1!' };

    it.each([
      ['customer', '/auth/reset-password'],
      ['vendor', '/vendor/auth/reset-password'],
      ['rider', '/auth/rider/reset-password'],
    ])('PATCHes the %s endpoint', async (role, path) => {
      global.fetch.mockResolvedValue(ok({}));

      await expect(resetPwd({ payload, role })).resolves.toEqual({ success: true });

      expect(lastCall()[0]).toBe(`${BASE}${path}`);
      expect(lastCall()[1].method).toBe('PATCH');
    });

    it('sends exactly the payload it was given (never overrides the password)', async () => {
      global.fetch.mockResolvedValue(ok({}));

      await resetPwd({ payload, role: 'customer' });

      expect(JSON.parse(lastCall()[1].body)).toEqual(payload);
    });

    it('surfaces the backend message on failure', async () => {
      global.fetch.mockResolvedValue(fail({ message: 'OTP expired' }, 'Bad Request', 400));
      await expect(resetPwd({ payload, role: 'customer' })).rejects.toThrow('OTP expired');
    });
  });
});
