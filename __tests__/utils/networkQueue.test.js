describe('networkQueue', () => {
  let enqueueRequest;
  let startNetworkListener;
  let NetInfo;

  // The module keeps its queue and "listening" flag at module scope, so load a fresh copy per test.
  beforeEach(() => {
    jest.resetModules();
    NetInfo = require('@react-native-community/netinfo');
    NetInfo.addEventListener.mockClear();
    ({ enqueueRequest, startNetworkListener } = require('@/utils/networkQueue'));
  });

  const connectivityCallback = () => NetInfo.addEventListener.mock.calls[0][0];

  it('registers a single NetInfo listener however many times it is started', () => {
    const axiosInstance = jest.fn();
    startNetworkListener(axiosInstance);
    startNetworkListener(axiosInstance);
    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('keeps queued requests pending while offline', async () => {
    const axiosInstance = jest.fn();
    startNetworkListener(axiosInstance);

    let settled = false;
    enqueueRequest({ url: '/a' }).then(() => (settled = true));

    connectivityCallback()({ isConnected: false });
    await Promise.resolve();

    expect(axiosInstance).not.toHaveBeenCalled();
    expect(settled).toBe(false);
  });

  it('replays queued requests when connectivity returns and resolves their promises', async () => {
    const axiosInstance = jest.fn(async (config) => ({ data: `ok:${config.url}` }));
    startNetworkListener(axiosInstance);

    const first = enqueueRequest({ url: '/a' });
    const second = enqueueRequest({ url: '/b' });

    connectivityCallback()({ isConnected: true });

    await expect(first).resolves.toEqual({ data: 'ok:/a' });
    await expect(second).resolves.toEqual({ data: 'ok:/b' });
    expect(axiosInstance).toHaveBeenCalledTimes(2);
    expect(axiosInstance).toHaveBeenCalledWith({ url: '/a' });
  });

  it('rejects the queued promise when the replayed request fails', async () => {
    const boom = new Error('boom');
    const axiosInstance = jest.fn(() => Promise.reject(boom));
    startNetworkListener(axiosInstance);

    const queued = enqueueRequest({ url: '/a' });
    connectivityCallback()({ isConnected: true });

    await expect(queued).rejects.toBe(boom);
  });

  it('does not replay the same request twice', async () => {
    const axiosInstance = jest.fn(async () => ({}));
    startNetworkListener(axiosInstance);

    const queued = enqueueRequest({ url: '/a' });
    connectivityCallback()({ isConnected: true });
    await queued;
    connectivityCallback()({ isConnected: true });

    expect(axiosInstance).toHaveBeenCalledTimes(1);
  });

  it('treats an unknown connection state (null) as online', async () => {
    const axiosInstance = jest.fn(async () => ({}));
    startNetworkListener(axiosInstance);

    const queued = enqueueRequest({ url: '/a' });
    connectivityCallback()({ isConnected: null });
    await queued;

    expect(axiosInstance).toHaveBeenCalledTimes(1);
  });

  it('does nothing when connectivity changes and the queue is empty', () => {
    const axiosInstance = jest.fn();
    startNetworkListener(axiosInstance);
    connectivityCallback()({ isConnected: true });
    expect(axiosInstance).not.toHaveBeenCalled();
  });
});
