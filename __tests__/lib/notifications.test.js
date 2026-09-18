import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({ isDevice: true }));

describe('registerForPushNotificationsAsync', () => {
  const { registerForPushNotificationsAsync } = require('@/lib/pushNotifications');
  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    Device.isDevice = true;
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[abc]' });
  });

  afterEach(() => alertSpy.mockRestore());

  it('refuses to register on a simulator', async () => {
    Device.isDevice = false;

    await expect(registerForPushNotificationsAsync()).resolves.toBeUndefined();
    expect(alertSpy).toHaveBeenCalledWith('Must use a physical device for Push Notifications');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('returns the Expo push token when permission is already granted', async () => {
    await expect(registerForPushNotificationsAsync()).resolves.toBe('ExponentPushToken[abc]');
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('asks for permission when it has not been granted yet', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    await expect(registerForPushNotificationsAsync()).resolves.toBe('ExponentPushToken[abc]');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('alerts and returns nothing when permission is denied', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await expect(registerForPushNotificationsAsync()).resolves.toBeUndefined();
    expect(alertSpy).toHaveBeenCalledWith('Failed to get push token');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('creates the default notification channel on Android only', async () => {
    const restore = jest.replaceProperty(Platform, 'OS', 'android');
    await registerForPushNotificationsAsync();
    restore.restore();

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      'default',
      expect.objectContaining({ name: 'default', importance: 5 }),
    );

    Notifications.setNotificationChannelAsync.mockClear();
    const restoreIos = jest.replaceProperty(Platform, 'OS', 'ios');
    await registerForPushNotificationsAsync();
    restoreIos.restore();

    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });
});

describe('notificationHandlers', () => {
  it('shows a banner and list entry, and plays sound, for foreground notifications (no badge)', async () => {
    require('@/lib/notificationHandlers');

    const { handleNotification } = Notifications.setNotificationHandler.mock.calls[0][0];
    await expect(handleNotification()).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });

  it('registers a response listener and returns its subscription', () => {
    const { setNotificationListener } = require('@/lib/notificationHandlers');
    const subscription = { remove: jest.fn() };
    Notifications.addNotificationResponseReceivedListener.mockReturnValue(subscription);

    expect(setNotificationListener()).toBe(subscription);
  });

  it('handles a tapped notification without throwing', () => {
    const { setNotificationListener } = require('@/lib/notificationHandlers');
    setNotificationListener();

    const onResponse = Notifications.addNotificationResponseReceivedListener.mock.calls[0][0];
    expect(() =>
      onResponse({ notification: { request: { content: { data: { orderId: '1' } } } } }),
    ).not.toThrow();
  });
});
