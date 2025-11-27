import { useState, useEffect } from 'react';

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export function useFetch(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}${endpoint}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        setData(result);
      } catch (e) {
        setError(e);
        if (options.mockData) {
            setData(options.mockData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]); // Rerun if endpoint changes

  return { data, loading, error };
}