import { useCallback, useEffect, useRef } from 'react';

export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay?: number,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => clearTimeout(timerRef?.current || 0);
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timerRef.current || 0);
      timerRef.current = setTimeout(() => callback(...args), delay || 500);
    },
    [callback, delay],
  );

  return debouncedFn;
}
