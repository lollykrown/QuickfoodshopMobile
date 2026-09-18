import { Dimensions, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PaperProvider } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import Onboarding from '@/components/Onboarding';
import GetStartedScreen from '@/components/OnbdLastScreen';
import OnbdOptions from '@/components/OnbdOptions';

// OnbdOptions shows a Snackbar (via useToast), which needs Paper's provider.
const withPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);

describe('OnbdOptions', () => {
  it('offers browsing plus all three roles when signing up', () => {
    withPaper(<OnbdOptions />);

    expect(screen.getByText('How do you want to sign up?')).toBeTruthy();
    ['browse store', 'customer', 'vendor', 'rider'].forEach((o) =>
      expect(screen.getByText(o)).toBeTruthy(),
    );
  });

  it('reads "sign up" (not the raw route name) when told the auth route is signup', () => {
    withPaper(<OnbdOptions auth="signup" />);
    expect(screen.getByText('How do you want to sign up?')).toBeTruthy();
  });

  it('offers only the roles (no browsing) when logging in', () => {
    withPaper(<OnbdOptions auth="login" />);

    expect(screen.getByText('How do you want to login?')).toBeTruthy();
    expect(screen.queryByText('browse store')).toBeNull();
    ['customer', 'vendor', 'rider'].forEach((o) => expect(screen.getByText(o)).toBeTruthy());
  });

  it('goes to the role signup screen when a role is chosen', () => {
    withPaper(<OnbdOptions />);

    fireEvent.press(screen.getByText('vendor'));

    expect(__router.push).toHaveBeenCalledWith('vendor/signup');
  });

  it('goes to the role login screen in login mode', () => {
    withPaper(<OnbdOptions auth="login" />);

    fireEvent.press(screen.getByText('rider'));

    expect(__router.push).toHaveBeenCalledWith('rider/login');
  });

  it('browsing goes straight to the home tab', () => {
    withPaper(<OnbdOptions />);

    fireEvent.press(screen.getByText('browse store'));

    expect(__router.replace).toHaveBeenCalledWith('/home');
    expect(__router.push).not.toHaveBeenCalled();
  });

  it('asks for a choice when Continue is pressed with nothing selected', async () => {
    withPaper(<OnbdOptions />);

    fireEvent.press(screen.getByText('Continue'));

    expect(await screen.findByText('Please select an option above to continue')).toBeTruthy();
    expect(__router.push).not.toHaveBeenCalled();
    expect(__router.replace).not.toHaveBeenCalled();
  });

  it('buzzes the device on Continue', () => {
    withPaper(<OnbdOptions />);
    fireEvent.press(screen.getByText('Continue'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('Continue navigates to the selected role', () => {
    withPaper(<OnbdOptions />);
    fireEvent.press(screen.getByText('customer'));
    __router.push.mockClear();

    fireEvent.press(screen.getByText('Continue'));

    expect(__router.push).toHaveBeenCalledWith('customer/signup');
  });

  it('Continue after choosing "browse store" goes to /home', () => {
    withPaper(<OnbdOptions />);
    fireEvent.press(screen.getByText('browse store'));
    __router.replace.mockClear();

    fireEvent.press(screen.getByText('Continue'));

    expect(__router.replace).toHaveBeenCalledWith('/home');
  });
});

describe('GetStartedScreen (last onboarding screen)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('invites the user to get started', () => {
    withPaper(<GetStartedScreen />);

    expect(screen.getByText('Ready to start shopping?')).toBeTruthy();
    expect(screen.getByText('Sign in or continue to explore the app.')).toBeTruthy();
  });

  it('reveals the sign-up options shortly after Get Started is pressed', () => {
    withPaper(<GetStartedScreen />);

    fireEvent.press(screen.getByText('Get Started'));
    expect(screen.queryByText('How do you want to sign up?')).toBeNull();

    act(() => jest.advanceTimersByTime(250));

    expect(screen.getByText('How do you want to sign up?')).toBeTruthy();
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });
});

describe('Onboarding', () => {
  const { width } = Dimensions.get('window');

  it('shows the intro slides', () => {
    withPaper(<Onboarding />);

    // The highlighted word is split into its own <Text>, so match the joined title.
    expect(screen.getAllByText('Enjoy Food at Your Convenience anytime').length).toBeGreaterThan(0);
    expect(screen.getByText('Local Delivery')).toBeTruthy();
    expect(screen.getAllByText('Quick Delivery at Your Doorstep').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Next')).toHaveLength(3);
    expect(screen.getAllByText('Skip')).toHaveLength(3);
  });

  it('Skip jumps straight to the get-started screen', () => {
    withPaper(<Onboarding />);

    fireEvent.press(screen.getAllByText('Skip')[0]);

    expect(screen.getByText('Ready to start shopping?')).toBeTruthy();
    expect(screen.queryByText('Local Delivery')).toBeNull();
  });

  it('Next on the last slide moves on to the get-started screen', () => {
    withPaper(<Onboarding />);

    // Scrolling to the last page updates the current index...
    fireEvent(screen.UNSAFE_getByProps({ pagingEnabled: true }), 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: width * 2 } },
    });
    fireEvent.press(screen.getAllByText('Next')[2]);

    expect(screen.getByText('Ready to start shopping?')).toBeTruthy();
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('Next before the last slide scrolls to the following slide and stays in the carousel', () => {
    const scrollToIndex = jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});
    withPaper(<Onboarding />);

    fireEvent.press(screen.getAllByText('Next')[0]);

    expect(scrollToIndex).toHaveBeenCalledWith({ index: 1 });
    expect(screen.queryByText('Ready to start shopping?')).toBeNull();
    scrollToIndex.mockRestore();
  });
});
