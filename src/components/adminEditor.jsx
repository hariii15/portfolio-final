import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { FiArrowLeft, FiSave, FiEye, FiEdit3, FiPlus, FiX } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-house Lightweight Markdown Parser Component (matches BlogDetail)
const MarkdownPreview = ({ content }) => {
  if (!content) return <p className="text-white/30 italic">Live markdown preview will appear here...</p>;
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
        level === 1 ? 'text-xl sm:text-2xl font-extrabold text-white mt-6 mb-3' :
        level === 2 ? 'text-lg sm:text-xl font-bold text-white mt-5 mb-2 border-b border-white/10 pb-2' :
        level === 3 ? 'text-base sm:text-lg font-semibold text-white mt-4 mb-2' :
        'text-sm sm:text-base font-medium text-white mt-3 mb-1';
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

    if (!listMatch && inList) {
      flushList(i);
    }

    if (line.trim() === '') {
      continue;
    }

    parsed.push(
      <p key={i} className="text-white/70 leading-relaxed mb-4 text-sm sm:text-base" 
         dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
    );
  }

  flushList(lines.length);

  return <div className="markdown-preview-content">{parsed}</div>;
};

function parseInlineMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-white/10 text-amber-400 font-mono rounded text-xs">$1</code>');
}

const generateClientSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const estimateClientReadingTime = (content) => {
  const wpm = 200;
  const words = content ? content.trim().split(/\s+/).length : 0;
  return `${Math.ceil(words / wpm)} min read`;
};

