import fs from 'fs';
import path from 'path';
import { menuOptions, priceFormat } from '@/utils/misc';

describe('priceFormat', () => {
  it('formats numbers as GBP', () => {
    expect(priceFormat(1234.5)).toBe('£1,234.50');
    expect(priceFormat(0)).toBe('£0.00');
  });

  it('accepts numeric strings', () => {
    expect(priceFormat('5')).toBe('£5.00');
  });

  it('falls back to £0.00 for non-numeric input', () => {
    expect(priceFormat('abc')).toBe('£0.00');
    expect(priceFormat(undefined)).toBe('£0.00');
    expect(priceFormat(null)).toBe('£0.00');
  });
});

describe('menuOptions', () => {
  const router = { push: jest.fn() };
  const labels = (items) => items.map((i) => i.label);

  beforeEach(() => router.push.mockClear());

  describe('signed out', () => {
    it('offers only a login entry, regardless of role', () => {
      const items = menuOptions('/home', router, 'customer', false);
      expect(labels(items)).toEqual(['Login to account']);
    });

    it('sends the user to the customer login with prev=home', () => {
      menuOptions('/home', router, undefined, false)[0].onPress();
      expect(router.push).toHaveBeenCalledWith('/customer/login?prev=home');
    });

    it('marks the entry active only on /login', () => {
      expect(menuOptions('/login', router, undefined, false)[0].active).toBe(true);
      expect(menuOptions('/home', router, undefined, false)[0].active).toBe(false);
    });
  });

  describe('per role', () => {
    it('customer menu', () => {
      expect(labels(menuOptions('/home', router, 'customer', true))).toEqual([
        'Dashboard',
        'Orders',
        'Tracking',
        'Transactions',
        'My Invoice',
        'My favorites',
        'Settings',
      ]);
    });

    it('vendor menu', () => {
      expect(labels(menuOptions('/home', router, 'vendor', true))).toEqual([
        'Dashboard',
        'Orders',
        'Tracking',
        'Assigned Riders',
        'Transactions',
        'Invoice',
        'My Store',
        'Withdrawal',
        'Settings',
      ]);
    });

    it('rider menu (any other role)', () => {
      expect(labels(menuOptions('/home', router, 'rider', true))).toEqual([
        'Dashboard',
        'Orders',
        'Requests',
        'Tracking',
        'Transactions',
        'Withdrawal',
        'Settings',
      ]);
    });
  });

  describe('active state', () => {
    it('Dashboard is active only on the exact /dashboard path', () => {
      const on = menuOptions('/dashboard', router, 'customer', true);
      const off = menuOptions('/dashboard/orders', router, 'customer', true);
      expect(on.find((i) => i.label === 'Dashboard').active).toBe(true);
      expect(off.find((i) => i.label === 'Dashboard').active).toBe(false);
    });

    it('other entries are active when the path contains their segment', () => {
      const items = menuOptions('/dashboard/orders/123', router, 'customer', true);
      expect(items.filter((i) => i.active).map((i) => i.label)).toEqual(['Orders']);
    });
  });

  it('every entry navigates to its own route on press', () => {
    const items = menuOptions('/home', router, 'customer', true);
    items.forEach((item) => item.onPress());
    expect(router.push.mock.calls.map(([p]) => p)).toEqual([
      '/dashboard',
      '/dashboard/orders',
      '/dashboard/tracking',
      '/dashboard/transactions',
      '/dashboard/invoice',
      '/dashboard/favorites',
      '/dashboard/settings',
    ]);
  });

  describe('route existence', () => {
    // Known gap (see CLAUDE.md): these menu entries point at screens that don't exist yet.
    // When you add a screen, delete it from this list. The test below then keeps it honest.
    const KNOWN_MISSING = new Set([
      '/dashboard/store',
      '/dashboard/withdrawal',
      '/dashboard/requests',
    ]);

    const routeExists = (route) => {
      const base = path.join(__dirname, '..', '..', 'app', route.replace(/^\//, ''));
      return (
        fs.existsSync(`${base}.jsx`) ||
        fs.existsSync(path.join(base, 'index.jsx')) ||
        fs.existsSync(path.join(base, '_layout.jsx'))
      );
    };

    const collect = (role) => {
      const captured = [];
      const spy = { push: (p) => captured.push(p) };
      menuOptions('/home', spy, role, true).forEach((i) => i.onPress());
      return captured;
    };

    it.each(['customer', 'vendor', 'rider'])('%s menu only links to real screens', (role) => {
      const missing = collect(role).filter((r) => !routeExists(r));
      const unexpected = missing.filter((r) => !KNOWN_MISSING.has(r));
      expect(unexpected).toEqual([]);
    });

    it('KNOWN_MISSING has no stale entries', () => {
      const stale = [...KNOWN_MISSING].filter(routeExists);
      expect(stale).toEqual([]);
    });
  });
});
