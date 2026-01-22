import { useState, useEffect } from "react";

const useFetch = (fetchFunction, autoFetch = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
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
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;




// import { useState, useEffect, useRef } from "react";

// const cache = new Map();

// const useFetch = (
//   fetchFunction,
//   {
//     autoFetch = true,
//     cacheKey = null,
//     retries = 0,
//     pageSize = 10,
//   } = {}
// ) => {
//   const [data, setData] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasMore, setHasMore] = useState(true);

//   const retryCount = useRef(0);

//   const fetchData = async (pageNumber = 1) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // ✅ CACHING
//       if (cacheKey && cache.has(`${cacheKey}-${pageNumber}`)) {
//         const cached = cache.get(`${cacheKey}-${pageNumber}`);
//         setData(pageNumber === 1 ? cached : [...data, ...cached]);
//         return;
//       }

//       const result = await fetchFunction(pageNumber, pageSize);

//       // ✅ SAVE TO CACHE
//       if (cacheKey) {
//         cache.set(`${cacheKey}-${pageNumber}`, result);
//       }

//       setData(pageNumber === 1 ? result : [...data, ...result]);
//       setHasMore(result.length === pageSize);
//       retryCount.current = 0;
//     } catch (err) {
//       // ✅ RETRY LOGIC
//       if (retryCount.current < retries) {
//         retryCount.current += 1;
//         fetchData(pageNumber);
//       } else {
//         setError(
//           err instanceof Error ? err : new Error("Unknown error occurred")
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMore = () => {
//     if (!loading && hasMore) {
//       const nextPage = page + 1;
//       setPage(nextPage);
//       fetchData(nextPage);
//     }
//   };

//   const reset = () => {
//     setData([]);
//     setPage(1);
//     setError(null);
//     setHasMore(true);
//   };

//   useEffect(() => {
//     if (autoFetch) {
//       fetchData(1);
//     }
//   }, [fetchFunction]);

//   return {
//     data,
//     loading,
//     error,
//     hasMore,
//     loadMore,
//     refetch: () => fetchData(1),
//     reset,
//   };
// };

// export default useFetch;
