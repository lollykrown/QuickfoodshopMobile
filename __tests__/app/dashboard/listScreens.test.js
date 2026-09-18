import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import { Colors } from '@/constants/colors';
import ActiveRiders from '@/app/dashboard/activeRiders';
import Invoices from '@/app/dashboard/invoice';
import Transactions from '@/app/dashboard/transactions';
import { useAuth } from '@/contexts/authContext';

const mockDrawer = { open: jest.fn(), close: jest.fn(), toggle: jest.fn() };
jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }));
jest.mock('@/contexts/authContext', () => ({ useAuth: jest.fn() }));

const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);
const colorOf = (element) => StyleSheet.flatten(element.props.style)?.color;

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { image: 'u.png' }, avatar: 'a.png' });
});

const itHasStandardAppBar = (render_) =>
  it('goes back and toggles the drawer from the app bar', () => {
    render_();
    fireEvent.press(screen.getByLabelText('Back'));
    fireEvent.press(screen.getByTestId('icon-menu'));
    expect(__router.back).toHaveBeenCalled();
    expect(mockDrawer.toggle).toHaveBeenCalled();
  });

describe('ActiveRiders', () => {
  it('shows each active delivery with its rider and customer', () => {
    renderWithPaper(<ActiveRiders />);

    expect(screen.getByText('Active Riders')).toBeTruthy();
    expect(screen.getAllByText('Jonathan Mike')).toHaveLength(5);
    expect(screen.getAllByText('Dispatch rider')).toHaveLength(5);
    expect(screen.getAllByText('Tobi Makinde')).toHaveLength(5);
    expect(screen.getAllByText('Customer')).toHaveLength(5);
    expect(screen.getAllByText('9 mins ago')).toHaveLength(5);
  });

  itHasStandardAppBar(() => renderWithPaper(<ActiveRiders />));
});

describe('Invoices', () => {
  it('groups invoices by date', () => {
    renderWithPaper(<Invoices />);

    expect(screen.getByText('My Invoices')).toBeTruthy();
    expect(screen.getByText('Mar 4, 2025')).toBeTruthy();
    expect(screen.getByText('Mar 7, 2025')).toBeTruthy();
  });

  it('lists the orders in each group with a download action', () => {
    renderWithPaper(<Invoices />);

    ['Order #3398', 'Order #3399', 'Order #3388', 'Order #7678'].forEach((order) =>
      expect(screen.getByText(order)).toBeTruthy(),
    );
    expect(screen.getAllByTestId('icon-download').length).toBeGreaterThan(0);
  });

  it('does not show the empty state while there are invoices', () => {
    renderWithPaper(<Invoices />);
    expect(screen.queryByText('Transactions Empty')).toBeNull();
  });

  itHasStandardAppBar(() => renderWithPaper(<Invoices />));
});

describe('Transactions', () => {
  it('groups transactions by date with vendor and amount', () => {
    renderWithPaper(<Transactions />);

    expect(screen.getByText('Transactions')).toBeTruthy();
    expect(screen.getByText('Mar 4, 2025')).toBeTruthy();
    expect(screen.getAllByText('Open Sea Restaurant').length).toBeGreaterThan(0);
    expect(screen.getByText("Lara's Kitchen Store")).toBeTruthy();
    expect(screen.getAllByText('£250').length).toBeGreaterThan(0);
  });

  it('colours the status: red when failed, orange when pending, green otherwise', () => {
    renderWithPaper(<Transactions />);

    expect(colorOf(screen.getByText('Failed'))).toBe('red');
    expect(colorOf(screen.getByText('Pending'))).toBe('orange');
    expect(colorOf(screen.getAllByText('Completed')[0])).toBe(Colors.green);
  });

  it('does not show the empty state while there are transactions', () => {
    renderWithPaper(<Transactions />);
    expect(screen.queryByText('Transactions Empty')).toBeNull();
  });

  itHasStandardAppBar(() => renderWithPaper(<Transactions />));
});
