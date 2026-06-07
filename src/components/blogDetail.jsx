import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { auth } from '../firebase';
import { marked } from 'marked';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true
});

const Markdown = ({ content }) => {
  if (!content) return null;
  // Replace double-escaped literal \n strings with actual newline characters
  const cleanContent = typeof content === 'string' ? content.replace(/\\n/g, '\n') : content;
  const html = marked.parse(cleanContent);
  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ── Main Component ─────────────────────────────────────────────────
const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        const headers = {};
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}/blogs/${slug}`, { headers });
        if (res.status === 404) throw new Error('Article not found.');
        if (res.status === 403) throw new Error('You do not have permission to preview this draft.');
        if (!res.ok) throw new Error('Failed to retrieve article.');
        const data = await res.json();
        setBlog(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetails();
  }, [slug]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div
      className="relative min-h-screen bg-black text-white overflow-x-hidden blog-container"
    >
      {/* Ambient blobs */}
      <div
        className="fixed top-[5%] left-[-10%] w-[45rem] h-[45rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 sm:px-8 py-20 pb-36">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/blog')}
          className="group flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-white/30 hover:text-white/70 cursor-pointer mb-14 transition-colors duration-200"
        >
          <FiArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          Back
        </motion.button>

        {/* Loading */}
        {loading && (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-[11px] text-white/25 tracking-[0.3em] uppercase">Loading</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-20 text-center border border-red-500/10 bg-red-950/10 rounded-2xl">
            <p className="text-sm text-red-400/70 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate('/blog')}
              className="px-5 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
            >
              Go back
            </button>
          </div>
        )}

        {/* Article */}
        {!loading && !error && blog && (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Draft badge */}
            {!blog.published && (
              <div className="mb-6">
                <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
                  Previewing Draft
                </span>
              </div>
            )}

            {/* Tags row */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white/35 text-[11px] font-medium"
                  >
                    <FiTag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] mb-8 blog-title"
              style={{ letterSpacing: '-0.03em' }}
            >
              {blog.title}
            </h1>

            {/* Meta bar */}
            <div className="flex items-center gap-6 text-[12px] text-white/30 mb-10 pb-8 border-b border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5" />
                {formatDate(blog.createdAt)}
              </span>
              {blog.readingTime && (
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5" />
                  {blog.readingTime}
                </span>
              )}
              {blog.views != null && (
                <span>{blog.views} views</span>
              )}
            </div>

            {/* Cover image */}
            {blog.coverImage && (
              <div className="w-full overflow-hidden rounded-2xl border border-white/[0.06] mb-12 bg-white/[0.02]">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full object-cover max-h-[420px]"
                />
              </div>
            )}

            {/* Excerpt lead */}
            {blog.excerpt && (
              <p
                className="text-xl sm:text-2xl text-white/50 leading-relaxed mb-10 font-light"
                style={{ letterSpacing: '-0.01em' }}
              >
                {blog.excerpt}
              </p>
            )}

            {/* Article body */}
            <div className="mb-16">
              <Markdown content={blog.content} />
            </div>

            {/* Bottom divider */}
            <div className="border-t border-white/[0.05] pt-8">
              <button
                onClick={() => navigate('/blog')}
                className="group flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-white/25 hover:text-white/60 cursor-pointer transition-colors duration-200"
              >
                <FiArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                All Articles
              </button>
            </div>
          </motion.article>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
