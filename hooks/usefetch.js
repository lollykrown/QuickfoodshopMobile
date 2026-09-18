import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";

const useFetch = (fetchFunction, autoFetch = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // 🔌 Listen for connection changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online =
        state.isConnected === false ? false : true;

      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  const fetchData = useCallback(async () => {
    const state = await NetInfo.fetch();

    if (state.isConnected === false) {
      setError(new Error("No internet connection"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (autoFetch && isOnline) {
      fetchData();
    }
  }, [autoFetch, isOnline, fetchData]);

  const reset = () => {
    setData([]);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    isOnline,
    refetch: fetchData,
    reset,
  };
};

export default useFetch;
