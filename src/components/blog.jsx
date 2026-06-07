import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiArrowUpRight, FiTag } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        let url = `${API_URL}/blogs`;
        const params = [];
        if (searchQuery) params.push(`q=${encodeURIComponent(searchQuery)}`);
        if (selectedTag) params.push(`tag=${encodeURIComponent(selectedTag)}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const data = await res.json();
        setBlogs(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchBlogs, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTag]);

  const allTags = React.useMemo(() => {
    const tagsSet = new Set();
    blogs.forEach((b) => b.tags?.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [blogs]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // Assign a subtle gradient accent per card index
  const cardAccents = [
    'from-amber-500/8 to-transparent',
    'from-violet-500/8 to-transparent',
    'from-sky-500/8 to-transparent',
    'from-rose-500/8 to-transparent',
    'from-emerald-500/8 to-transparent',
    'from-orange-500/8 to-transparent',
  ];

  return (
    <div
      className="relative min-h-screen bg-black text-white overflow-x-hidden blog-container"
    >
      {/* ── Ambient background blobs ── */}
      <div
        className="fixed top-0 left-[-15%] w-[50rem] h-[50rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-0 right-[-10%] w-[40rem] h-[40rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 py-20 pb-32">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center flex flex-col items-center"
        >
          <p className="text-sm sm:text-base font-semibold tracking-[0.3em] text-amber-500/70 uppercase mb-4 blog-title">
            Writing
          </p>
          <h1
            className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-white leading-none mb-6 blog-title"
            style={{ letterSpacing: '-0.04em' }}
          >
            My Blog
          </h1>
          <p className="text-white/40 text-lg sm:text-xl max-w-xl leading-relaxed mx-auto">
            Thoughts on AI, systems engineering, and the craft of building things.
          </p>
        </motion.div>

        {/* ── Search & Filter ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 mb-10 justify-center items-center"
        >
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-500/30 transition-colors"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar justify-center">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  !selectedTag
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-transparent border-white/[0.08] text-white/40 hover:text-white/70'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-transparent border-white/[0.08] text-white/40 hover:text-white/70'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-[11px] text-white/25 tracking-[0.3em] uppercase">Loading</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="p-6 border border-red-500/15 bg-red-950/10 rounded-xl text-center">
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && blogs.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-white/25 text-sm">No articles yet.</p>
          </div>
        )}

        {/* ── Blog Card Grid ── */}
        {!loading && !error && blogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {blogs.map((blog, idx) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  onMouseEnter={() => setHoveredId(blog.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="group relative cursor-pointer"
                  style={{ height: '280px' }}
                >
                  {/* Card shell */}
                  <div
                    className="absolute inset-0 rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden transition-all duration-300 group-hover:border-white/[0.14] group-hover:bg-white/[0.05]"
                    style={{
                      boxShadow: hoveredId === blog.id
                        ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                  >
                    {/* Subtle gradient accent top-left */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${cardAccents[idx % cardAccents.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    {/* Card content */}
                    <div className="relative h-full flex flex-col justify-between p-6">

                      {/* Top: Draft badge + Tags */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-white/40 text-[10px] font-medium"
                            >
                              <FiTag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        {!blog.published && (
                          <span className="shrink-0 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Middle: Title + Excerpt */}
                      <div className="flex-1 flex flex-col justify-center py-4">
                        <h2
                          className="text-xl sm:text-2xl font-bold text-white leading-snug mb-2 line-clamp-3 group-hover:text-amber-50 transition-colors duration-200"
                          style={{ letterSpacing: '-0.02em', fontFamily: "'Outfit', 'Inter', sans-serif" }}
                        >
                          {blog.title}
                        </h2>
                        {blog.excerpt && (
                          <p className="text-white/35 text-xs leading-relaxed line-clamp-2">
                            {blog.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Bottom: Metrics + Arrow */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                        <div className="flex items-center gap-4 text-[11px] text-white/30">
                          <span className="flex items-center gap-1.5">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(blog.createdAt)}
                          </span>
                          {blog.readingTime && (
                            <span className="flex items-center gap-1.5">
                              <FiClock className="w-3 h-3" />
                              {blog.readingTime}
                            </span>
                          )}
                          {blog.views != null && (
                            <span>{blog.views} views</span>
                          )}
                        </div>

                        <motion.div
                          animate={{ x: hoveredId === blog.id ? 2 : 0, y: hoveredId === blog.id ? -2 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-amber-500/15 group-hover:border-amber-500/25 transition-colors duration-200"
                        >
                          <FiArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-amber-400 transition-colors duration-200" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;
