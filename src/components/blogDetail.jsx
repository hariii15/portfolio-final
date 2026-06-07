import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-house Lightweight Markdown Parser Component (pure JS, super responsive)
const Markdown = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n');
  let inList = false;
  let listItems = [];
  const parsed = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      parsed.push(
        <ul key={`ul-${key}`} className="list-disc pl-6 mb-6 space-y-2 text-white/80">
          {listItems.map((item, index) => (
            <li key={`li-${key}-${index}`} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // check header
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList(i);
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const headingClasses = 
        level === 1 ? 'text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4' :
        level === 2 ? 'text-xl sm:text-2xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2' :
        level === 3 ? 'text-lg sm:text-xl font-semibold text-white mt-5 mb-2' :
        'text-base sm:text-lg font-medium text-white mt-4 mb-2';
      const HeadingTag = `h${level}`;
      parsed.push(<HeadingTag key={i} className={headingClasses}>{text}</HeadingTag>);
      continue;
    }

    // check list
    const listMatch = line.match(/^[-*+]\s+(.*)$/);
    if (listMatch) {
      inList = true;
      listItems.push(parseInlineMarkdown(listMatch[1]));
      continue;
    }

    // if line is not a list item, flush list
    if (!listMatch && inList) {
      flushList(i);
    }

    // check empty line
    if (line.trim() === '') {
      continue;
    }

    // standard paragraph
    parsed.push(
      <p key={i} className="text-white/75 leading-relaxed mb-4 text-base sm:text-lg" 
         dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
    );
  }

  // final flush
  flushList(lines.length);

  return <div className="markdown-content">{parsed}</div>;
};

// Inline parsing helper
function parseInlineMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-white/10 text-amber-400 font-mono rounded text-sm">$1</code>');
}

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
        
        // Pass auth token if logged in (allows previews)
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/blogs/${slug}`, { headers });
        if (res.status === 404) {
          throw new Error('Blog article not found.');
        }
        if (res.status === 403) {
          throw new Error('You do not have permission to preview this draft.');
        }
        if (!res.ok) {
          throw new Error('Failed to retrieve blog article.');
        }
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white px-4 sm:px-8 py-24 flex flex-col items-center overflow-x-hidden">
      {/* ── Background Atmospheric Blobs ── */}
      <div className="absolute top-[5%] left-[10%] w-[35rem] h-[35rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(251,191,36,0.02) 75%, transparent 100%)',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/blog')}
          className="group flex items-center gap-2 text-sm text-white/50 hover:text-white cursor-pointer mb-8 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Articles
        </button>

        {loading && (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-xs text-white/40 tracking-widest uppercase">Fetching article...</p>
          </div>
        )}

        {!loading && error && (
          <div className="py-20 text-center border border-red-500/20 bg-red-950/20 rounded-xl">
            <p className="text-base text-red-400 font-semibold mb-2">{error}</p>
            <button
              onClick={() => navigate('/blog')}
              className="px-4 py-2 mt-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Go Back
            </button>
          </div>
        )}

        {!loading && !error && blog && (
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Header info */}
            <header className="mb-8 border-b border-white/10 pb-6">
              {/* Draft Status Badge */}
              {!blog.published && (
                <span className="inline-block bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-3">
                  Previewing Draft Mode
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-white/55">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(blog.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-4 h-4" />
                  {blog.readingTime}
                </span>
              </div>
            </header>

            {/* Cover Image */}
            {blog.coverImage && (
              <div className="w-full max-h-[380px] overflow-hidden rounded-2xl border border-white/10 mb-8 bg-neutral-900 flex items-center justify-center">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Markdown Body Content */}
            <main className="prose prose-invert max-w-none mb-12">
              <Markdown content={blog.content} />
            </main>

            {/* Tags footer */}
            {blog.tags && blog.tags.length > 0 && (
              <footer className="pt-6 border-t border-white/10 flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-semibold"
                  >
                    <FiTag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </footer>
            )}
          </motion.article>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
