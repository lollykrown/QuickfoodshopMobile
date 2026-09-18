import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { CartProvider, useCart } from '@/contexts/cartContext';
import { useAuth } from '@/contexts/authContext';

jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));

// A backend item, as the catalogue endpoints return it.
const jollof = {
  _id: 'item1',
  itemName: 'Jollof Rice',
  price: 8.5,
  description: 'Spicy',
  categoryId: { name: 'Food' },
  isAvailable: true,
  vendorId: { location: 'Sunderland' },
  image: 'jollof.png',
};
const plantain = { ...jollof, _id: 'item2', itemName: 'Plantain', price: 3 };

const cartLine = (id, overrides = {}) => ({
  id,
  name: `Item ${id}`,
  price: 10,
  quantity: 1,
  ...overrides,
});

const storedCart = async (key = 'cartItems_guest') => JSON.parse(await AsyncStorage.getItem(key));

// The cart loads persisted data asynchronously; wait until that has happened.
async function setup({ user = null, items, address } = {}) {
  useAuth.mockReturnValue({ user });
  if (items) await AsyncStorage.setItem(user?.id ? `cartItems_${user.id}` : 'cartItems_guest', JSON.stringify(items));
  if (address) await AsyncStorage.setItem('address', JSON.stringify(address));

  const hook = renderHook(() => useCart(), { wrapper: CartProvider });
  if (items) await waitFor(() => expect(hook.result.current.cartItems).toHaveLength(items.length));
  if (address) await waitFor(() => expect(hook.result.current.deliveryAddress).toEqual(address));
  // Let the whole async load chain (several awaited storage reads) finish before the test acts.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return hook;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCart outside a provider', () => {
  it('returns undefined rather than throwing (no guard in the hook)', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current).toBeUndefined();
  });
});

describe('initial state', () => {
  it('starts empty', async () => {
    const { result } = await setup();
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.deliveryAddress).toBeNull();
    expect(result.current.cartCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });
});

