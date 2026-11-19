import React, { useState } from 'react';
import { request } from './filmShared';
export default function FilmShareExport({ id, saved }) {
  const [url, setUrl] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [copied, setCopied] = useState(false);
  const create = async event => {
    event.preventDefault(); setBusy(true); setError('');
    const form = event.currentTarget, data = new FormData(form);
    try { const share = await request(`/${id}/share`, { method: 'POST', body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) }); setUrl(`${window.location.origin}${share.path}`); form.reset(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <details className="fd-editor-panel"><summary>Share shooting gallery</summary><p className="sb-muted">Create a crew login for this film only. The link shows scenes, shots and checklists. Crew updates save to this film; your story and admin workspace stay private.</p>
    <form className="sb-form-grid" onSubmit={create}><label className="sb-field">Crew email<input name="email" type="email" autoComplete="off" required /></label><label className="sb-field">Crew password<input name="password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required /></label><button className="sb-button" disabled={busy || !saved}>{busy ? 'Creating link…' : 'Create gallery link'}</button></form>
    {!saved && <p className="sb-muted">Wait for your film to finish saving before sharing.</p>}{error && <p role="alert" className="sb-error">{error}</p>}
    {url && <div><label className="sb-field">Share this URL<input aria-label="Gallery share URL" readOnly value={url} onFocus={e => e.target.select()} /></label><button className="sb-button sb-quiet" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setError('Select and copy the URL above.'); } }}>{copied ? 'Copied' : 'Copy link'}</button><a className="sb-button sb-quiet" href={url} target="_blank" rel="noreferrer">Open gallery</a></div>}
  </details>;
}
