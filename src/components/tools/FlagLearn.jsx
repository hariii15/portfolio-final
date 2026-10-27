import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiFlag, FiTrendingUp, FiTarget } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import Dropdown from '../dropdown';
import { REGIONS, FLAGS } from './flagData';
import './FlagLearn.css';

const UNIQUE_FLAGS = Array.from(new Map(FLAGS.map((flag) => [flag.code, flag])).values());

const SHUFFLED_BY_REGION = Object.fromEntries(
  REGIONS.map((region) => [
    region.value,
    UNIQUE_FLAGS.filter((flag) => region.value === 'All' || flag.region === region.value),
  ])
);

const makePool = (region) => {
  const items = SHUFFLED_BY_REGION[region] || [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return region === 'All' ? shuffled : shuffled.slice(0, Math.min(20, shuffled.length));
};


const FlagLearnApp = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState('All');
  const [mode, setMode] = useState('quiz');
  const [pool, setPool] = useState(() => makePool('All'));
  const [index, setIndex] = useState(0);
  const [ok, setOk] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missedNames, setMissedNames] = useState([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [result, setResult] = useState(null);
  const [wrongPicks, setWrongPicks] = useState([]);

  const poolRef = useRef(pool);
  const indexRef = useRef(index);
  const okRef = useRef(ok);
  const wrongRef = useRef(wrong);
  const missedRef = useRef(missedNames);
  const recordedRef = useRef(false);
  const startedRef = useRef(startedAt);
  const readyRef = useRef(false);
  const didMountRef = useRef(false);

  useEffect(() => {
    readyRef.current = true;
    return () => {
      readyRef.current = false;
    };
  }, []);

  useEffect(() => {
    poolRef.current = pool;
  }, [pool]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    okRef.current = ok;
  }, [ok]);

  useEffect(() => {
    wrongRef.current = wrong;
  }, [wrong]);

  useEffect(() => {
    missedRef.current = missedNames;
  }, [missedNames]);

  useEffect(() => {
    startedRef.current = startedAt;
  }, [startedAt]);

  const pickPool = useCallback(() => {
    const now = Date.now();
    setPool(makePool(region));
    setIndex(0);
    setOk(0);
    setWrong(0);
    setMissedNames([]);
    setResult(null);
    setWrongPicks([]);
    indexRef.current = 0;
    okRef.current = 0;
    wrongRef.current = 0;
    missedRef.current = [];
    startedRef.current = now;
    recordedRef.current = false;
    setStartedAt(now);
  }, [region]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (mode === 'quiz') pickPool();
  }, [mode, region, pickPool]);

  const finish = useCallback((overrides = {}) => {
    const started = startedRef.current || Date.now();
    const durationSec = Math.round((Date.now() - started) / 1000);
    const total = poolRef.current.length || 0;
    const finalOk = overrides.ok ?? okRef.current;

    setResult({
      region,
      ok: finalOk,
      wrong: wrongRef.current,
      missedNames: overrides.missedNames ?? missedRef.current,
      durationSec,
      total,
      accuracy: total ? Math.round((finalOk / total) * 100) : 0,
    });
    indexRef.current = total;
    setIndex(total);
  }, [region]);

  useEffect(() => {
    if (!result || recordedRef.current) return;
    recordedRef.current = true;

    const r = result;
    const total = poolRef.current.length || 0;
    const accuracy = total ? Math.round((r.ok / total) * 100) : 0;

    logActivity('flag', {
      region: r.region,
      total,
      ok: r.ok,
      wrong: r.wrong,
      accuracy,
      missedNames: r.missedNames,
      durationSec: r.durationSec,
    });
  }, [result]);

  const current = pool[index];

  const options = useMemo(() => {
    if (!current) return [];

    const distractors = UNIQUE_FLAGS.filter((flag) => flag.code !== current.code)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [...distractors, current].sort(() => Math.random() - 0.5);
  }, [current]);

  const startQuiz = useCallback(() => {
    const now = Date.now();
    recordedRef.current = false;
    indexRef.current = 0;
    okRef.current = 0;
    wrongRef.current = 0;
    missedRef.current = [];
    startedRef.current = now;
    setResult(null);
    setIndex(0);
    setOk(0);
    setWrong(0);
    setMissedNames([]);
    setWrongPicks([]);
    setStartedAt(now);
  }, []);

  const handleGuess = useCallback(
    (code) => {
      const currentItem = poolRef.current[indexRef.current];
      if (!currentItem) return;
      if (code === currentItem.code) {
        const nextOk = okRef.current + 1;
        okRef.current = nextOk;
        setOk(nextOk);
        setWrongPicks([]);
        if (indexRef.current + 1 >= poolRef.current.length) {
          finish({ ok: nextOk });
        } else {
          indexRef.current += 1;
          setIndex((i) => i + 1);
        }
        return;
      }
      const nextWrong = wrongRef.current + 1;
      wrongRef.current = nextWrong;
      setWrong(nextWrong);
      setWrongPicks((prev) => (prev.includes(code) ? prev : [...prev, code]));
    },
    [finish]
  );

  const skip = useCallback(() => {
    const currentItem = poolRef.current[indexRef.current];
    if (!currentItem) return;
    const nextMissed = [...missedRef.current, currentItem.name];
    missedRef.current = nextMissed;
    setMissedNames(nextMissed);
    setWrongPicks([]);
    if (indexRef.current + 1 >= poolRef.current.length) {
      finish({ missedNames: nextMissed });
    } else {
      indexRef.current += 1;
      setIndex((i) => i + 1);
    }
  }, [finish]);

  const poolSize = pool.length;
  const progress = poolSize ? Math.round((index / poolSize) * 100) : 0;

  const recentRuns = useRef([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const key = 'fl_recent';
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      recentRuns.current = parsed.slice(0, 8);
      setRecent(parsed.slice(0, 8));
    } catch {
      recentRuns.current = [];
      setRecent([]);
    }
  }, []);

  const saveRecent = useCallback(
    (entry) => {
      const next = [{ ...entry, at: new Date().toISOString() }, ...recentRuns.current].slice(0, 8);
      recentRuns.current = next;
      try {
        localStorage.setItem('fl_recent', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setRecent(next);
    },
    []
  );

  useEffect(() => {
    if (!result) return;
    saveRecent({
      region: result.region,
      total: result.total,
      ok: result.ok,
      wrong: result.wrong,
      accuracy: result.accuracy,
      durationSec: result.durationSec,
    });
  }, [result, saveRecent]);

  const allTimeBest = recentRuns.current.length ? Math.max(...recentRuns.current.map((r) => r.accuracy || 0)) : null;
  const totalAttempts = recentRuns.current.length;

  return (
    <div className="fl-root">
      <header className="fl-header">
        <button className="fl-back" onClick={() => navigate(-1)} aria-label="Back">
          <FiArrowLeft size={16} />
        </button>
        <span className="fl-phrase">Flag Learn</span>

        <div className="fl-header-group">
          <div className="fl-region-picker">
            {REGIONS.map((regionOption) => (
              <button
                key={regionOption.value}
                className={`fl-region-pill ${region === regionOption.value ? 'fl-active' : ''}`}
                onClick={() => {
                  setRegion(regionOption.value);
                  setMode('quiz');
                }}
              >
                {regionOption.label}
              </button>
            ))}
          </div>

          <Dropdown
            options={REGIONS}
            value={region}
            onChange={(value) => {
              setRegion(value);
              setMode('quiz');
            }}
            ariaLabel="Region"
            tone="dark"
            size="sm"
          />

          <button className="fl-btn fl-ghost" onClick={() => setMode('stats')}>
            Stats
          </button>
          <button className="fl-btn fl-accent" onClick={() => setMode('quiz')}>
            <FiFlag size={14} /> Quiz
          </button>
        </div>
      </header>

      {mode === 'quiz' ? (
        <main className="fl-stage" onClick={() => false} onKeyDown={() => false}>
          {poolSize === 0 ? (
            <div className="fl-empty-state">
              No flags in this region yet. Try a different region.
            </div>
          ) : !current ? (
            <div>
              <h2 className="fl-qt">Finished</h2>
              <p className="fl-qs">
                {ok}/{poolSize} correct · {wrong} wrong · {missedNames.length} skipped
              </p>
              <div className="fl-review">
                {wrong > 0 && (
                  <div className="fl-review-h">Wrong ({wrong})</div>
                )}
                {missedNames.length > 0 && (
                  <div className="fl-review-h">Missed ({missedNames.length})</div>
                )}
                {missedNames.length > 0 && (
                  <div className="fl-chips">
                    {missedNames.map((name) => (
                      <span key={name} className="fl-chip fl-miss">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                {!missedNames.length && !wrong ? (
                  <div className="fl-empty">Perfect run</div>
                ) : (
                  <div className="fl-empty">Keep practicing this region.</div>
                )}
              </div>
              <div className="fl-foot-btns">
                <button className="fl-btn fl-quiz fl-active" onClick={startQuiz}>
                  Try again
                </button>
                <button className="fl-btn fl-ghost" onClick={() => setMode('stats')}>
                  Stats
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="fl-qstats">
                <span>
                  {index + 1}/{poolSize}
                </span>
                <span>
                  <b>{ok}</b> ok · <b>{wrong}</b> wrong
                </span>
              </div>
              <div className="fl-bar-track">
                <div className="fl-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <img
                className={`fl-flag ${wrong > 0 ? 'inspection' : ''}`}
                src={`https://flagcdn.com/w320/${current.code.toLowerCase()}.png`}
                alt={`${current.name} flag`}
                loading="lazy"
              />
              <p className="fl-hint">Which country is this?</p>

              <div className="fl-options" role="group" aria-label="Choose the country">
                {options.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className={`fl-option ${wrongPicks.includes(option.code) ? 'fl-wrong' : ''}`}
                    onClick={() => handleGuess(option.code)}
                    disabled={wrongPicks.includes(option.code)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {current && (
            <footer className="fl-footer">
              <div className="fl-foot-btns">
                <button className="fl-btn" onClick={skip}>
                  Skip
                </button>
              </div>
              <div className="fl-foot-btns">
                <button className="fl-btn fl-ghost" onClick={() => setMode('stats')}>
                  Stats
                </button>
                <button className="fl-btn fl-quiz" onClick={startQuiz}>
                  Restart
                </button>
              </div>
            </footer>
          )}
        </main>
      ) : (
        <main className="fl-stats">
          <div>
            <p className="fl-stats-h">All-time best</p>
            <div className="fl-stats-grid">
              <div className="fl-stat">
                <span className="fl-stat-label">Best accuracy</span>
                <span className="fl-stat-value">
                  {allTimeBest != null ? `${allTimeBest}%` : '—'}
                </span>
                <span className="fl-stat-sub">
                  {allTimeBest != null && allTimeBest >= 90 ? 'Excellent' : allTimeBest != null && allTimeBest >= 60 ? 'Getting there' : 'Keep going'}
                </span>
              </div>
              <div className="fl-stat">
                <span className="fl-stat-label">Attempts</span>
                <span className="fl-stat-value">{totalAttempts}</span>
                <span className="fl-stat-sub">flag quizzes</span>
              </div>
              <div className="fl-stat">
                <span className="fl-stat-label">Regions</span>
                <span className="fl-stat-value">
                  {new Set(recent.map((r) => r.region)).size}
                </span>
                <span className="fl-stat-sub">tried</span>
              </div>
            </div>
          </div>

          <div>
            <p className="fl-stats-h">Last attempts</p>
            {recent.length === 0 ? (
              <div className="fl-empty-state">No quizzes yet. Start a flag quiz to see your history here.</div>
            ) : (
              <div className="fl-stats-grid">
                {recent.map((run, i) => (
                  <div key={i} className="fl-stat">
                    <span className="fl-stat-label">{run.region}</span>
                    <span className="fl-stat-value">{run.accuracy}%</span>
                    <span className="fl-stat-sub">
                      {run.ok}/{run.total || '?'} · {run.durationSec}s
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="fl-stats-h">Accuracy over time</p>
            {recent.length === 0 ? (
              <div className="fl-empty-state">Complete a few quizzes and this chart will fill in.</div>
            ) : (
              <div>
                <div className="fl-graph-wrap">
                  <svg
                    viewBox="0 0 480 120"
                    className="w-full h-[120px]"
                    role="img"
                    aria-label="Flag quiz accuracy over recent attempts"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="flGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line
                      x1="40"
                      x2="440"
                      y1="100"
                      y2="100"
                      stroke="#e9e9e6"
                      strokeWidth="1"
                    />
                    {recent.map((run, i) => {
                      const cx = 40 + (i / Math.max(1, recent.length - 1)) * 400;
                      const cy = 100 - (run.accuracy / 100) * 80;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="5" fill="#ec4899" />
                          <text
                            x={cx}
                            y={cy - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6f6e69"
                          >
                            {run.accuracy}%
                          </text>
                        </g>
                      );
                    })}
                    <text
                      x="40"
                      y="116"
                      fontSize="10"
                      fill="#9b9a93"
                    >
                      first attempt
                    </text>
                    <text
                      x="440"
                      y="116"
                      textAnchor="end"
                      fontSize="10"
                      fill="#9b9a93"
                    >
                      latest
                    </text>
                  </svg>
                </div>
                <div className="fl-chart-legend">
                  <span>
                    <span className="fl-legend-dot" style={{ background: '#ec4899' }} />
                    Accuracy
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

const FlagLearn = () => {
  const ready = useAdminAuth();
  if (!ready) return null;
  return <FlagLearnApp />;
};

export default FlagLearn;
