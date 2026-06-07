import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs from API
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
        if (!res.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await res.json();
        setBlogs(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not connect to the backend server. Make sure it is running.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchBlogs, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTag]);

  // Extract all unique tags across blogs for filtering
  const allTags = React.useMemo(() => {
    const tagsSet = new Set();
    blogs.forEach((b) => {
      if (b.tags) {
        b.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [blogs]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white px-4 sm:px-8 py-24 flex flex-col items-center overflow-x-hidden">
      
      {/* ── Sunlight-and-Glass Ambient Blobs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(251,191,36,0.02) 70%, transparent 100%)',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />
      <div className="absolute bottom-[20%] right-[-10%] w-[30rem] h-[30rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, rgba(245,158,11,0.01) 70%, transparent 100%)',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Insights &amp; <span className="silver-shimmer">Logs</span>
          </h1>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">
            Articles on Artificial Intelligence, machine learning architecture, full-stack systems, and developmental journeys.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="w-full flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/60 backdrop-blur-xl border border-amber-500/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors shadow-lg shadow-black/40"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  !selectedTag
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-black/50 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-black/50 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-xs text-white/40 tracking-widest uppercase">Fetching logs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="w-full p-6 text-center border border-red-500/20 bg-red-950/20 backdrop-blur-md rounded-xl mb-6">
            <p className="text-sm text-red-400 font-medium mb-2">{error}</p>
            <p className="text-xs text-white/40">Is the backend running at port 5000?</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && blogs.length === 0 && (
          <div className="py-16 text-center text-white/40 border border-white/5 bg-black/30 rounded-2xl w-full">
            <p className="text-base font-semibold mb-1">No articles found</p>
            <p className="text-xs">Try searching for a different keyword or selecting another tag.</p>
          </div>
        )}

        {/* Blog Post List */}
        {!loading && !error && blogs.length > 0 && (
          <div className="w-full flex flex-col gap-6">
            {blogs.map((blog, idx) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => navigate(`/blog/${blog.slug}`)}
                className="group relative p-6 rounded-2xl cursor-pointer transition-all border border-amber-500/15 hover:border-amber-500/35 bg-gradient-to-br from-black/80 to-neutral-900/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-amber-500/5"
              >
                {/* Ribbon for unpublished draft */}
                {!blog.published && (
                  <span className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                    Draft
                  </span>
                )}

                <div className="flex flex-col gap-3">
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {formatDate(blog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" />
                      {blog.readingTime}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                      {blog.title}
                    </h2>
                    <p className="text-sm text-white/65 leading-relaxed line-clamp-2">
                      {blog.excerpt || 'Read the full article...'}
                    </p>
                  </div>

                  {/* Tags & Action */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags &&
                        blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 text-[10px] font-semibold"
                          >
                            <FiTag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                    </div>

                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:text-amber-400 transition-colors">
                      Read Post
                      <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
