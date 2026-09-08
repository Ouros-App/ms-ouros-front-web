import { useEffect, useState } from 'react';
import { STORAGE_VERSION } from '@/utils/constants';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const storeKey = `${STORAGE_VERSION}:${key}`;
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(storeKey);
    return raw ? (JSON.parse(raw) as T) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(value));
  }, [storeKey, value]);

  return [value, setValue] as const;
}
