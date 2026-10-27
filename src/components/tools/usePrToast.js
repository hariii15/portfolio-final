import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { computeProgress } from '../xpModel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOAST_MS = 5200;

export default function usePrToast() {
  const bestsRef = useRef(null);
  const timerRef = useRef(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!active || !user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data)) return;

        const prs = computeProgress(data).prs;
        bestsRef.current = {
          typing: prs.typing?.value ?? null,
          cube: prs.cube?.value ?? null,
          quiz: prs.quiz?.value ?? null,
          periodic: prs.periodic?.value ?? null,
        };
      } catch {
        return;
      }
    });

    return () => {
      active = false;
      unsub();
      clearTimeout(timerRef.current);
    };
  }, []);

  const celebrate = useCallback((type, value, lowerIsBetter = false) => {
    const bests = bestsRef.current;
    if (!bests || !Number.isFinite(value)) return false;

    const previous = bests[type];
    const beats = previous == null || (lowerIsBetter ? value < previous : value > previous);
    if (!beats) return false;

    bests[type] = value;
    setToast({ type, value });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), TOAST_MS);
    return true;
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, celebrate, dismiss };
}
