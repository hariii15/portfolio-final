import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { FiArrowLeft, FiSave, FiEye, FiEdit3, FiX } from 'react-icons/fi';
import { marked } from 'marked';
import { Field, inputCls, PrimaryButton, SecondaryButton } from './ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

marked.setOptions({ gfm: true, breaks: true });

const MarkdownPreview = ({ content }) => {
  if (!content) return <p className="text-sm italic text-[#9B9A93] dark:text-[#6E6E6E]">Preview will appear here…</p>;
  const clean = typeof content === 'string' ? content.replace(/\\n/g, '\n') : content;
  const html = marked.parse(clean);
  return <div className="markdown-preview-content" dangerouslySetInnerHTML={{ __html: html }} />;
};

const slugify = (t) =>
  t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const readingTime = (c) => {
  const words = c ? c.trim().split(/\s+/).length : 0;
  return `${Math.ceil(words / 200)} min read`;
};

const AdminEditor = () => {
  const { id } = useParams();
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
  const [mode, setMode] = useState('edit');

  const localBackupKey = id ? `autosave_edit_${id}` : 'autosave_create';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/admin');
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        const backup = localStorage.getItem(localBackupKey);
        if (backup) {
          try {
            const p = JSON.parse(backup);
            if (window.confirm('Restore local draft from previous session?')) {
              setTitle(p.title || ''); setSlug(p.slug || ''); setExcerpt(p.excerpt || '');
              setContent(p.content || ''); setCoverImage(p.coverImage || '');
              setTags(p.tags || []); setPublished(p.published || false);
            }
          } catch {}
        }
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/blogs`);
        if (!res.ok) throw new Error('Authentication failed.');
        const list = await res.json();
        const b = list.find((x) => x.id === id);
        if (!b) throw new Error('Blog article not found.');
        setTitle(b.title); setSlug(b.slug); setExcerpt(b.excerpt || '');
        setContent(b.content); setCoverImage(b.coverImage || '');
        setTags(b.tags || []); setPublished(b.published);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (auth.currentUser) load();
    else {
      const iv = setInterval(() => {
        if (auth.currentUser) {
          clearInterval(iv);
          load();
        }
      }, 100);
      return () => clearInterval(iv);
    }
  }, [id, localBackupKey]);

  useEffect(() => {
    if (loading) return;
    const iv = setInterval(() => {
      if (title || content) {
        localStorage.setItem(localBackupKey, JSON.stringify({
          title, slug, excerpt, content, coverImage, tags, published, updatedAt: new Date().toISOString(),
        }));
      }
    }, 15000);
    return () => clearInterval(iv);
  }, [title, slug, excerpt, content, coverImage, tags, published, loading, localBackupKey]);

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(/,/g, '');
      if (t && !tags.includes(t)) setTags([...tags, t]);
      setTagInput('');
    }
  };

  const save = async (publishVal = null) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const isPublishing = publishVal !== null ? publishVal : published;
    try {
      const token = await auth.currentUser.getIdToken(true);
      const payload = { title, slug, excerpt, content, coverImage, tags, published: isPublishing };
      const url = id ? `${API_URL}/blogs/${id}` : `${API_URL}/blogs`;
      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.details || d.error || 'Failed to save.');
      }
      localStorage.removeItem(localBackupKey);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
        <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">Loading editor</p>
      </div>
    );
  }

  const tabBtn = (active) =>
    `flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'bg-[#111111] text-white dark:bg-[#EDEDED] dark:text-[#0A0A0A]'
        : 'text-[#6F6E69] dark:text-[#A1A1A1]'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0A0A0A]">
      <header className="border-b border-[#E9E9E6] dark:border-[#232323]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E9E9E6] dark:border-[#2E2E2E]"
              aria-label="Back"
            >
              <FiArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-display text-[17px] font-bold tracking-tight">{id ? 'Edit post' : 'New post'}</h1>
              <p className="mono text-[11px] text-[#9B9A93] dark:text-[#6E6E6E]">{readingTime(content)} · autosaves locally</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-[10px] border border-[#E9E9E6] p-1 dark:border-[#2E2E2E]">
              <button onClick={() => setMode('edit')} className={tabBtn(mode === 'edit')}>
                <FiEdit3 size={13} /> Write
              </button>
              <button onClick={() => setMode('preview')} className={tabBtn(mode === 'preview')}>
                <FiEye size={13} /> Preview
              </button>
            </div>
            <SecondaryButton onClick={() => save(false)} className="px-4 py-2 text-[13px]">
              <FiSave size={14} /> {saving ? 'Saving…' : 'Save draft'}
            </SecondaryButton>
            <PrimaryButton onClick={() => save(true)} className="px-4 py-2 text-[13px]">
              Publish
            </PrimaryButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-0 md:flex-row">
        <div className={`flex-1 border-r border-[#E9E9E6] p-5 dark:border-[#232323] sm:p-6 ${mode === 'preview' ? 'hidden md:block' : 'block'}`}>
          {error && (
            <div className="mb-4 rounded-apple border border-[#EC4899]/30 bg-[#EC4899]/5 p-3 text-sm text-[#EC4899]">{error}</div>
          )}
          <div className="space-y-4">
            <Field label="Title">
              <input value={title} onChange={(e) => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }} placeholder="Post title" className={inputCls} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Slug">
                <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="post-slug" className={`${inputCls} mono text-[13px]`} />
              </Field>
              <Field label="Cover image URL">
                <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" className={`${inputCls} text-[13px]`} />
              </Field>
            </div>
            <Field label="Tags — press Enter">
              <div className={`flex flex-wrap gap-2 rounded-apple border border-[#E9E9E6] bg-white p-2 dark:border-[#2E2E2E] dark:bg-[#0A0A0A]`}>
                {tags.map((tag, i) => (
                  <span key={tag} className="mono inline-flex items-center gap-1 rounded-md bg-[#F7F7F5] px-2 py-1 text-[12px] dark:bg-[#161616]">
                    {tag}
                    <button onClick={() => setTags(tags.filter((_, x) => x !== i))} aria-label="Remove tag"><FiX size={13} /></button>
                  </span>
                ))}
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder={tags.length ? '' : 'Add tags…'} className="min-w-[120px] flex-1 bg-transparent px-2 py-1 text-[13px] outline-none" />
              </div>
            </Field>
            <Field label="Excerpt">
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Brief summary…" className={`${inputCls} resize-y text-sm`} />
            </Field>
            <Field label="Content — Markdown">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} placeholder="# Heading…" className={`${inputCls} mono resize-y text-[13.5px] leading-relaxed`} />
            </Field>
          </div>
        </div>
        <div className={`flex-1 bg-[#F7F7F5] p-5 dark:bg-[#0A0A0A] sm:p-6 ${mode === 'edit' ? 'hidden md:block' : 'block'}`}>
          <div className="mx-auto max-w-2xl">
            {coverImage && (
              <div className="mb-5 overflow-hidden rounded-apple-lg border border-[#E9E9E6] dark:border-[#232323]">
                <img src={coverImage} alt="Cover" className="max-h-[240px] w-full object-cover" />
              </div>
            )}
            <h2 className="font-display text-2xl font-bold tracking-tight">{title || <span className="text-[#9B9A93] dark:text-[#6E6E6E]">Untitled</span>}</h2>
            <p className="mono mt-1 text-[12px] text-[#9B9A93] dark:text-[#6E6E6E]">{readingTime(content)}</p>
            <div className="mt-4 border-t border-[#E9E9E6] pt-4 dark:border-[#232323]">
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
