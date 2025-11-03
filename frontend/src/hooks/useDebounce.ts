import { useEffect, useState } from 'react';

/**
 * Hook para debouncing de valores
 * @param value - Valor a debounce
 * @param delay - Delay en milisegundos (default: 400ms)
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
