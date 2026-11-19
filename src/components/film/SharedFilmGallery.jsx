import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ShotArt from './ShotArt';
import { allShots, CHECKLISTS, SCENE_COVERAGE } from './filmModel';
import './shotbook.css';
import './filmDashboard.css';
import './sharedFilm.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/film-shares';
export default function SharedFilmGallery() {
  const { shareId } = useParams();
  const key = `film-share:${shareId}`;
  const [token, setToken] = useState(() => { try { return sessionStorage.getItem(key) || ''; } catch { return ''; } });
  const [film, setFilm] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [scene, setScene] = useState('all'), [query, setQuery] = useState(''), [notice, setNotice] = useState('');
  const call = useCallback(async (method = 'GET', data, session = token) => {
    const response = await fetch(`${API}/${shareId}${method === 'LOGIN' ? '/login' : ''}`, { method: method === 'LOGIN' ? 'POST' : method, headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session}` } : {}) }, body: data ? JSON.stringify(data) : undefined, signal: AbortSignal.timeout(45000) });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401 && method !== 'LOGIN') { setToken(''); setFilm(null); try { sessionStorage.removeItem(key); } catch { /* optional session storage */ } }
      throw new Error(result.error || 'Could not load gallery.');
    }
    return result;
  }, [token, shareId, key]);
  const refresh = useCallback(async () => { try { setFilm(await call()); setError(''); } catch (e) { setError(e.message); } }, [call]);
  useEffect(() => {
    if (!token) return;
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
    return () => clearInterval(timer);
  }, [token, refresh]);
  const update = async data => {
    setBusy(true); setError(''); setNotice('Saving…');
    try { setFilm(await call('PATCH', data)); setNotice('Saved'); } catch (e) { setError(e.message); setNotice('Changes were not saved. Please try again.'); }
    finally { setBusy(false); }
  };
  const login = async event => {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try { const result = await call('LOGIN', { email: data.get('email'), password: data.get('password') }, ''); try { sessionStorage.setItem(key, result.token); } catch { /* keep session in memory */ } setToken(result.token); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const checklist = (target, sceneId = '') => <div className="sg-checks">{Object.entries(CHECKLISTS).map(([stage, values]) => <details key={stage}><summary>{stage}</summary>{values.map(value => { const item = `${stage}: ${value}`; return <label key={item}><input type="checkbox" disabled={busy} checked={!!target.checklist?.[item]} onChange={e => update({ type: 'checklist', sceneId, key: item, checked: e.target.checked })} />{value}</label>; })}</details>)}</div>;
  const shots = film ? allShots(film) : [];
  const visible = shots.filter(s => (scene === 'all' || (scene === 'unassigned' ? !s.scene : s.scene?.id === scene)) && `${s.title} ${s.description || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="shotbook"><main className="sg-shell">
    <header className="sg-header"><span className="sb-eyebrow">SHOTBOOK / SHOOTING GALLERY</span>{token && <button className="sb-button sb-quiet" onClick={() => { setToken(''); setFilm(null); try { sessionStorage.removeItem(key); } catch { /* optional */ } }}>Sign out</button>}</header>
    <div role="alert">{error && <p className="sb-error">{error}</p>}</div>
    {!token ? <form className="sg-login fd-editor-panel" onSubmit={login}><p className="sb-eyebrow">CREW ACCESS</p><h1>Open the film sheet.</h1><p className="sb-muted">Sign in to view the shots and track shooting progress.</p><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="sb-button" disabled={busy}>{busy ? 'Signing in…' : 'Open gallery'}</button></form>
    : !film ? <p role="status">Loading gallery… <button onClick={refresh}>Try again</button></p> : <>
      <header className="fd-page-heading"><div><h1>{film.title}</h1><p className="sb-muted">{shots.filter(s => ['Filmed', 'Selected', 'Edited'].includes(s.status)).length} / {shots.length} shots filmed · {film.scenes.length} scenes</p></div><button className="sb-button sb-quiet" disabled={busy} onClick={refresh}>Refresh</button></header>
      <div className="sg-toolbar"><label>Scene<select value={scene} onChange={e => setScene(e.target.value)}><option value="all">All scenes</option><option value="unassigned">Unassigned shots</option>{film.scenes.map(s => <option value={s.id} key={s.id}>{s.title}</option>)}</select></label><label>Find a shot<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title or description" /></label><span role="status" aria-live="polite">{notice}</span></div>
      <section className="sg-grid" aria-label="Shot gallery">{visible.map(s => <article className="sg-shot" key={s.id}><div className="sg-art"><ShotArt type={s.art || 'wide'} palette={s.palette || 'ochre'} /><span>{s.number}{s.date ? ` · ${s.date}` : ''}</span></div><div className="sg-shot-body"><p className="sb-eyebrow">{s.scene?.title || 'Unassigned'}</p><h2>{s.title}</h2><p className="sb-muted">{[s.size, s.angle, s.movement].filter(Boolean).join(' · ')}</p><p className="sg-description">{s.description}</p>{s.dialogue && <p>{s.dialogue}</p>}<label className="sg-filmed"><input type="checkbox" disabled={busy} checked={['Filmed', 'Selected', 'Edited'].includes(s.status)} onChange={e => update({ type: 'shot', id: s.id, status: e.target.checked ? 'Filmed' : 'Planned' })} />Filmed</label></div></article>)}</section>
      {!visible.length && <p className="sb-muted">No shots match this filter.</p>}
      <section className="sg-scenes"><h2>Scene checklists</h2>{film.scenes.filter(s => scene === 'all' || scene === s.id).map(s => <details className="fd-editor-panel" key={s.id}><summary>{s.title} · {s.shots.filter(x => ['Filmed', 'Selected', 'Edited'].includes(x.status)).length}/{s.shots.length} filmed</summary>{Object.entries(SCENE_COVERAGE).filter(([group]) => ['Angles', 'Frames'].includes(group)).map(([group, values]) => <details key={group}><summary>{group}</summary><div className="sg-checks">{values.map(value => <label key={value}><input type="checkbox" disabled={busy} checked={!!s.coverageChecklist?.[group]?.[value]} onChange={e => update({ type: 'checklist', sceneId: s.id, group, key: value, checked: e.target.checked })} />{value}</label>)}</div></details>)}<details><summary>Shot list</summary><div className="sg-checks">{s.shots.map(shot => <label key={shot.id}><input type="checkbox" disabled={busy} checked={['Filmed', 'Selected', 'Edited'].includes(shot.status)} onChange={e => update({ type: 'shot', id: shot.id, status: e.target.checked ? 'Filmed' : 'Planned' })} />{shot.title}</label>)}</div></details>{checklist(s, s.id)}</details>)}</section>
      <section className="fd-editor-panel"><h2>Film checklist</h2>{checklist(film)}</section>
    </>}
  </main></div>;
}
