import { useState, useEffect, useCallback } from 'react';

const KEY = 'viewed_notifications';

export function useViewed() {
  const [viewed, setViewed] = useState(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      setViewed(new Set(stored));
    } catch {
      setViewed(new Set());
    }
  }, []);

  const markViewed = useCallback((id) => {
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isViewed = useCallback((id) => viewed.has(id), [viewed]);

  return { markViewed, isViewed };
}
