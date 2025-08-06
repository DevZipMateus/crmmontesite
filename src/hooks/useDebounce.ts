import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

export function useDebounceState<T>(initialValue: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const valueRef = useRef<T>(initialValue);

  const setValue = useCallback(
    (newValue: T, callback?: (value: T) => void) => {
      valueRef.current = newValue;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (callback) {
          callback(valueRef.current);
        }
      }, delay);
    },
    [delay]
  );

  return [valueRef.current, setValue] as const;
}