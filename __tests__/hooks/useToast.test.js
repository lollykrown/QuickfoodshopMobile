import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useToast } from '@/hooks/useToast';

// Harness: exposes show() through buttons and renders the <Toast />.
function Harness() {
  const { show, Toast } = useToast();
  return (
    <View>
      <Text onPress={() => show('Saved!')}>show-default</Text>
      <Text onPress={() => show('Failed!', 'error')}>show-error</Text>
      <Text onPress={() => show('Custom', 'anything-else')}>show-other</Text>
      <Toast />
    </View>
  );
}

const renderHarness = () =>
  render(
    <PaperProvider>
      <Harness />
    </PaperProvider>,
  );

const toastBackground = () => {
  const snackbar = screen.getByText(/Saved!|Failed!|Custom/).parent;
  // Walk up to the element carrying the background color set via `style`.
  let node = snackbar;
  while (node) {
    const style = StyleSheet.flatten(node.props?.style);
    if (style?.backgroundColor === 'green' || style?.backgroundColor === 'red') {
      return style.backgroundColor;
    }
    node = node.parent;
  }
  return undefined;
};

describe('useToast', () => {
  it('shows nothing until show() is called', () => {
    renderHarness();
    expect(screen.queryByText('Saved!')).toBeNull();
  });

  it('shows the message in a green toast by default', async () => {
    renderHarness();

    fireEvent.press(screen.getByText('show-default'));

    expect(await screen.findByText('Saved!')).toBeTruthy();
    expect(toastBackground()).toBe('green');
  });

  it('uses a red toast for errors', async () => {
    renderHarness();

    fireEvent.press(screen.getByText('show-error'));

    expect(await screen.findByText('Failed!')).toBeTruthy();
    expect(toastBackground()).toBe('red');
  });

  it('treats any other mode as a success toast', async () => {
    renderHarness();

    fireEvent.press(screen.getByText('show-other'));

    expect(await screen.findByText('Custom')).toBeTruthy();
    expect(toastBackground()).toBe('green');
  });

  it('offers a Close action', async () => {
    renderHarness();
    fireEvent.press(screen.getByText('show-default'));
    expect(await screen.findByText('Close')).toBeTruthy();
  });

  it('replaces the message when shown again', async () => {
    renderHarness();

    fireEvent.press(screen.getByText('show-default'));
    await screen.findByText('Saved!');
    await act(async () => fireEvent.press(screen.getByText('show-error')));

    expect(await screen.findByText('Failed!')).toBeTruthy();
    expect(screen.queryByText('Saved!')).toBeNull();
  });
});

describe('useToast (dismissal)', () => {
  const { Snackbar } = require('react-native-paper');

  it('hides when the snackbar is dismissed', async () => {
    renderHarness();
    fireEvent.press(screen.getByText('show-default'));
    await screen.findByText('Saved!');

    act(() => screen.UNSAFE_getByType(Snackbar).props.onDismiss());

    expect(screen.queryByText('Saved!')).toBeNull();
  });

  it('the Close action is wired up and does not throw', async () => {
    renderHarness();
    fireEvent.press(screen.getByText('show-default'));
    await screen.findByText('Saved!');

    expect(() => screen.UNSAFE_getByType(Snackbar).props.action.onPress()).not.toThrow();
  });
});
