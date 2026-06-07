import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, githubProvider } from '../firebase';
import { FiGithub, FiLock, FiAlertCircle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already logged in and verified
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${API_URL}/blogs`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            // Token verified and they are the admin!
            navigate('/admin/dashboard');
          } else {
            // Logged in but not authorized as admin
            await signOut(auth);
            setError('Access Denied. Only the owner can access this panel.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to contact verification server.');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setError(null);
    setLoginLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken();
      
      // Verify admin status on backend
      const res = await fetch(`${API_URL}/blogs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        navigate('/admin/dashboard');
      } else {
        await signOut(auth);
        setError('Access Denied. Your GitHub account is not authorized as Admin.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] text-white/45 tracking-widest uppercase">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 overflow-hidden">
      
      {/* ── Sunlight Glow Backlight ── */}
      <div className="absolute w-[40rem] h-[40rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, rgba(251,191,36,0.01) 70%, transparent 100%)',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 rounded-3xl border border-amber-500/15 bg-gradient-to-b from-neutral-900/90 to-black/80 backdrop-blur-2xl shadow-2xl flex flex-col items-center">
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-6">
            <FiLock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2 text-center"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
            Admin Control Center
          </h1>
          <p className="text-sm text-white/50 text-center mb-8">
            Access the content management system to draft, edit, and publish portfolio blog posts.
          </p>

          {error && (
            <div className="w-full flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm mb-6">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-black bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-white/40 border border-amber-400/20 shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-sm sm:text-base"
          >
            {loginLoading ? (
              <div className="w-5 h-5 border-2 border-transparent border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <FiGithub className="w-5 h-5" />
                Sign in with GitHub
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
