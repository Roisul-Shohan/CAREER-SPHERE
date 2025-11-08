import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      // Filter out DOM elements and other non-serializable objects
      const serializableArgs = args.filter(arg => {
        return typeof arg !== 'object' ||
               arg === null ||
               Array.isArray(arg) ||
               (typeof arg === 'object' && arg.constructor === Object);
      });

      const response = await cb(...serializableArgs);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message);
      console.error("useFetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
