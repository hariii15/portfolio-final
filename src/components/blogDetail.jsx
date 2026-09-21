import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';
import { auth } from '../firebase';
import { marked } from 'marked';
import { Page, Card, SecondaryButton } from './ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

marked.setOptions({ gfm: true, breaks: true });

const Markdown = ({ content }) => {
  if (!content) return null;
  const clean = typeof content === 'string' ? content.replace(/\\n/g, '\n') : content;
  const html = marked.parse(clean);
  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Page narrow>
      <div className="pt-10 sm:pt-14">
        <button
          onClick={() => navigate('/blog')}
          className="group flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9B9A93] transition-colors hover:text-[#111111] dark:text-[#6E6E6E] dark:hover:text-[#EDEDED]"
        >
          <FiArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>

        {loading && (
          <div className="flex flex-col items-center py-24">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
            <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">Loading</p>
          </div>
        )}

        {!loading && error && (
          <Card className="mt-8 p-8 text-center">
            <p className="text-sm text-[#EC4899]">{error}</p>
            <div className="mt-4 flex justify-center">
              <SecondaryButton onClick={() => navigate('/blog')}>Go back</SecondaryButton>
            </div>
          </Card>
        )}

        {!loading && !error && blog && (
          <article className="mt-8">
            {!blog.published && (
              <span className="mono inline-block rounded-md border border-[#EC4899]/30 bg-[#EC4899]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#EC4899]">
                Draft preview
              </span>
            )}
            {blog.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <span key={tag} className="mono rounded-md bg-[#F7F7F5] px-2 py-1 text-[11px] text-[#6F6E69] dark:bg-[#161616] dark:text-[#A1A1A1]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="font-display mt-4 text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.75rem]">
              {blog.title}
            </h1>
            <div className="mono mt-5 flex flex-wrap items-center gap-4 border-b border-[#E9E9E6] pb-6 text-[12px] text-[#9B9A93] dark:border-[#232323] dark:text-[#6E6E6E]">
              <span className="flex items-center gap-1.5"><FiCalendar size={13} />{formatDate(blog.createdAt)}</span>
              {blog.readingTime && <span className="flex items-center gap-1.5"><FiClock size={13} />{blog.readingTime}</span>}
              {blog.views != null && <span>{blog.views} views</span>}
            </div>
            {blog.coverImage && (
              <div className="mt-8 overflow-hidden rounded-apple-lg border border-[#E9E9E6] dark:border-[#232323]">
                <img src={blog.coverImage} alt={blog.title} className="max-h-[420px] w-full object-cover" />
              </div>
            )}
            {blog.excerpt && (
              <p className="mt-8 text-[19px] font-light leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
                {blog.excerpt}
              </p>
            )}
            <div className="mt-6">
              <Markdown content={blog.content} />
            </div>
            <div className="mt-12 border-t border-[#E9E9E6] pt-6 dark:border-[#232323]">
              <button
                onClick={() => navigate('/blog')}
                className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9B9A93] hover:text-[#111111] dark:text-[#6E6E6E] dark:hover:text-[#EDEDED]"
              >
                <FiArrowLeft size={14} /> All articles
              </button>
            </div>
          </article>
        )}
      </div>
    </Page>
  );
};

export default BlogDetail;
