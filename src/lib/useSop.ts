import { useEffect, useState } from 'react';
import type { Sop } from '../types';

let cached: Sop | null = null;

export function useSop() {
  const [sop, setSop] = useState<Sop | null>(cached);

  useEffect(() => {
    if (cached) {
      setSop(cached);
      return;
    }
    fetch(import.meta.env.BASE_URL + 'data/sop.json')
      .then((r) => r.json())
      .then((data: Sop) => {
        cached = data;
        setSop(data);
      });
  }, []);

  return sop;
}
