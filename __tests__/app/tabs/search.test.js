import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Search from '@/app/(tabs)/search';
import { fetchAllData } from '@/services/api';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/services/api', () => ({ fetchAllData: jest.fn() }));

const dish = (id, name) => ({
  _id: id,
  itemName: name,
  price: 9,
  categoryId: { name: 'Food' },
  vendorId: { businessName: 'Mama Kitchen' },
});

const renderSearch = () =>
  render(
    <PaperProvider>
      <Search />
    </PaperProvider>,
  );

const type = (text) => fireEvent.changeText(screen.getByPlaceholderText('Search Food and Restaurants'), text);
// The screen debounces by 500ms, then awaits the request.
const settle = () =>
  act(async () => {
    jest.advanceTimersByTime(500);
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  fetchAllData.mockResolvedValue([]);
});

afterEach(() => jest.useRealTimers());

describe('Search', () => {
  it('prompts the user to start typing and suggests popular searches', () => {
    renderSearch();

    expect(screen.getByText('Search')).toBeTruthy();
    expect(
      screen.getByText('Start typing in the search box above to search for groceries or food items'),
    ).toBeTruthy();
    expect(screen.getByText('amala')).toBeTruthy();
    expect(screen.getByText('jollof rice')).toBeTruthy();
    expect(fetchAllData).not.toHaveBeenCalled();
  });

  it('waits for a pause in typing before searching', async () => {
    renderSearch();

    type('ri');
    act(() => jest.advanceTimersByTime(300));
    type('rice');

    // The first keystroke's timer was cancelled; the clock restarts from the last one.
    await act(async () => jest.advanceTimersByTime(499));
    expect(fetchAllData).not.toHaveBeenCalled();

    await act(async () => jest.advanceTimersByTime(1));
    expect(fetchAllData).toHaveBeenCalledTimes(1);
    expect(fetchAllData).toHaveBeenCalledWith({ query: 'rice' });
  });

  it('shows the results and their heading', async () => {
    fetchAllData.mockResolvedValue([dish('d1', 'Jollof Rice'), dish('d2', 'Fried Rice')]);
    renderSearch();

    type('rice');
    await settle();

    expect(await screen.findByText('Jollof Rice')).toBeTruthy();
    expect(screen.getByText('Fried Rice')).toBeTruthy();
    expect(screen.getByText(/Showing search Results for/)).toBeTruthy();
  });

  it('opens a result in its category', async () => {
    fetchAllData.mockResolvedValue([dish('d1', 'Jollof Rice')]);
    renderSearch();
    type('rice');
    await settle();

    fireEvent.press(await screen.findByText('Jollof Rice'));

    expect(__router.push).toHaveBeenCalledWith('/stores/food/d1');
  });

  it('says so when nothing matches', async () => {
    renderSearch();

    type('zzz');
    await settle();

    expect(
      await screen.findByText('No groceries, food or restaurants found with by the word zzz'),
    ).toBeTruthy();
  });

  it('shows the error when the search fails', async () => {
    fetchAllData.mockRejectedValue(new Error('Failed to fetch data: Server Error'));
    renderSearch();

    type('rice');
    await settle();

    expect(await screen.findByText('Error: Failed to fetch data: Server Error')).toBeTruthy();
  });

  it('clears the results when the box is emptied, without a request', async () => {
    fetchAllData.mockResolvedValue([dish('d1', 'Jollof Rice')]);
    renderSearch();
    type('rice');
    await settle();
    await screen.findByText('Jollof Rice');
    fetchAllData.mockClear();

    type('');
    await settle();

    expect(screen.queryByText('Jollof Rice')).toBeNull();
    expect(fetchAllData).not.toHaveBeenCalled();
  });

  it('does not search for whitespace', async () => {
    renderSearch();
    type('   ');
    await settle();
    expect(fetchAllData).not.toHaveBeenCalled();
  });

  it('a popular-search chip fills the box and searches', async () => {
    renderSearch();

    fireEvent.press(screen.getByText('amala'));
    await settle();

    expect(screen.getByPlaceholderText('Search Food and Restaurants').props.value).toBe('amala');
    expect(fetchAllData).toHaveBeenCalledWith({ query: 'amala' });
  });

  it('goes back and toggles the drawer from the app bar', () => {
    renderSearch();

    fireEvent.press(screen.getByLabelText('Back'));
    expect(__router.back).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });
});
