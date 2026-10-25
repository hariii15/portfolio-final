import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function useAdminAuth() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      if (!user) {
        navigate('/admin', { replace: true });
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        if (!res.ok) {
          await signOut(auth);
          navigate('/admin', { replace: true });
          return;
        }
        setReady(true);
      } catch {
        if (!active) return;
        navigate('/admin', { replace: true });
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, [navigate]);

  return ready;
}
