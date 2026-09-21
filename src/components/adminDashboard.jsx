import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { FiLogOut, FiPlus, FiEdit2, FiTrash2, FiEye, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import { Card, SectionLabel, PrimaryButton, SecondaryButton } from './ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) navigate('/admin');
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            await signOut(auth);
            if (active) navigate('/admin');
          } else throw new Error('Failed to retrieve dashboard data.');
          return;
        }
        const data = await res.json();
        if (active) {
          setBlogs(data);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    });
    return () => {
      active = false;
      unsub();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin');
  };

  const handleTogglePublish = async (blog) => {
    setActionLoading(blog.id);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch(`${API_URL}/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: !blog.published }),
      });
      if (!res.ok) throw new Error('Failed to update publication status.');
      const updated = await res.json();
      setBlogs(blogs.map((b) => (b.id === blog.id ? updated : b)));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    setActionLoading(id);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete post.');
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
        <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">Loading dashboard</p>
      </div>
    );
  }

  const iconBtn =
    'flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E9E9E6] text-[#6F6E69] transition-colors hover:bg-[#F7F7F5] hover:text-[#111111] dark:border-[#2E2E2E] dark:text-[#A1A1A1] dark:hover:bg-[#161616] dark:hover:text-[#EDEDED]';

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A]">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-[#E9E9E6] pb-6 dark:border-[#232323] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B9A93] dark:text-[#6E6E6E]">Admin</p>
            <h1 className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">Logged in as portfolio administrator</p>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => navigate('/admin/create')}>
              <FiPlus size={15} /> New article
            </PrimaryButton>
            <SecondaryButton onClick={handleLogout}>
              <FiLogOut size={15} /> Log out
            </SecondaryButton>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-apple border border-[#EC4899]/30 bg-[#EC4899]/5 p-4 text-sm text-[#EC4899]">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total articles', val: blogs.length },
            { label: 'Published', val: blogs.filter((b) => b.published).length },
            { label: 'Drafts', val: blogs.filter((b) => !b.published).length },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <SectionLabel>{s.label}</SectionLabel>
              <div className="font-display mt-1 text-3xl font-bold tracking-tight">{s.val}</div>
            </Card>
          ))}
        </div>

        <Card className="mt-5 overflow-hidden">
          <div className="border-b border-[#E9E9E6] p-5 dark:border-[#232323]">
            <h2 className="text-[15px] font-bold">Articles</h2>
          </div>
          {blogs.length === 0 ? (
            <div className="p-14 text-center">
              <FiFileText size={28} className="mx-auto text-[#9B9A93] dark:text-[#6E6E6E]" />
              <p className="mt-3 text-sm font-semibold">No articles yet</p>
              <p className="mt-1 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">Click “New article” to write your first post.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E9E9E6] dark:divide-[#232323]">
              {blogs.map((blog) => (
                <div key={blog.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`mono rounded-md border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
                        blog.published
                          ? 'border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]'
                          : 'border-[#E9E9E6] bg-[#F7F7F5] text-[#6F6E69] dark:border-[#2E2E2E] dark:bg-[#161616] dark:text-[#A1A1A1]'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="mono flex items-center gap-1 text-[11px] text-[#9B9A93] dark:text-[#6E6E6E]">
                        <FiCalendar size={12} /> {formatDate(blog.createdAt)}
                      </span>
                      <span className="mono flex items-center gap-1 text-[11px] text-[#9B9A93] dark:text-[#6E6E6E]">
                        <FiClock size={12} /> {blog.readingTime}
                      </span>
                    </div>
                    <h3 className="mt-1.5 truncate text-[16px] font-bold">{blog.title}</h3>
                    <p className="truncate text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
                      {blog.excerpt || 'No excerpt provided.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleTogglePublish(blog)} disabled={actionLoading === blog.id} title="Toggle publish" className={iconBtn}>
                      {blog.published ? '✓' : '○'}
                    </button>
                    <button onClick={() => navigate(`/blog/${blog.slug}`)} title="Preview" className={iconBtn}>
                      <FiEye size={15} />
                    </button>
                    <button onClick={() => navigate(`/admin/edit/${blog.id}`)} title="Edit" className={iconBtn}>
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(blog.id)} disabled={actionLoading === blog.id} title="Delete" className={iconBtn}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
