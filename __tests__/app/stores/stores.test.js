import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { __router, __setParams } from 'expo-router';
import Stores from '@/app/stores';
import Category from '@/app/stores/[category]';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/services/api', () => ({
  fetchAllStores: jest.fn(),
  fetchRestaurants: jest.fn(),
  fetchGroceriesStores: jest.fn(),
  fetchGroceries: jest.fn(),
  fetchFood: jest.fn(),
  fetchFoodExtras: jest.fn(),
}));

const api = jest.requireMock('@/services/api');

const store = (id, name) => ({ _id: id, businessName: name, businessAddress: `${name} Street`, image: 'x.png' });
const dish = (id, name) => ({
  _id: id,
  itemName: name,
  price: 9,
  categoryId: { name: 'Food' },
  vendorId: { businessName: 'Mama Kitchen' },
});

// Render inside PaperProvider, then let the initial request settle inside act().
async function renderScreen(ui) {
  const utils = render(<PaperProvider>{ui}</PaperProvider>);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return utils;
}

const searchBox = () => screen.getByPlaceholderText('Search Food and Restaurants');

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(api)
    .filter((fn) => typeof fn?.mockResolvedValue === 'function')
    .forEach((fn) => fn.mockResolvedValue([]));
});

describe('Stores (all stores)', () => {
  it('requests every store on load and lists them as store cards', async () => {
    api.fetchAllStores.mockResolvedValue([store('s1', 'Gillian'), store('s2', 'Lara')]);
    await renderScreen(<Stores />);

    expect(api.fetchAllStores).toHaveBeenCalledWith({ query: undefined, limit: 100 });
    expect(screen.getByText('All Stores')).toBeTruthy();
    expect(screen.getByText('Gillian')).toBeTruthy();
    expect(screen.getByText('Lara')).toBeTruthy();
  });

  it('opens a store under the restaurants route', async () => {
    api.fetchAllStores.mockResolvedValue([store('s1', 'Gillian')]);
    await renderScreen(<Stores />);

    fireEvent.press(screen.getByText('Gillian'));

    expect(__router.push).toHaveBeenCalledWith('/stores/restaurants/s1');
  });

  it('searches as the user types, trimming the text', async () => {
    api.fetchAllStores.mockResolvedValue([store('s1', 'Gillian')]);
    await renderScreen(<Stores />);
    api.fetchAllStores.mockClear();

    await act(async () => fireEvent.changeText(searchBox(), '  gill  '));

    expect(api.fetchAllStores).toHaveBeenCalledWith({ query: 'gill', limit: 100 });
    expect(screen.getByText(/Search Results for/)).toBeTruthy();
  });

  it('reloads the full list when the search box is cleared', async () => {
    await renderScreen(<Stores />);
    await act(async () => fireEvent.changeText(searchBox(), 'gill'));
    api.fetchAllStores.mockClear();

    await act(async () => fireEvent.changeText(searchBox(), ''));

    expect(api.fetchAllStores).toHaveBeenCalledWith({ query: undefined, limit: 100 });
  });

  it('shows the error when loading fails', async () => {
    api.fetchAllStores.mockRejectedValue(new Error('Failed to fetch data: Server Error'));
    await renderScreen(<Stores />);

    expect(screen.getByText('Error: Failed to fetch data: Server Error')).toBeTruthy();
  });

  it('goes back and toggles the drawer', async () => {
    await renderScreen(<Stores />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});

describe('Category', () => {
  describe.each([
    ['restaurants', 'fetchRestaurants'],
    ['grocery-stores', 'fetchGroceriesStores'],
    ['groceries', 'fetchGroceries'],
    ['food', 'fetchFood'],
    ['extras', 'fetchFoodExtras'],
    ['all', 'fetchAllStores'],
    ['something-else', 'fetchAllStores'],
  ])('/stores/%s', (category, fetcherName) => {
    it(`loads with ${fetcherName}`, async () => {
      __setParams({ category });
      await renderScreen(<Category />);

      expect(api[fetcherName]).toHaveBeenCalledTimes(1);
      expect(api[fetcherName]).toHaveBeenCalledWith({ query: '' });
    });
  });

  describe('titles', () => {
    it.each([
      ['restaurants', 'restaurants'],
      ['grocery-stores', 'grocery stores'],
      ['all', 'All Stores'],
    ])('%s is titled "%s"', async (category, title) => {
      __setParams({ category });
      await renderScreen(<Category />);
      expect(screen.getByText(title)).toBeTruthy();
    });
  });

  describe('store categories (restaurants, grocery-stores)', () => {
    it.each(['restaurants', 'grocery-stores'])('%s shows store cards linking to the category', async (category) => {
      __setParams({ category });
      const fetcher = category === 'restaurants' ? api.fetchRestaurants : api.fetchGroceriesStores;
      fetcher.mockResolvedValue([store('s1', 'Gillian')]);
      await renderScreen(<Category />);

      fireEvent.press(screen.getByText('Gillian'));

      expect(__router.push).toHaveBeenCalledWith(`/stores/${category}/s1`);
    });
  });

  describe('item categories (food, extras)', () => {
    it('shows item cards linking to the item', async () => {
      __setParams({ category: 'food' });
      api.fetchFood.mockResolvedValue([dish('d1', 'Jollof Rice'), dish('d2', 'Egusi')]);
      await renderScreen(<Category />);

      expect(screen.getByText('Jollof Rice')).toBeTruthy();
      expect(screen.getByText('Egusi')).toBeTruthy();
      fireEvent.press(screen.getByText('Jollof Rice'));
      expect(__router.push).toHaveBeenCalledWith('/stores/food/d1');
    });
  });

  describe('groceries', () => {
    it('shows sub-category chips instead of a search box', async () => {
      __setParams({ category: 'groceries' });
      await renderScreen(<Category />);

      expect(screen.queryByPlaceholderText('Search Food and Restaurants')).toBeNull();
      ['All', 'Condiments', 'Fruits and Vegetables', 'Spices'].forEach((chip) =>
        expect(screen.getByText(chip)).toBeTruthy(),
      );
    });
  });

  describe('search', () => {
    it('refetches with the typed text (the list is not left unfiltered)', async () => {
      __setParams({ category: 'restaurants' });
      await renderScreen(<Category />);
      api.fetchRestaurants.mockClear();

      await act(async () => fireEvent.changeText(searchBox(), 'pizza'));

      expect(api.fetchRestaurants).toHaveBeenCalledWith({ query: 'pizza' });
    });

    it('shows a results heading once there is a search and matches', async () => {
      __setParams({ category: 'restaurants' });
      api.fetchRestaurants.mockResolvedValue([store('s1', 'Pizza Palace')]);
      await renderScreen(<Category />);

      await act(async () => fireEvent.changeText(searchBox(), 'pizza'));

      expect(screen.getByText(/Search Results for/)).toBeTruthy();
    });
  });

  it('shows the error when loading fails', async () => {
    __setParams({ category: 'restaurants' });
    api.fetchRestaurants.mockRejectedValue(new Error('Failed to fetch data: Bad Gateway'));
    await renderScreen(<Category />);

    expect(screen.getByText('Error: Failed to fetch data: Bad Gateway')).toBeTruthy();
  });

  it('goes back and toggles the drawer', async () => {
    __setParams({ category: 'food' });
    await renderScreen(<Category />);
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});
