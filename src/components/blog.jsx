import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCalendar, FiClock, FiArrowUpRight } from 'react-icons/fi';
import { Page, Eyebrow, PageTitle, PageSubtitle, Card, inputCls } from './ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Could not connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchBlogs, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedTag]);

  const allTags = React.useMemo(() => {
    const s = new Set();
    blogs.forEach((b) => b.tags?.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [blogs]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Page>
      <div className="pt-12 sm:pt-16">
        <div className="text-center">
          <Eyebrow>Writing</Eyebrow>
          <div className="mt-3 flex justify-center">
            <PageTitle>Blog</PageTitle>
          </div>
          <div className="flex justify-center">
            <PageSubtitle>Thoughts on AI, systems engineering, and building things.</PageSubtitle>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B9A93] dark:text-[#6E6E6E]" />
            <input
              type="text"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputCls} pl-11`}
            />
            <kbd className="mono absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#E9E9E6] bg-[#F7F7F5] px-1.5 py-0.5 text-[11px] text-[#9B9A93] dark:border-[#2E2E2E] dark:bg-[#161616] dark:text-[#6E6E6E] sm:block">
              /
            </kbd>
          </div>
          {allTags.length > 0 && (
            <div className="no-scrollbar flex items-center justify-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedTag(null)}
                className={`whitespace-nowrap rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  !selectedTag
                    ? 'border-[#111111] bg-[#111111] text-white dark:border-[#EDEDED] dark:bg-[#EDEDED] dark:text-[#0A0A0A]'
                    : 'border-[#E9E9E6] text-[#6F6E69] dark:border-[#2E2E2E] dark:text-[#A1A1A1]'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`whitespace-nowrap rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedTag === tag
                      ? 'border-[#111111] bg-[#111111] text-white dark:border-[#EDEDED] dark:bg-[#EDEDED] dark:text-[#0A0A0A]'
                      : 'border-[#E9E9E6] text-[#6F6E69] dark:border-[#2E2E2E] dark:text-[#A1A1A1]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
            <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">Loading</p>
          </div>
        )}

        {!loading && error && (
          <Card className="mx-auto mt-10 max-w-xl p-6 text-center">
            <p className="text-sm text-[#EC4899]">{error}</p>
          </Card>
        )}

        {!loading && !error && blogs.length === 0 && (
          <p className="py-20 text-center text-sm text-[#9B9A93] dark:text-[#6E6E6E]">No articles yet.</p>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <button key={blog.id} onClick={() => navigate(`/blog/${blog.slug}`)} className="text-left">
                <Card className="flex h-full flex-col p-6 transition-colors hover:border-[#D9D9D3] dark:hover:border-[#3a3a3a]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="mono rounded-md bg-[#F7F7F5] px-2 py-0.5 text-[10.5px] font-medium text-[#6F6E69] dark:bg-[#161616] dark:text-[#A1A1A1]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {!blog.published && (
                      <span className="mono shrink-0 rounded-md border border-[#EC4899]/30 bg-[#EC4899]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#EC4899]">
                        Draft
                      </span>
                    )}
                  </div>
                  <h2 className="font-display mt-4 text-[19px] font-bold leading-snug tracking-tight">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between border-t border-[#E9E9E6] pt-4 dark:border-[#232323]" style={{ marginTop: '1.25rem' }}>
                    <div className="mono flex items-center gap-3 text-[11px] text-[#9B9A93] dark:text-[#6E6E6E]">
                      <span className="flex items-center gap-1"><FiCalendar size={12} />{formatDate(blog.createdAt)}</span>
                      {blog.readingTime && <span className="flex items-center gap-1"><FiClock size={12} />{blog.readingTime}</span>}
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#E9E9E6] dark:border-[#2E2E2E]">
                      <FiArrowUpRight size={14} />
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};

export default Blog;
