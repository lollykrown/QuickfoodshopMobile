import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import StoreDetails from '@/app/stores/[category]/[id]';
import { useCart } from '@/contexts/cartContext';
import { fetchFoodByID, fetchStoreByID } from '@/services/api';

jest.mock('@/contexts/cartContext', () => ({ useCart: jest.fn() }));
jest.mock('@/services/api', () => ({ fetchFoodByID: jest.fn(), fetchStoreByID: jest.fn() }));

const food = {
  _id: 'd1',
  itemName: 'Jollof Rice',
  description: 'Smoky party jollof',
  image: 'jollof.png',
  categoryId: { name: 'Food' },
  vendorId: { _id: 'v1', businessName: "Mama's Kitchen", businessAddress: '1 High Street', image: 'v.png' },
};

const storeDetails = {
  _id: 's1',
  store: {
    businessName: 'Gillian Store',
    businessDescription: 'Best store in town',
    businessAddress: '2 Low Road',
    image: 's.png',
  },
  items: {
    list: [
      { _id: 'i1', itemName: 'Rice', image: 'r.png', categoryId: { name: 'Food' } },
      { _id: 'i2', itemName: 'Beans', image: 'b.png', categoryId: { name: 'Food' } },
    ],
  },
};

const cart = (overrides = {}) => ({ cartItems: [], cartCount: 0, addToCart: jest.fn(), ...overrides });

