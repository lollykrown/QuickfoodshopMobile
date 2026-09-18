import NetInfo from '@react-native-community/netinfo';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import useFetch from '@/hooks/usefetch';

const online = { isConnected: true, isInternetReachable: true };

// The hook registers one NetInfo listener; grab it to simulate connectivity changes.
const connectivity = () => NetInfo.addEventListener.mock.calls[0][0];

beforeEach(() => {
  NetInfo.addEventListener.mockClear();
  NetInfo.addEventListener.mockReturnValue(jest.fn());
  NetInfo.fetch.mockResolvedValue(online);
});

describe('useFetch', () => {
  it('starts idle with empty data when autoFetch is off', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useFetch(fn, false));

    expect(result.current).toMatchObject({ data: [], loading: false, error: null, isOnline: true });
    expect(fn).not.toHaveBeenCalled();
  });

  it('fetches on mount by default and stores the result', async () => {
    const fn = jest.fn().mockResolvedValue([{ id: 1 }]);
    const { result } = renderHook(() => useFetch(fn));

    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('reports loading while the request is in flight', async () => {
    let resolve;
    const fn = jest.fn(() => new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useFetch(fn));

    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => resolve(['done']));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(['done']);
  });

  it('refetch runs the function on demand', async () => {
    const fn = jest.fn().mockResolvedValueOnce(['first']).mockResolvedValueOnce(['second']);
    const { result } = renderHook(() => useFetch(fn, false));

    await act(async () => result.current.refetch());
    expect(result.current.data).toEqual(['first']);

    await act(async () => result.current.refetch());
    expect(result.current.data).toEqual(['second']);
  });

  it('keeps an Error thrown by the fetcher', async () => {
    const boom = new Error('Failed to fetch data: Server Error');
    const fn = jest.fn().mockRejectedValue(boom);
    const { result } = renderHook(() => useFetch(fn, false));

    await act(async () => result.current.refetch());

    expect(result.current.error).toBe(boom);
    expect(result.current.loading).toBe(false);
  });

  it('wraps a non-Error rejection', async () => {
    const fn = jest.fn().mockRejectedValue('nope');
    const { result } = renderHook(() => useFetch(fn, false));

    await act(async () => result.current.refetch());

    expect(result.current.error).toEqual(new Error('An unknown error occurred'));
  });

  it('clears a previous error when the next fetch starts', async () => {
    const fn = jest.fn().mockRejectedValueOnce(new Error('first')).mockResolvedValueOnce(['ok']);
    const { result } = renderHook(() => useFetch(fn, false));

    await act(async () => result.current.refetch());
    expect(result.current.error).not.toBeNull();

    await act(async () => result.current.refetch());
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(['ok']);
  });

  it('reset clears data, error and loading', async () => {
    const fn = jest.fn().mockResolvedValue(['x']);
    const { result } = renderHook(() => useFetch(fn, false));
    await act(async () => result.current.refetch());

    act(() => result.current.reset());

    expect(result.current).toMatchObject({ data: [], error: null, loading: false });
  });

  describe('offline', () => {
    it('sets a "No internet connection" error instead of calling the fetcher', async () => {
      NetInfo.fetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
      const fn = jest.fn();
      const { result } = renderHook(() => useFetch(fn, false));

      await act(async () => result.current.refetch());

      expect(result.current.error).toEqual(new Error('No internet connection'));
      expect(fn).not.toHaveBeenCalled();
    });

    it('does not block the request when connected, even if reachability is unconfirmed', async () => {
      NetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: false });
      const fn = jest.fn().mockResolvedValue(['x']);
      const { result } = renderHook(() => useFetch(fn, false));

      await act(async () => result.current.refetch());

      expect(fn).toHaveBeenCalled();
    });

    it('tracks connectivity changes in isOnline', () => {
      const { result } = renderHook(() => useFetch(jest.fn(), false));

      act(() => connectivity()({ isConnected: false }));
      expect(result.current.isOnline).toBe(false);

      act(() => connectivity()({ isConnected: true }));
      expect(result.current.isOnline).toBe(true);
    });

    it('treats an unknown connection state (null) as online', () => {
      const { result } = renderHook(() => useFetch(jest.fn(), false));
      act(() => connectivity()({ isConnected: null }));
      expect(result.current.isOnline).toBe(true);
    });

    it('auto-fetches again when the connection comes back', async () => {
      const fn = jest.fn().mockResolvedValue(['x']);
      renderHook(() => useFetch(fn));
      await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));

      act(() => connectivity()({ isConnected: false }));
      act(() => connectivity()({ isConnected: true }));

      await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
    });

    it('unsubscribes from NetInfo on unmount', () => {
      const unsubscribe = jest.fn();
      NetInfo.addEventListener.mockReturnValue(unsubscribe);
      const { unmount } = renderHook(() => useFetch(jest.fn(), false));

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
