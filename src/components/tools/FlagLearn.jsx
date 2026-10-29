import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiFlag, FiTrendingUp } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import Dropdown from '../dropdown';
import { REGIONS, FLAGS } from './flagData';
import './FlagLearn.css';

const UNIQUE_FLAGS = Array.from(new Map(FLAGS.map((flag) => [flag.code, flag])).values());

const FLAGS_BY_REGION = Object.fromEntries(
  REGIONS.map((region) => [
    region.value,
    UNIQUE_FLAGS.filter((flag) => region.value === 'All' || flag.region === region.value),
  ])
);

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const DEFAULT_LENGTH = '20';

const makePool = (region, length = DEFAULT_LENGTH) => {
  const shuffled = shuffle(FLAGS_BY_REGION[region] || []);
  if (length === 'all') return shuffled;
  const size = Number(length) || Number(DEFAULT_LENGTH);
  return shuffled.slice(0, Math.min(size, shuffled.length));
};

// Pick distractors from the same region first (then same continent), so options
// are plausible lookalikes instead of obviously unrelated countries.
const pickDistractors = (current, count = 3) => {
  const others = UNIQUE_FLAGS.filter((flag) => flag.code !== current.code);
  const tiers = [
    others.filter((flag) => flag.region === current.region),
    others.filter((flag) => flag.cont === current.cont),
    others,
  ];

  const picked = [];
  const seen = new Set();
  for (const tier of tiers) {
    for (const flag of shuffle(tier)) {
      if (picked.length >= count) break;
      if (seen.has(flag.code)) continue;
      seen.add(flag.code);
      picked.push(flag);
    }
    if (picked.length >= count) break;
  }
  return picked;
};

const MODES = [
  { value: 'learn', label: 'Learn', icon: FiBookOpen },
  { value: 'quiz', label: 'Quiz', icon: FiFlag },
  { value: 'stats', label: 'Stats', icon: FiTrendingUp },
];