describe('addToCart', () => {
  it('maps a backend item to a cart line with quantity 1', async () => {
    const { result } = await setup();

    act(() => result.current.addToCart(jollof));

    expect(result.current.cartItems).toEqual([
      {
        id: 'item1',
        name: 'Jollof Rice',
        price: 8.5,
        quantity: 1,
        description: 'Spicy',
        category: 'Food',
        isAvailable: true,
        location: 'Sunderland',
        image: 'jollof.png',
      },
    ]);
  });

  it('ignores an item that is already in the cart (it does not bump the quantity)', async () => {
    const { result } = await setup();

    act(() => result.current.addToCart(jollof));
    act(() => result.current.addToCart(jollof));

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it('tolerates a sparse item', async () => {
    const { result } = await setup();

    act(() => result.current.addToCart({ _id: 'x', image: 'i.png' }));

    expect(result.current.cartItems[0]).toMatchObject({ id: 'x', quantity: 1, name: undefined });
  });
});

describe('quantities and totals', () => {
  it('updateQuantity applies the delta', async () => {
    const { result } = await setup({ items: [cartLine('a', { quantity: 2 })] });

    act(() => result.current.updateQuantity('a', 3));
    expect(result.current.cartItems[0].quantity).toBe(5);

    act(() => result.current.updateQuantity('a', -1));
    expect(result.current.cartItems[0].quantity).toBe(4);
  });

  it('never lets the quantity drop below 1', async () => {
    const { result } = await setup({ items: [cartLine('a', { quantity: 2 })] });

    act(() => result.current.updateQuantity('a', -10));

    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it('only changes the targeted line', async () => {
    const { result } = await setup({ items: [cartLine('a'), cartLine('b')] });

    act(() => result.current.updateQuantity('b', 2));

    expect(result.current.cartItems.map((i) => i.quantity)).toEqual([1, 3]);
  });

  it('totalPrice sums price x quantity', async () => {
    const { result } = await setup({
      items: [cartLine('a', { price: 8.5, quantity: 2 }), cartLine('b', { price: 3, quantity: 1 })],
    });

    expect(result.current.totalPrice).toBeCloseTo(20);
  });

  it('cartCount is the number of distinct lines, not total quantity', async () => {
    const { result } = await setup({
      items: [cartLine('a', { quantity: 5 }), cartLine('b', { quantity: 2 })],
    });

    expect(result.current.cartCount).toBe(2);
  });
});

describe('removing and clearing', () => {
  it('removeItem drops one line', async () => {
    const { result } = await setup({ items: [cartLine('a'), cartLine('b')] });

    act(() => result.current.removeItem('a'));

    expect(result.current.cartItems.map((i) => i.id)).toEqual(['b']);
  });

  it('clearCart empties the cart but keeps the delivery address', async () => {
    const address = { address: '1 High St', lat: 1, lng: 2 };
    const { result } = await setup({ items: [cartLine('a')], address });

    act(() => result.current.clearCart());

    expect(result.current.cartItems).toEqual([]);
    expect(result.current.deliveryAddress).toEqual(address);
  });

  it('setCartItems replaces the whole cart', async () => {
    const { result } = await setup({ items: [cartLine('a')] });

    act(() => result.current.setCartItems([cartLine('z')]));
    expect(result.current.cartItems.map((i) => i.id)).toEqual(['z']);

    act(() => result.current.setCartItems(null));
    expect(result.current.cartItems).toEqual([]);
  });
});

describe('delivery address', () => {
  const address = { address: '1 High St', lat: 54.9, lng: -1.39, postcode: 'SR1 1AA' };

  it('setAddress stores it and removeAddress clears it', async () => {
    const { result } = await setup();

    act(() => result.current.setAddress(address));
    expect(result.current.deliveryAddress).toEqual(address);

    act(() => result.current.removeAddress());
    expect(result.current.deliveryAddress).toBeNull();
  });

  it('is persisted, and removal is persisted too', async () => {
    const { result } = await setup();

    act(() => result.current.setAddress(address));
    await waitFor(async () => expect(JSON.parse(await AsyncStorage.getItem('address'))).toEqual(address));

    act(() => result.current.removeAddress());
    await waitFor(async () => expect(await AsyncStorage.getItem('address')).toBeNull());
  });

  it('is restored on startup', async () => {
    const { result } = await setup({ address });
    expect(result.current.deliveryAddress).toEqual(address);
  });
});

describe('persistence', () => {
  it('saves changes under the guest key when signed out', async () => {
    const { result } = await setup();

    act(() => result.current.addToCart(jollof));

    await waitFor(async () => expect(await storedCart()).toHaveLength(1));
    expect((await storedCart())[0].id).toBe('item1');
  });

  it('keys the cart by user id when signed in', async () => {
    const { result } = await setup({ user: { id: 'u42' } });

    act(() => result.current.addToCart(plantain));

    await waitFor(async () => expect(await storedCart('cartItems_u42')).toHaveLength(1));
    expect(await AsyncStorage.getItem('cartItems_guest')).toBeNull();
  });

  it('restores a saved cart on startup', async () => {
    const { result } = await setup({ items: [cartLine('a'), cartLine('b', { quantity: 3 })] });

    expect(result.current.cartItems.map((i) => [i.id, i.quantity])).toEqual([
      ['a', 1],
      ['b', 3],
    ]);
  });

  it('restores a signed-in user\'s own cart', async () => {
    const { result } = await setup({ user: { id: 'u42' }, items: [cartLine('mine')] });
    expect(result.current.cartItems.map((i) => i.id)).toEqual(['mine']);
  });

  it('does not overwrite saved data with an empty cart before loading finishes', async () => {
    // AsyncStorage.setItem is already a jest.fn: inspect its calls, never mockRestore() it
    // (that would wipe its implementation for every later test in this file).
    await AsyncStorage.setItem('cartItems_guest', JSON.stringify([cartLine('a')]));
    AsyncStorage.setItem.mockClear();

    await setup({ items: [cartLine('a')] });

    const writesOfEmptyCart = AsyncStorage.setItem.mock.calls.filter(
      ([key, value]) => key === 'cartItems_guest' && value === '[]',
    );
    expect(writesOfEmptyCart).toHaveLength(0);
  });

  it('survives corrupt saved data and starts with an empty cart', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await AsyncStorage.setItem('cartItems_guest', '{not json');

    const { result } = await setup();

    expect(result.current.cartItems).toEqual([]);
    expect(spy).toHaveBeenCalledWith('Failed to load cart:', expect.any(Error));
    // still usable afterwards
    act(() => result.current.addToCart(jollof));
    expect(result.current.cartItems).toHaveLength(1);
    spy.mockRestore();
  });
});

describe('reducer edge cases', () => {
  it('LOAD_CART replaces the lines, treating a missing payload as empty', async () => {
    const { result } = await setup();

    act(() => result.current.dispatch({ type: 'LOAD_CART', payload: [cartLine('x')] }));
    expect(result.current.cartItems.map((i) => i.id)).toEqual(['x']);

    act(() => result.current.dispatch({ type: 'LOAD_CART' }));
    expect(result.current.cartItems).toEqual([]);
  });

  it('ignores an unknown action', async () => {
    const { result } = await setup({ items: [cartLine('a')] });

    act(() => result.current.dispatch({ type: 'NOPE' }));

    expect(result.current.cartItems.map((i) => i.id)).toEqual(['a']);
  });
});

describe('persistence failures', () => {
  it('logs (and survives) a failure to save the cart', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = await setup();
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('disk full'));

    act(() => result.current.addToCart(jollof));

    await waitFor(() => expect(spy).toHaveBeenCalledWith('Failed to save cart:', expect.any(Error)));
    expect(result.current.cartItems).toHaveLength(1);
    spy.mockRestore();
  });

  it('logs (and survives) a failure to save the address', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = await setup();
    // 1st write of the pair is the (unchanged) cart, which is skipped; fail whichever write happens
    AsyncStorage.setItem.mockRejectedValue(new Error('disk full'));

    act(() => result.current.setAddress({ address: '1 High St' }));

    await waitFor(() => expect(spy).toHaveBeenCalledWith('Failed to save address:', expect.any(Error)));
    expect(result.current.deliveryAddress).toEqual({ address: '1 High St' });
    AsyncStorage.setItem.mockReset();
    spy.mockRestore();
  });
});
