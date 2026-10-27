import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import Dropdown from '../dropdown';
import './RunLog.css';

const PACE_UNITS = [
  { value: 'min/km', label: 'min/km', source: 'perKm' },
  { value: 'min/mi', label: 'min/mi', source: 'perMi' },
];

const surfaceOptions = [
  { value: 'road', label: 'Road' },
  { value: 'trail', label: 'Trail' },
  { value: 'track', label: 'Track' },
  { value: 'treadmill', label: 'Treadmill' },
  { value: 'treadmill-incline', label: 'Treadmill (incline)' },
];

const RunLogApp = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newDistance, setNewDistance] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newElevation, setNewElevation] = useState('');
  const [newPace, setNewPace] = useState('');
  const [newUnit] = useState('min/km');
  const [newSurface, setNewSurface] = useState('road');
  const [newNote, setNewNote] = useState('');
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalRuns: 0,
    totalDistance: 0,
    totalElevation: 0,
    bestPace: null,
    avgPace: null,
    totalTimeSec: 0,
    bestTimeSec: null,
  });

  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem('rl_entries');
      const parsed = raw ? JSON.parse(raw) : [];
      const sorted = parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sorted);
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveEntry = useCallback(
    (entry) => {
      const next = [entry, ...entriesRef.current].slice(0, 200);
      entriesRef.current = next;
      try {
        localStorage.setItem('rl_entries', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setEntries(next);
    },
    []
  );

  const computeStats = useCallback((list) => {
    if (!list.length) {
      setStats({
        totalRuns: 0,
        totalDistance: 0,
        totalElevation: 0,
        bestPace: null,
        avgPace: null,
        totalTimeSec: 0,
        bestTimeSec: null,
      });
      return;
    }
    const totalRuns = list.length;
    const totalDistance = list.reduce((sum, e) => sum + Number(e.distanceKm), 0);
    const totalElevation = list.reduce((sum, e) => sum + Number(e.elevationM || 0), 0);
    const totalTimeSec = list.reduce((sum, e) => sum + (e.durationSec || 0), 0);
    const bestTimeSec = Math.min(...list.map((e) => e.durationSec || Infinity));
    const paces = list
      .map((e) => {
        if (!e.durationSec || !e.distanceKm) return null;
        return e.durationSec / e.distanceKm;
      })
      .filter((p) => Number.isFinite(p) && p > 0);
    const bestPace = paces.length ? Math.min(...paces) : null;
    const avgPace = paces.length ? paces.reduce((a, b) => a + b, 0) / paces.length : null;
    setStats({ totalRuns, totalDistance, totalElevation, bestPace, avgPace, totalTimeSec, bestTimeSec });
  }, []);

  useEffect(() => {
    computeStats(entries);
  }, [entries, computeStats]);

  const today = useCallback(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const key = 'rl_new_date';
    const stored = localStorage.getItem(key);
    if (stored) setNewDate(stored);
    else setNewDate(today());
  }, [today]);

  useEffect(() => {
    localStorage.setItem('rl_new_date', newDate);
  }, [newDate]);

  const parseDuration = (value) => {
    const parts = value.split(':').map((x) => Number(x));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return null;
  };

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatPaceFromSecPerKm = (secPerKm) => {
    if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '—';
    const total = secPerKm * 60;
    const m = Math.floor(total / 60);
    const s = Math.round(total - m * 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const validate = useCallback(() => {
    const errs = {};
    if (!newDate) errs.date = 'Date required';
    if (!newDistance || Number(newDistance) <= 0) errs.distance = 'Distance in km required';
    if (!newDuration || parseDuration(newDuration) == null || parseDuration(newDuration) <= 0)
      errs.duration = 'Duration required';
    if (newElevation && Number(newElevation) < 0) errs.elevation = 'Elevation must be 0 or more';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [newDate, newDistance, newDuration, newElevation]);

  const addEntry = useCallback(() => {
    if (!validate()) return;
    const durationSec = parseDuration(newDuration);
    const distanceKm = Number(newDistance);
    const secPerKm = Number.isFinite(durationSec) && distanceKm > 0 ? durationSec / distanceKm : null;
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: newDate,
      distanceKm: distanceKm,
      durationSec,
      elevationM: newElevation ? Number(newElevation) : 0,
      paceSecPerKm: secPerKm,
      pace: secPerKm != null ? formatPaceFromSecPerKm(secPerKm) : '—',
      surface: newSurface,
      note: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    logActivity('run', {
      date: newDate,
      distanceKm,
      durationSec,
      elevationM: entry.elevationM,
      paceSec: secPerKm,
      surface: newSurface,
      note: entry.note,
      pace: entry.pace,
    });
    saveEntry(entry);
    setNewDistance('');
    setNewDuration('');
    setNewElevation('');
    setNewNote('');
    setNewPace('');
    setErrors({});
  }, [
    newDate,
    newDistance,
    newDuration,
    newElevation,
    newSurface,
    newNote,
    validate,
    saveEntry,
  ]);

  const deleteEntry = useCallback(
    (id) => {
      const next = entriesRef.current.filter((e) => e.id !== id);
      entriesRef.current = next;
      try {
        localStorage.setItem('rl_entries', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setEntries(next);
    },
    []
  );

  const filtered =
    filter === 'all'
      ? entries
      : filter === 'recent'
        ? entries.slice(0, 10)
        : entries.filter((e) => e.surface === filter);

  const sortedForGraph = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const paceSeries = sortedForGraph
    .filter((e) => e.paceSecPerKm != null && e.paceSecPerKm > 0)
    .map((e) => ({
      date: new Date(e.date),
      paceSec: e.paceSecPerKm,
    }));

  const elevationSeries = sortedForGraph
    .filter((e) => Number(e.elevationM) > 0)
    .map((e) => ({
      date: new Date(e.date),
      elevation: Number(e.elevationM),
    }));

  const paceChart = paceSeries.length
    ? (() => {
        const min = Math.min(...paceSeries.map((p) => p.paceSec));
        const max = Math.max(...paceSeries.map((p) => p.paceSec));
        const range = max - min || 1;
        const W = 320;
        const H = 120;
        const pts = paceSeries.map((p, i) => {
          const x = W * (i / Math.max(1, paceSeries.length - 1));
          const y = H - ((p.paceSec - min) / range) * (H - 16) - 8;
          return `${x},${y}`;
        });
        return {
          W,
          H,
          pts,
          min,
          max,
          range,
          points: paceSeries.map((p, i) => ({
            x: W * (i / Math.max(1, paceSeries.length - 1)),
            y: H - ((p.paceSec - min) / range) * (H - 16) - 8,
            paceSec: p.paceSec,
            date: p.date,
          })),
        };
      })()
    : null;

  const elevationChart = elevationSeries.length
    ? (() => {
        const min = Math.min(...elevationSeries.map((e) => e.elevation));
        const max = Math.max(...elevationSeries.map((e) => e.elevation));
        const range = max - min || 1;
        const W = 320;
        const H = 120;
        const pts = elevationSeries.map((e, i) => {
          const x = W * (i / Math.max(1, elevationSeries.length - 1));
          const y = H - ((e.elevation - min) / range) * (H - 16) - 8;
          return `${x},${y}`;
        });
        return {
          W,
          H,
          pts,
          min,
          max,
          points: elevationSeries.map((e, i) => ({
            x: W * (i / Math.max(1, elevationSeries.length - 1)),
            y: H - ((e.elevation - min) / range) * (H - 16) - 8,
            elevation: e.elevation,
            date: e.date,
          })),
        };
      })()
    : null;

  const paceFromDistanceAndDuration = useCallback(
    (distance, durationSec, unit) => {
      if (!distance || !durationSec || distance <= 0) return null;
      const secPerKm = durationSec / distance;
      const secPerMi = secPerKm * 1.609344;
      const secPerUnit = unit === 'min/mi' ? secPerMi : secPerKm;
      const total = secPerUnit * 60;
      const m = Math.floor(total / 60);
      const s = Math.round(total - m * 60);
      return `${m}:${String(s).padStart(2, '0')}`;
    },
    []
  );

  const computedPace = paceFromDistanceAndDuration(Number(newDistance), parseDuration(newDuration), newUnit);
  useEffect(() => {
    if (computedPace) setNewPace(computedPace);
  }, [computedPace]);

  const paceUnitLabel = newUnit === 'min/km' ? 'min/km' : 'min/mi';
  const paceValue = newPace || computedPace || '—';

  const surfaceForFilter =
    filter === 'all' || filter === 'recent'
      ? 'All'
      : filter === 'road'
        ? 'Road'
        : filter === 'trail'
          ? 'Trail'
          : filter === 'track'
            ? 'Track'
            : filter === 'treadmill'
              ? 'Treadmill'
              : filter === 'treadmill-incline'
                ? 'Treadmill (incline)'
                : 'All';

  return (
    <div className="rl-root">
      <header className="rl-header">
        <button className="rl-back" onClick={() => navigate(-1)} aria-label="Back">
          <FiArrowLeft size={16} />
        </button>
        <span className="rl-phrase">Run Log</span>

        <div className="rl-header-group">
          <Dropdown
            options={[
              { value: 'all', label: 'All runs' },
              { value: 'recent', label: 'Recent' },
              { value: 'road', label: 'Road' },
              { value: 'trail', label: 'Trail' },
              { value: 'track', label: 'Track' },
              { value: 'treadmill', label: 'Treadmill' },
            ]}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter"
            tone="dark"
            size="sm"
          />
        </div>
      </header>

      <main className="rl-stage">
        <div className="rl-form">
          <div className="rl-field">
            <label className="rl-label">Date</label>
            <input
              className="rl-input"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              max={today()}
            />
          </div>
          <div className="rl-field">
            <label className="rl-label">Distance (km)</label>
            <input
              className={`rl-input ${errors.distance ? 'rl-input-error' : ''}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5.2"
              value={newDistance}
              onChange={(e) => setNewDistance(e.target.value)}
            />
            {errors.distance && <div className="rl-error">{errors.distance}</div>}
          </div>

          <div className="rl-field rl-full" style={{ gridColumn: '1 / -1' }}>
            <div className="rl-field" style={{ gridColumn: '1 / 2' }}>
              <label className="rl-label">Duration</label>
              <input
                className={`rl-input ${errors.duration ? 'rl-input-error' : ''}`}
                type="text"
                inputMode="numeric"
                placeholder="HH:MM:SS or MM:SS"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
              />
              {errors.duration && <div className="rl-error">{errors.duration}</div>}
            </div>
            <div className="rl-field" style={{ gridColumn: '2 / 3' }}>
              <label className="rl-label">Surface</label>
              <Dropdown
                options={surfaceOptions}
                value={newSurface}
                onChange={setNewSurface}
                ariaLabel="Surface"
              />
            </div>
          </div>

          <div className="rl-field">
            <label className="rl-label">Elevation gain (m)</label>
            <input
              className={`rl-input ${errors.elevation ? 'rl-input-error' : ''}`}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={newElevation}
              onChange={(e) => setNewElevation(e.target.value)}
            />
            {errors.elevation && <div className="rl-error">{errors.elevation}</div>}
          </div>

          <div className="rl-field">
            <label className="rl-label">Pace ({paceUnitLabel})</label>
            <input className="rl-input" type="text" inputMode="numeric" placeholder="Auto from distance + duration" value={paceValue} readOnly />
          </div>
        </div>

        <textarea
          className="rl-input rl-full"
          rows={2}
          placeholder="Note (optional)"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{
            resize: 'vertical',
            minHeight: '56px',
            gridColumn: '1 / -1',
          }}
        />

        <div className="rl-actions">
          <button className="rl-btn rl-primary" onClick={addEntry}>
            <FiPlus size={14} /> Log run
          </button>
        </div>
      </main>

      <div className="rl-log-wrap">
        <p className="rl-log-h">Stats</p>
        <div className="rl-stats-grid">
          <div className="rl-stat">
            <span className="rl-stat-label">Total runs</span>
            <span className="rl-stat-value">{stats.totalRuns}</span>
            <span className="rl-stat-sub">logged</span>
          </div>
          <div className="rl-stat">
            <span className="rl-stat-label">Total distance</span>
            <span className="rl-stat-value">{stats.totalDistance.toFixed(1)}</span>
            <span className="rl-stat-sub">km</span>
          </div>
          <div className="rl-stat">
            <span className="rl-stat-label">Total elevation</span>
            <span className="rl-stat-value">{stats.totalElevation.toLocaleString()}</span>
            <span className="rl-stat-sub">m</span>
          </div>
          <div className="rl-stat">
            <span className="rl-stat-label">Best pace</span>
            <span className="rl-stat-value">
              {stats.bestPace != null ? formatPaceFromSecPerKm(stats.bestPace) : '—'}
            </span>
            <span className="rl-stat-sub">{paceUnitLabel}</span>
          </div>
          <div className="rl-stat">
            <span className="rl-stat-label">Avg pace</span>
            <span className="rl-stat-value">
              {stats.avgPace != null ? formatPaceFromSecPerKm(stats.avgPace) : '—'}
            </span>
            <span className="rl-stat-sub">{paceUnitLabel}</span>
          </div>
          <div className="rl-stat">
            <span className="rl-stat-label">Total time</span>
            <span className="rl-stat-value">{formatDuration(stats.totalTimeSec)}</span>
            <span className="rl-stat-sub">h:mm:ss</span>
          </div>
        </div>

        <p className="rl-log-h">
          {filter === 'all'
            ? 'All runs'
            : filter === 'recent'
              ? 'Recent runs'
              : `Surface · ${surfaceForFilter}`}
        </p>
        {filtered.length === 0 ? (
          <div className="rl-empty">
            {filter === 'all' ? 'No runs logged yet. Add your first run above.' : 'No runs match this view.'}
          </div>
        ) : (
          <table className="rl-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Date</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Elevation</th>
                <th>Pace</th>
                <th style={{ width: '110px' }}>Surface</th>
                <th style={{ width: '180px' }}>Note</th>
                <th style={{ width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="rl-num">{e.date}</td>
                  <td className="rl-num">{Number(e.distanceKm).toFixed(2)} km</td>
                  <td className="rl-num">{formatDuration(e.durationSec)}</td>
                  <td className="rl-num">{Number(e.elevationM || 0).toLocaleString()} m</td>
                  <td className="rl-num">{e.pace || '—'} {paceUnitLabel}</td>
                  <td>
                    <span className="rl-switch rl-on" style={{ cursor: 'default' }}>
                      {surfaceOptions.find((s) => s.value === e.surface)?.label || e.surface}
                    </span>
                  </td>
                  <td className="rl-note">{e.note || '—'}</td>
                  <td className="rl-actions-cell">
                    <button className="rl-switch rl-danger" onClick={() => deleteEntry(e.id)}>
                      <FiTrash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rl-stats">
        <div>
          <p className="rl-stats-h">Charts</p>
          <div className="rl-grid-2">
            <div className="rl-graph-row">
              <p className="rl-graph-title">Pace over time</p>
              {paceChart ? (
                <div className="rl-graph-wrap">
                  <svg
                    viewBox={`0 0 ${paceChart.W} ${paceChart.H}`}
                    className="w-full h-[120px]"
                    role="img"
                    aria-label="Pace per km over recent runs"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      x2={paceChart.W}
                      y1={paceChart.H - 8}
                      y2={paceChart.H - 8}
                      stroke="#e9e9e6"
                      strokeWidth="1"
                    />
                    <polyline points={paceChart.pts.join(' ')} fill="none" stroke="#ec4899" strokeWidth="2" />
                    {paceChart.points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#ec4899" />
                    ))}
                  </svg>
                  <div className="rl-chart-legend">
                    <span>
                      <span className="rl-legend-dot" style={{ background: '#ec4899' }} />
                      Pace {paceUnitLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rl-empty-state">Add runs with distance and duration to see pace trends.</div>
              )}
            </div>

            <div className="rl-graph-row">
              <p className="rl-graph-title">Elevation per run</p>
              {elevationChart ? (
                <div className="rl-graph-wrap">
                  <svg
                    viewBox={`0 0 ${elevationChart.W} ${elevationChart.H}`}
                    className="w-full h-[120px]"
                    role="img"
                    aria-label="Elevation gain per run"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      x2={elevationChart.W}
                      y1={elevationChart.H - 8}
                      y2={elevationChart.H - 8}
                      stroke="#e9e9e6"
                      strokeWidth="1"
                    />
                    <polyline points={elevationChart.pts.join(' ')} fill="none" stroke="#60a5fa" strokeWidth="2" />
                    {elevationChart.points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#60a5fa" />
                    ))}
                  </svg>
                  <div className="rl-chart-legend">
                    <span>
                      <span className="rl-legend-dot" style={{ background: '#60a5fa' }} />
                      Elevation (m)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rl-empty-state">Log elevation gain to see this chart.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RunLog = () => {
  const ready = useAdminAuth();
  if (!ready) return null;
  return <RunLogApp />;
};

export default RunLog;