const FlagLearnApp = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState('All');
  const [mode, setMode] = useState('learn');
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [pool, setPool] = useState(() => makePool('All', DEFAULT_LENGTH));
  const [index, setIndex] = useState(0);
  const [ok, setOk] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [wrongNames, setWrongNames] = useState([]);
  const [missedNames, setMissedNames] = useState([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [result, setResult] = useState(null);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [hideNames, setHideNames] = useState(false);
  const [revealed, setRevealed] = useState([]);

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
    const nextPool = makePool(region, length);
    poolRef.current = nextPool;
    setPool(nextPool);
    setIndex(0);
    setOk(0);
    setWrong(0);
    setWrongNames([]);
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
  }, [region, length]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (mode === 'quiz') pickPool();
  }, [mode, pickPool]);

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

    const distractors = pickDistractors(current);

    return shuffle([...distractors, current]);
  }, [current]);

  const startQuiz = useCallback(() => {
    pickPool();
  }, [pickPool]);

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
      setWrongNames((prev) => (prev.includes(currentItem.name) ? prev : [...prev, currentItem.name]));
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

  const saveRecent = useCallback((entry) => {
    const next = [{ ...entry, at: new Date().toISOString() }, ...recentRuns.current].slice(0, 8);
    recentRuns.current = next;
    try {
      localStorage.setItem('fl_recent', JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setRecent(next);
  }, []);

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

  const allTimeBest = recentRuns.current.length
    ? Math.max(...recentRuns.current.map((r) => r.accuracy || 0))
    : null;
  const totalAttempts = recentRuns.current.length;

  const learnFlags = useMemo(
    () => [...(FLAGS_BY_REGION[region] || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [region]
  );

  const regionLabel = region === 'All' ? 'All flags' : region;

  const regionTotal = (FLAGS_BY_REGION[region] || []).length;
  const lengthChoices = useMemo(
    () => [
      { value: '10', label: '10', title: '10 flags this round' },
      { value: '20', label: '20', title: '20 flags this round' },
      { value: 'all', label: `All ${regionTotal}`, title: `All ${regionTotal} flags this round` },
    ],
    [regionTotal]
  );

  const reviewNames = useMemo(
    () => Array.from(new Set([...wrongNames, ...missedNames])),
    [wrongNames, missedNames]
  );

  const toggleHideNames = () => {
    setHideNames((prev) => !prev);
    setRevealed([]);
  };

  const toggleReveal = useCallback((code) => {
    setRevealed((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  }, []);

  return (
    <div className="fl-root">
      <header className="fl-header">
        <div className="fl-header-inner">
          <div className="fl-brand">
            <button className="fl-back" onClick={() => navigate(-1)} aria-label="Back to dashboard">
              <FiArrowLeft size={16} />
            </button>
            <div className="fl-brand-text">
              <span className="fl-brand-title">Flag Learn</span>
              <span className="fl-brand-sub">Study and quiz world flags</span>
            </div>
          </div>

          <div className="fl-tabs" role="tablist" aria-label="Flag Learn mode">
            {MODES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={mode === item.value}
                  className={`fl-tab ${mode === item.value ? 'is-active' : ''}`}
                  onClick={() => setMode(item.value)}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="fl-header-region">
            {mode === 'quiz' && (
              <div className="fl-length" role="group" aria-label="Flags per round">
                <span className="fl-length-label">Flags</span>
                {lengthChoices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    title={choice.title}
                    className={`fl-length-btn ${length === choice.value ? 'is-active' : ''}`}
                    onClick={() => setLength(choice.value)}
                    aria-pressed={length === choice.value}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            )}
            <Dropdown
              options={REGIONS}
              value={region}
              onChange={setRegion}
              ariaLabel="Filter flags by region"
              size="sm"
              className="fl-region-select"
            />
          </div>
        </div>
      </header>

      <main className="fl-main">
        {mode === 'learn' && (
          <section className="fl-container fl-learn">
            <div className="fl-learn-head">
              <div>
                <h1 className="fl-learn-title">{regionLabel}</h1>
                <p className="fl-learn-sub">
                  {learnFlags.length} {learnFlags.length === 1 ? 'flag' : 'flags'}
                  {hideNames
                    ? ' · tap a card to reveal its name'
                    : ' · flip the switch to hide names and test yourself'}
                </p>
              </div>

              <button
                type="button"
                className={`fl-switch ${hideNames ? 'is-on' : ''}`}
                onClick={toggleHideNames}
                aria-pressed={hideNames}
              >
                <span className="fl-switch-track">
                  <span className="fl-switch-thumb" />
                </span>
                Hide names
              </button>
            </div>

            {learnFlags.length === 0 ? (
              <div className="fl-empty-state">
                No flags in this region yet. Try a different region.
              </div>
            ) : (
              <div className="fl-learn-grid">
                {learnFlags.map((flag) => {
                  const isRevealed = !hideNames || revealed.includes(flag.code);
                  return (
                    <button
                      key={flag.code}
                      type="button"
                      className={`fl-card ${isRevealed ? 'is-revealed' : 'is-hidden'} ${
                        hideNames ? 'is-clickable' : ''
                      }`}
                      onClick={() => hideNames && toggleReveal(flag.code)}
                      aria-label={
                        isRevealed
                          ? `${flag.name} flag`
                          : 'Hidden flag, click to reveal the country name'
                      }
                    >
                      <img
                        className="fl-card-img"
                        src={`https://flagcdn.com/w320/${flag.code.toLowerCase()}.png`}
                        alt={isRevealed ? `${flag.name} flag` : ''}
                        loading="lazy"
                      />
                      <span className="fl-card-body">
                        <span className="fl-card-name">
                          {isRevealed ? flag.name : 'Tap to reveal'}
                        </span>
                        {isRevealed && <span className="fl-card-region">{flag.region}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {mode === 'quiz' && (
          <section className="fl-container fl-quiz">
            {poolSize === 0 ? (
              <div className="fl-empty-state">
                No flags in this region yet. Try a different region.
              </div>
            ) : result ? (
              <div className="fl-quiz-card fl-finished">
                <div className="fl-finished-head">
                  <span className="fl-finished-badge">Round complete</span>
                  <h2 className="fl-qt">{result.accuracy}% accuracy</h2>
                  <p className="fl-qs">
                    {result.ok} of {result.total} correct · {result.wrong} wrong ·{' '}
                    {result.durationSec}s
                  </p>
                </div>

                <div className="fl-finished-grid">
                  <div className="fl-mini-stat">
                    <span className="fl-mini-label">Correct</span>
                    <span className="fl-mini-value">{result.ok}</span>
                  </div>
                  <div className="fl-mini-stat">
                    <span className="fl-mini-label">Wrong</span>
                    <span className="fl-mini-value">{result.wrong}</span>
                  </div>
                  <div className="fl-mini-stat">
                    <span className="fl-mini-label">Skipped</span>
                    <span className="fl-mini-value">{missedNames.length}</span>
                  </div>
                </div>

                {reviewNames.length > 0 ? (
                  <div className="fl-review">
                    <div className="fl-review-h">Review these ({reviewNames.length})</div>
                    <div className="fl-chips">
                      {reviewNames.map((name) => (
                        <span key={name} className="fl-chip fl-miss">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="fl-empty">Perfect run — every flag nailed.</div>
                )}

                <div className="fl-finished-actions">
                  <button className="fl-btn fl-quiz" onClick={startQuiz}>
                    Play again
                  </button>
                  <button className="fl-btn fl-ghost" onClick={() => setMode('learn')}>
                    Study flags
                  </button>
                </div>
              </div>
            ) : current ? (
              <div className="fl-quiz-card">
                <div className="fl-quiz-top">
                  <span>
                    Flag {index + 1} of {poolSize}
                  </span>
                  <span>
                    <b>{ok}</b> correct · <b>{wrong}</b> wrong
                  </span>
                </div>

                <div className="fl-bar-track">
                  <div className="fl-bar-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="fl-quiz-body">
                  <img
                    className="fl-flag"
                    src={`https://flagcdn.com/w320/${current.code.toLowerCase()}.png`}
                    alt="Flag to identify"
                    loading="lazy"
                  />
                  <p className="fl-hint">Which country is this?</p>

                  <div className="fl-options" role="group" aria-label="Choose the country">
                    {options.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        className={`fl-option ${
                          wrongPicks.includes(option.code) ? 'fl-wrong' : ''
                        }`}
                        onClick={() => handleGuess(option.code)}
                        disabled={wrongPicks.includes(option.code)}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fl-quiz-actions">
                  <button className="fl-btn" onClick={skip}>
                    Skip
                  </button>
                  <button className="fl-btn fl-ghost" onClick={startQuiz}>
                    Restart
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {mode === 'stats' && (
          <section className="fl-container fl-stats">
            <div className="fl-stats-block">
              <p className="fl-stats-h">All-time best</p>
              <div className="fl-stats-grid">
                <div className="fl-stat">
                  <span className="fl-stat-label">Best accuracy</span>
                  <span className="fl-stat-value">
                    {allTimeBest != null ? `${allTimeBest}%` : '—'}
                  </span>
                  <span className="fl-stat-sub">
                    {allTimeBest != null && allTimeBest >= 90
                      ? 'Excellent'
                      : allTimeBest != null && allTimeBest >= 60
                        ? 'Getting there'
                        : 'Keep going'}
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

            <div className="fl-stats-block">
              <p className="fl-stats-h">Last attempts</p>
              {recent.length === 0 ? (
                <div className="fl-empty-state">
                  No quizzes yet. Start a flag quiz to see your history here.
                </div>
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

            <div className="fl-stats-block">
              <p className="fl-stats-h">Accuracy over time</p>
              {recent.length === 0 ? (
                <div className="fl-empty-state">
                  Complete a few quizzes and this chart will fill in.
                </div>
              ) : (
                <div>
                  <div className="fl-chart-card">
                    <svg
                      viewBox="0 0 480 120"
                      className="fl-chart"
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
                      <line x1="40" x2="440" y1="100" y2="100" stroke="#e9e9e6" strokeWidth="1" />
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
                      <text x="40" y="116" fontSize="10" fill="#9b9a93">
                        first attempt
                      </text>
                      <text x="440" y="116" textAnchor="end" fontSize="10" fill="#9b9a93">
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
          </section>
        )}
      </main>
    </div>
  );
};

const FlagLearn = () => {
  const ready = useAdminAuth();
  if (!ready) return null;
  return <FlagLearnApp />;
};

export default FlagLearn;