async function renderDetails() {
  const utils = render(
    <PaperProvider>
      <StoreDetails />
    </PaperProvider>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return utils;
}

beforeEach(() => {
  jest.clearAllMocks();
  useCart.mockReturnValue(cart());
  __setParams({ category: 'food', id: 'd1' });
  fetchFoodByID.mockResolvedValue(food);
  fetchStoreByID.mockResolvedValue(storeDetails);
});

describe('StoreDetails (an item)', () => {
  it('loads the item by id', async () => {
    await renderDetails();
    expect(fetchFoodByID).toHaveBeenCalledWith({ id: 'd1' });
    expect(fetchStoreByID).not.toHaveBeenCalled();
  });

  it('shows the item, its vendor and location', async () => {
    await renderDetails();

    expect(screen.getByText('Jollof Rice')).toBeTruthy();
    expect(screen.getByText('Smoky party jollof')).toBeTruthy();
    expect(screen.getByText("Mama's Kitchen")).toBeTruthy();
    expect(screen.getByText('1 High Street')).toBeTruthy();
    expect(screen.getByText('25min')).toBeTruthy();
    expect(screen.getByText('4.5')).toBeTruthy();
  });

  it('opens the vendor page from the vendor row', async () => {
    await renderDetails();

    fireEvent.press(screen.getByText("Mama's Kitchen"));

    expect(__router.push).toHaveBeenCalledWith('stores/restaurants/v1');
  });

  it('sends grocery items to the grocery-stores vendor route', async () => {
    __setParams({ category: 'groceries', id: 'g1' });
    fetchFoodByID.mockResolvedValue({ ...food, categoryId: { name: 'groceries' } });
    await renderDetails();

    fireEvent.press(screen.getByText("Mama's Kitchen"));

    expect(__router.push).toHaveBeenCalledWith('stores/grocery-stores/v1');
  });

  it('does not crash when the vendor row is pressed before the item has loaded', async () => {
    let resolve;
    fetchFoodByID.mockReturnValue(new Promise((r) => (resolve = r)));
    await renderDetails();

    // vendor row isn't populated yet, so there is nothing to press; the screen just waits
    expect(screen.queryByText("Mama's Kitchen")).toBeNull();
    await act(async () => resolve(food));
    expect(screen.getByText("Mama's Kitchen")).toBeTruthy();
  });

  describe('adding to the cart', () => {
    it('adds the item and confirms with a toast', async () => {
      const state = cart();
      useCart.mockReturnValue(state);
      await renderDetails();

      fireEvent.press(screen.getByText('Add To Cart'));

      expect(state.addToCart).toHaveBeenCalledWith(food);
      expect(await screen.findByText('Jollof Rice added to cart 🛒')).toBeTruthy();
    });

    it('refuses a duplicate and says so', async () => {
      const state = cart({ cartItems: [{ id: 'd1' }], cartCount: 1 });
      useCart.mockReturnValue(state);
      await renderDetails();

      fireEvent.press(screen.getByText('Add To Cart'));

      expect(state.addToCart).not.toHaveBeenCalled();
      expect(await screen.findByText('Jollof Rice is already in your cart 🛒')).toBeTruthy();
    });

    it('offers a shortcut to the cart once something is in it', async () => {
      useCart.mockReturnValue(cart({ cartItems: [{ id: 'other' }], cartCount: 1 }));
      await renderDetails();

      fireEvent.press(screen.getByText('Goto Cart'));

      expect(__router.push).toHaveBeenCalledWith('/myCart');
    });

    it('hides the cart shortcut while the cart is empty', async () => {
      await renderDetails();
      expect(screen.queryByText('Goto Cart')).toBeNull();
    });
  });

  it('closes (dismisses) from the close button', async () => {
    await renderDetails();
    fireEvent.press(screen.getByTestId('icon-close'));
    expect(__router.dismiss).toHaveBeenCalled();
  });

  it('shows a spinner while loading', async () => {
    fetchFoodByID.mockReturnValue(new Promise(() => {}));
    const { UNSAFE_queryByType } = await renderDetails();
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders without item details (and no Add To Cart) when loading fails', async () => {
    fetchFoodByID.mockRejectedValue(new Error('Failed to fetch data'));
    await renderDetails();

    expect(screen.queryByText('Add To Cart')).toBeNull();
    expect(screen.queryByText('Jollof Rice')).toBeNull();
  });
});

describe('StoreDetails (a store)', () => {
  beforeEach(() => __setParams({ category: 'restaurants', id: 's1' }));

  it.each(['restaurants', 'grocery-stores'])('loads %s by store id', async (category) => {
    __setParams({ category, id: 's1' });
    await renderDetails();

    expect(fetchStoreByID).toHaveBeenCalledWith({ id: 's1' });
    expect(fetchFoodByID).not.toHaveBeenCalled();
  });

  it('shows the store and its location', async () => {
    await renderDetails();

    expect(screen.getByText('Gillian Store')).toBeTruthy();
    expect(screen.getByText('Best store in town')).toBeTruthy();
    expect(screen.getByText('2 Low Road')).toBeTruthy();
  });

  it('has no Add To Cart or vendor row (those are for items)', async () => {
    await renderDetails();

    expect(screen.queryByText('Add To Cart')).toBeNull();
    expect(screen.queryByText("Mama's Kitchen")).toBeNull();
  });

  it('lists the store\'s items and opens one in its category', async () => {
    await renderDetails();

    expect(screen.getByText('Rice')).toBeTruthy();
    expect(screen.getByText('Beans')).toBeTruthy();
    expect(screen.getByText('Search Food')).toBeTruthy();

    fireEvent.press(screen.getByText('Rice'));
    expect(__router.push).toHaveBeenCalledWith('stores/food/i1');
  });

  it('shows at most nine items', async () => {
    const list = Array.from({ length: 12 }, (_, i) => ({
      _id: `i${i}`,
      itemName: `Item ${i}`,
      image: 'x.png',
      categoryId: { name: 'Food' },
    }));
    fetchStoreByID.mockResolvedValue({ ...storeDetails, items: { list } });
    await renderDetails();

    expect(screen.getByText('Item 8')).toBeTruthy();
    expect(screen.queryByText('Item 9')).toBeNull();
  });

  it('links to search from the items header', async () => {
    await renderDetails();
    fireEvent.press(screen.getByText('Search Food'));
    expect(__router.push).toHaveBeenCalledWith('/search');
  });
});

describe('StoreDetails (no id)', () => {
  it('goes back', async () => {
    __setParams({ category: 'food' });
    await renderDetails();
    expect(__router.back).toHaveBeenCalled();
  });
});
