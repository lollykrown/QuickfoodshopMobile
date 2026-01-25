import NetInfo from "@react-native-community/netinfo";

const queue= [];
let isListening = false;

export const enqueueRequest = (
  config
) => {
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject, config });
  });
};

export const startNetworkListener = (axiosInstance) => {
  if (isListening) return;
  isListening = true;

  NetInfo.addEventListener((state) => {
    if (state.isConnected !== false && queue.length > 0) {
      // 🔁 retry queued requests
      const pending = [...queue];
      queue.length = 0;

      pending.forEach(({ resolve, reject, config }) => {
        axiosInstance(config)
          .then(resolve)
          .catch(reject);
      });
    }
  });
};
