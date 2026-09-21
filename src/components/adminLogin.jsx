import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, githubProvider } from '../firebase';
import { FiGithub, FiLock, FiAlertCircle } from 'react-icons/fi';
import { Card, SectionLabel, PrimaryButton } from './ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${API_URL}/blogs`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) navigate('/admin/dashboard');
          else {
            await signOut(auth);
            setError('Access denied. Only the owner can access this panel.');
          }
        } catch {
          setError('Failed to contact verification server.');
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleLogin = async () => {
    setError(null);
    setLoginLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken();
      const res = await fetch(`${API_URL}/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate('/admin/dashboard');
      else {
        await signOut(auth);
        setError('Access denied. Your GitHub account is not authorized as admin.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
        <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">Checking session</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 dark:bg-[#0A0A0A]">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-apple border border-[#E9E9E6] bg-[#F7F7F5] dark:border-[#2E2E2E] dark:bg-[#161616]">
          <FiLock size={20} />
        </div>
        <SectionLabel>
          <span className="mt-5 block">Admin</span>
        </SectionLabel>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight">Control center</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
          Draft, edit, and publish portfolio blog posts.
        </p>
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-apple border border-[#EC4899]/30 bg-[#EC4899]/5 p-3 text-left text-[13px] text-[#EC4899]">
            <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-6">
          <PrimaryButton onClick={handleLogin} className="w-full">
            {loginLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/20 dark:border-t-black" />
            ) : (
              <span className="flex items-center gap-2"><FiGithub size={17} /> Sign in with GitHub</span>
            )}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
