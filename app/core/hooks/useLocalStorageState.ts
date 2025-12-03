import { useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  // Use a consistent initial value on both server and client during hydration
  const [value, setValue] = useState<T>(initialValue);

  // Track first effect run so we can hydrate from localStorage without overwriting it
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (isFirstRun.current) {
        isFirstRun.current = false;

        const stored = window.localStorage.getItem(key);

        if (stored != null) {
          // Hydrate from existing localStorage, do not overwrite
          setValue(JSON.parse(stored) as T);
        } else {
          // No stored value yet: initialize storage with the provided initialValue
          window.localStorage.setItem(key, JSON.stringify(initialValue));
        }

        return;
      }

      // Subsequent updates: persist current value
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to access localStorage", error);
    }
  }, [key, value, initialValue]);

  return [value, setValue] as const;
}
