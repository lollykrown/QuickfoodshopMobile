import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Home from '@/app/(tabs)/home';
import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/contexts/cartContext';
import { fetchPopularDishes, fetchPopularStores } from '@/services/api';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/contexts/cartContext', () => ({ useCart: jest.fn() }));
jest.mock('@/services/api', () => ({
  fetchPopularDishes: jest.fn(),
  fetchPopularStores: jest.fn(),
}));

const user = { firstName: 'ada', lastName: 'lovelace', image: 'https://example.com/a.png' };
const dish = (id, name, category = 'Food') => ({
  _id: id,
  itemName: name,
  price: 9,
  categoryId: { name: category },
  vendorId: { businessName: 'Mama Kitchen' },
});

const renderHome = async () => {
  const utils = render(
    <PaperProvider>
      <Home />
    </PaperProvider>,
  );
  await act(async () => {}); // let the initial fetches settle
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: null, isLoggedIn: false });
  useCart.mockReturnValue({ cartCount: 0 });
  fetchPopularDishes.mockResolvedValue([dish('d1', 'Jollof Rice'), dish('d2', 'Egusi Soup')]);
  fetchPopularStores.mockResolvedValue([]);
});

describe('Home (signed out)', () => {
  it('offers a Login button that reveals the login role options', async () => {
    await renderHome();

    fireEvent.press(screen.getByText('Login'));

    expect(await screen.findByText('How do you want to login?')).toBeTruthy();
    expect(screen.queryByText('Featured')).toBeNull();
  });

  it('does not show the account greeting', async () => {
    await renderHome();
    expect(screen.queryByText(/Good (morning|afternoon|evening)/)).toBeNull();
  });
});

describe('Home (signed in)', () => {
  beforeEach(() => useAuth.mockReturnValue({ user, isLoggedIn: true }));

  it('greets the user by name', async () => {
    await renderHome();

    expect(screen.getByText('ada lovelace')).toBeTruthy();
    expect(screen.getByText(/Good (morning|afternoon|evening) /)).toBeTruthy();
  });

  it.each([
    [9, 'morning'],
    [11, 'morning'],
    [12, 'afternoon'],
    [16, 'afternoon'],
    [17, 'evening'],
    [23, 'evening'],
  ])('at %i:00 the greeting says "%s"', async (hour, word) => {
    jest.useFakeTimers({ now: new Date(2026, 0, 15, hour, 30), doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    await renderHome();
    expect(screen.getByText(`Good ${word} 👋`)).toBeTruthy();
    jest.useRealTimers();
  });

  it('opens the account page from the greeting', async () => {
    await renderHome();

    fireEvent.press(screen.getByText('ada lovelace'));

    expect(__router.push).toHaveBeenCalledWith('/dashboard/account');
  });
});

describe('Home (content)', () => {
  it('closes the drawer and requests the popular dishes on mount', async () => {
    await renderHome();

    expect(mockDrawer.close).toHaveBeenCalled();
    expect(fetchPopularDishes).toHaveBeenCalledTimes(1);
    expect(fetchPopularStores).toHaveBeenCalledTimes(1);
  });

  it('toggles the drawer from the menu icon', async () => {
    await renderHome();
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });

  it('shows the featured, categories and popular sections', async () => {
    await renderHome();

    ['Featured', 'Categories', 'Popular Dishes', 'Popular Stores'].forEach((title) =>
      expect(screen.getByText(title)).toBeTruthy(),
    );
  });

  it('lists the popular dishes that were fetched', async () => {
    await renderHome();

    expect(await screen.findByText('Jollof Rice')).toBeTruthy();
    expect(screen.getByText('Egusi Soup')).toBeTruthy();
  });

  it('links a dish to its category route', async () => {
    await renderHome();

    fireEvent.press(await screen.findByText('Jollof Rice'));

    expect(__router.push).toHaveBeenCalledWith('/stores/food/d1');
  });

  it('shows the error when popular dishes fail to load', async () => {
    fetchPopularDishes.mockRejectedValue(new Error('Failed to fetch popular dishes'));
    await renderHome();

    expect(await screen.findByText('Error: Failed to fetch popular dishes')).toBeTruthy();
  });

  it('shows a featured store list', async () => {
    await renderHome();
    expect(screen.getByText("Lara's Kitchen ltd")).toBeTruthy();
  });

  describe('categories', () => {
    it.each([
      ['all', '/stores'],
      ['restaurants', 'stores/restaurants'],
      ['grocery stores', 'stores/grocery-stores'],
      ['groceries', 'stores/groceries'],
      ['food', 'stores/food'],
      ['extras', 'stores/extras'],
    ])('"%s" navigates to %s', async (label, destination) => {
      await renderHome();

      fireEvent.press(screen.getByText(label));

      expect(__router.push).toHaveBeenCalledWith(destination);
    });
  });

  it('links "See All" to the store listings', async () => {
    await renderHome();

    const seeAll = screen.getAllByText('See All');
    // Featured (plain text), Popular Dishes, Popular Stores
    fireEvent.press(seeAll[1]);
    expect(__router.push).toHaveBeenLastCalledWith('/stores/food');
    fireEvent.press(seeAll[2]);
    expect(__router.push).toHaveBeenLastCalledWith('/stores');
  });

  it('links the bell to notifications', async () => {
    await renderHome();

    fireEvent.press(screen.getByTestId('icon-notifications'));

    expect(__router.push).toHaveBeenCalledWith('/dashboard/notifications?prev=home');
  });
});
