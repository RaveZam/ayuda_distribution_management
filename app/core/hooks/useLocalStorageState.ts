import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const stored = window.localStorage.getItem(key);
      if (stored != null) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