const AdminEditor = () => {
  const { id } = useParams(); // present if editing
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('edit'); // 'edit' or 'preview' (split on desktop, toggle on mobile)
  
  const isAutoSavingRef = useRef(false);
  const localBackupKey = id ? `autosave_edit_${id}` : `autosave_create`;

  // Auth Protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load initial data (if editing)
  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        // Create mode: Check for autosaved backup
        const backup = localStorage.getItem(localBackupKey);
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            if (window.confirm('Restoring local draft found from your previous session.')) {
              setTitle(parsed.title || '');
              setSlug(parsed.slug || '');
              setExcerpt(parsed.excerpt || '');
              setContent(parsed.content || '');
              setCoverImage(parsed.coverImage || '');
              setTags(parsed.tags || []);
              setPublished(parsed.published || false);
            }
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${API_URL}/blogs`);
        if (!res.ok) throw new Error('Authentication failed.');
        const blogsList = await res.json();
        
        const blogToEdit = blogsList.find(b => b.id === id);
        if (!blogToEdit) throw new Error('Blog article not found.');

        setTitle(blogToEdit.title);
        setSlug(blogToEdit.slug);
        setExcerpt(blogToEdit.excerpt || '');
        setContent(blogToEdit.content);
        setCoverImage(blogToEdit.coverImage || '');
        setTags(blogToEdit.tags || []);
        setPublished(blogToEdit.published);

        // Check if there is a local backup that is newer
        const backup = localStorage.getItem(localBackupKey);
        if (backup) {
          const parsed = JSON.parse(backup);
          if (parsed.updatedAt && new Date(parsed.updatedAt) > new Date(blogToEdit.updatedAt)) {
            if (window.confirm('An auto-saved version exists that is newer than the database. Restore it?')) {
              setTitle(parsed.title || '');
              setSlug(parsed.slug || '');
              setExcerpt(parsed.excerpt || '');
              setContent(parsed.content || '');
              setCoverImage(parsed.coverImage || '');
              setTags(parsed.tags || []);
              setPublished(parsed.published || false);
            }
          }
        }

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      loadBlog();
    } else {
      const checkUser = setInterval(() => {
        if (auth.currentUser) {
          clearInterval(checkUser);
          loadBlog();
        }
      }, 100);
      return () => clearInterval(checkUser);
    }
  }, [id, localBackupKey]);

  // Handle Title input change (auto generates slug if not manually altered)
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(generateClientSlug(val));
  };

  // Auto-Save Draft Loop
  useEffect(() => {
    if (loading) return;

    const autoSaveInterval = setInterval(() => {
      if (title || content) {
        const payload = {
          title,
          slug,
          excerpt,
          content,
          coverImage,
          tags,
          published,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(localBackupKey, JSON.stringify(payload));
        isAutoSavingRef.current = true;
        
        // Brief visual indication
        setTimeout(() => {
          isAutoSavingRef.current = false;
        }, 1000);
      }
    }, 15000); // Autosave backup to localStorage every 15 seconds

    return () => clearInterval(autoSaveInterval);
  }, [title, slug, excerpt, content, coverImage, tags, published, loading, localBackupKey]);

  // Tag Manager Helpers
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, '');
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (publishImmediate = null) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const isPublishing = publishImmediate !== null ? publishImmediate : published;

    try {
      const token = await auth.currentUser.getIdToken(true);
      const payload = {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        tags,
        published: isPublishing
      };

      const url = id ? `${API_URL}/blogs/${id}` : `${API_URL}/blogs`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || errData.error || 'Failed to save blog post.');
      }

      // Clear local backup on successful server save
      localStorage.removeItem(localBackupKey);

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-2 border-transparent border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] text-white/45 tracking-widest uppercase">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ── Editor Toolbar Header ── */}
      <header className="px-4 sm:px-6 py-4 border-b border-white/10 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {id ? 'Edit Blog Post' : 'Create Blog Post'}
            </h1>
            <p className="text-[10px] text-white/40">
              {estimateClientReadingTime(content)} estimated
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Editor view toggles for smaller screens */}
          <div className="flex bg-neutral-900 border border-white/10 p-0.5 rounded-xl mr-2">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === 'edit' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              Write
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === 'preview' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-neutral-900 border border-white/15 hover:border-white/30 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <FiSave className="w-4 h-4" />
            Save Draft
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
          >
            Publish Post
          </button>
        </div>
      </header>

      {/* ── Editor Body Workspace ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Editor Inputs Panel (Visible in 'edit' or split) */}
        <div className={`flex-1 p-5 overflow-y-auto space-y-5 border-r border-white/5 bg-neutral-950/20 ${
          mode === 'preview' ? 'hidden md:block' : 'block'
        }`}>
          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-1.5">Article Title</label>
              <input
                type="text"
                placeholder="e.g. My ABB Accelerator Journey"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-1.5">URL Slug (Auto-generated)</label>
                <input
                  type="text"
                  placeholder="my-abb-accelerator-journey"
                  value={slug}
                  onChange={(e) => setSlug(generateClientSlug(e.target.value))}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-white focus:outline-none transition-colors font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-white focus:outline-none transition-colors text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-1.5">Tag Management (Press comma or enter)</label>
              <div className="flex flex-wrap gap-2 p-2 bg-black/60 border border-white/10 focus-within:border-amber-500/50 rounded-xl transition-colors">
                {tags.map((tag, idx) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-amber-500 hover:text-amber-300 ml-1 cursor-pointer focus:outline-none"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "Type tag & hit Enter..." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-white text-xs py-1 px-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-1.5">Excerpt (SEO Metadata)</label>
              <textarea
                placeholder="A brief summary of the article..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-white focus:outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-1.5">Content (Markdown format)</label>
              <textarea
                placeholder="Write your article using standard Markdown (# Heading, - List, **Bold**)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-white focus:outline-none transition-colors font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Panel (Visible in 'preview' or split) */}
        <div className={`flex-1 p-6 overflow-y-auto bg-neutral-900/40 backdrop-blur-3xl ${
          mode === 'edit' ? 'hidden md:block border-l border-white/5' : 'block'
        }`}>
          <div className="max-w-2xl mx-auto">
            {coverImage && (
              <div className="w-full max-h-[240px] overflow-hidden rounded-xl border border-white/10 mb-6 bg-neutral-950 flex items-center justify-center">
                <img
                  src={coverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
              {title || <span className="text-white/25">Untranslated Title</span>}
            </h2>
            <div className="flex gap-4 text-xs text-white/40 mb-6 pb-4 border-b border-white/10">
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>{estimateClientReadingTime(content)} read</span>
            </div>

            <main className="prose prose-invert max-w-none">
              <MarkdownPreview content={content} />
            </main>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminEditor;
