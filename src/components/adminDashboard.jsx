import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { FiLogOut, FiPlus, FiEdit2, FiTrash2, FiEye, FiCheck, FiX, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Authenticate & Fetch
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) navigate('/admin');
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/blogs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            await signOut(auth);
            if (active) navigate('/admin');
          } else {
            throw new Error('Failed to retrieve dashboard data.');
          }
          return;
        }

        const data = await res.json();
        if (active) {
          setBlogs(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (blog) => {
    setActionLoading(blog.id);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch(`${API_URL}/blogs/${blog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ published: !blog.published })
      });

      if (!res.ok) throw new Error('Failed to update publication status.');
      const updated = await res.json();

      setBlogs(blogs.map(b => b.id === blog.id ? updated : b));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this post?')) return;
    
    setActionLoading(id);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete post.');
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] text-white/45 tracking-widest uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-12 flex justify-center">
      
      {/* ── Background Atmospheric Blobs ── */}
      <div className="absolute top-[5%] left-[10%] w-[35rem] h-[35rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, rgba(251,191,36,0.01) 75%, transparent 100%)',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header navigation bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
              CMS Dashboard
            </h1>
            <p className="text-xs text-white/40 mt-1">
              Logged in as Portfolio Administrator
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/create')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/15 transition-all cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              New Article
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </header>

        {error && (
          <div className="w-full p-4 mb-6 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Articles', val: blogs.length },
            { label: 'Published Posts', val: blogs.filter(b => b.published).length },
            { label: 'Draft Drafts', val: blogs.filter(b => !b.published).length }
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/5 bg-neutral-900/40 backdrop-blur-xl">
              <div className="text-xs text-white/40 font-semibold tracking-widest uppercase mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-white">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Content list */}
        <div className="border border-white/5 rounded-2xl bg-neutral-900/30 backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 bg-neutral-900/20">
            <h2 className="text-base font-bold text-white">Articles</h2>
          </div>

          {blogs.length === 0 ? (
            <div className="p-16 text-center text-white/30">
              <FiFileText className="w-10 h-10 mx-auto mb-3 text-white/20" />
              <p className="font-semibold text-sm">No articles created yet</p>
              <p className="text-xs mt-1">Click &quot;New Article&quot; to write your first portfolio blog post!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {blogs.map((blog) => (
                <div key={blog.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                  
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase border ${
                        blog.published 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-neutral-800 border-neutral-700 text-white/50'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-white/40">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-white/40">
                        <FiClock className="w-3 h-3" />
                        {blog.readingTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white truncate mb-1">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-white/50 truncate max-w-xl">
                      {blog.excerpt || 'No excerpt provided.'}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleTogglePublish(blog)}
                      disabled={actionLoading === blog.id}
                      title={blog.published ? 'Unpublish' : 'Publish'}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        blog.published
                          ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {blog.published ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => navigate(`/blog/${blog.slug}`)}
                      title="Preview"
                      className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate(`/admin/edit/${blog.id}`)}
                      title="Edit"
                      className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-all cursor-pointer"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(blog.id)}
                      disabled={actionLoading === blog.id}
                      title="Delete"
                      className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
