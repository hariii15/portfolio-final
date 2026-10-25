import { auth } from '../../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default async function logActivity(type, data) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const token = await user.getIdToken();
    await fetch(`${API_URL}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    return;
  }
}
