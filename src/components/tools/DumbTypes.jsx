import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import usePrToast from './usePrToast';
import PrToast from './PrToast';
import './dumb-types.css';

const BASE_WORDS = (
  'the of and to in a is you that it he was for on are as with his they i at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should world high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later miss idea enough eat face watch far really almost let above girl sometimes mountain cut young talk soon list song being leave family'
).split(/\s+/);

const genWords = (count, punctuation, numbers) => {
  const out = [];
  for (let i = 0; i < count; i++) {
    let word = BASE_WORDS[Math.floor(Math.random() * BASE_WORDS.length)];

    if (numbers && Math.random() < 0.09) {
      word = String(Math.floor(Math.random() * 1000));
    } else if (punctuation) {
      if (Math.random() < 0.2) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      const r = Math.random();
      if (r < 0.08) word += ',';
      else if (r < 0.16) word += '.';
      else if (r < 0.18) word += '?';
      else if (r < 0.2) word += '!';
      else if (r < 0.22) word += ';';

      const q = Math.random();
      if (q < 0.03) word = '"' + word + '"';
      else if (q < 0.05) word = "'" + word + "'";
    }

    out.push(word);
  }
  return out;
};

const modeLabel = (mode, value) => (mode === 'time' ? `time ${value}` : `words ${value}`);

const formatTime = (seconds) => {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return s + 's';
  return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
};

const computeStats = (s) => {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  const limit = Math.min(s.wordIndex, s.words.length - 1);

  for (let i = 0; i <= limit; i++) {
    const target = s.words[i] || '';
    const typed = s.inputs[i] || '';

    if (!typed) {
      if (i < s.wordIndex || s.finished) missed += target.length;
      continue;
    }

    const max = Math.max(target.length, typed.length);
    for (let j = 0; j < max; j++) {
      if (j >= typed.length) {
        if (i < s.wordIndex || s.finished) missed++;
      } else if (j >= target.length) {
        incorrect++;
        extra++;
      } else if (typed.charAt(j) === target.charAt(j)) {
        correct++;
      } else {
        incorrect++;
      }
    }
  }

  return { correct, incorrect, extra, missed };
};

const buildState = (mode, value, punctuation, numbers) => {
  const words = genWords(mode === 'time' ? 150 : value, punctuation, numbers);
  return {
    mode,
    value,
    punctuation,
    numbers,
    words,
    inputs: words.map(() => ''),
    wordIndex: 0,
    running: false,
    finished: false,
    startTime: 0,
    totalKeys: 0,
    errorKeys: 0,
    elapsed: 0,
    samples: [],
    result: null,
  };
};

const finishState = (s, now) => {
  const elapsed = s.mode === 'time' ? s.value : Math.max(0.1, (now - s.startTime) / 1000);
  const stats = computeStats({ ...s, finished: true });
  const minutes = Math.max(elapsed / 60, 1 / 6000);
  const spaces = Math.min(s.wordIndex, s.words.length - 1);
  const correctChars = stats.correct + spaces;
  const wpm = Math.round(correctChars / 5 / minutes);
  const raw = Math.round(s.totalKeys / 5 / minutes);
  const acc = s.totalKeys
    ? Math.round(((s.totalKeys - s.errorKeys) / s.totalKeys) * 100)
    : 100;

  const samples = s.samples.slice();
  const last = samples[samples.length - 1];
  if (!last || elapsed - last.t > 0.05) {
    samples.push({ t: Math.round(elapsed * 10) / 10, wpm, raw, errors: stats.incorrect });
  }

  return {
    ...s,
    running: false,
    finished: true,
    elapsed,
    result: {
      wpm,
      acc,
      raw,
      chars: `${stats.correct}/${stats.incorrect}/${stats.extra}/${stats.missed}`,
      time: formatTime(elapsed),
      mode: modeLabel(s.mode, s.value),
      modeName: s.mode,
      value: s.value,
      durationSec: Math.round(elapsed * 10) / 10,
      samples,
    },
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CONFIG':
      return buildState(action.mode, action.value, action.punctuation, action.numbers);

    case 'RESTART':
      return buildState(state.mode, state.value, state.punctuation, state.numbers);

    case 'CHAR': {
      if (state.finished) return state;
      const s = state.running ? state : { ...state, running: true, startTime: action.now };
      const i = s.wordIndex;
      const target = s.words[i];
      if (!target) return s;
      const typed = s.inputs[i] || '';
      if (typed.length >= target.length + 12) return s;

      const expected = target.charAt(typed.length);
      const totalKeys = s.totalKeys + 1;
      const errorKeys = s.errorKeys + (action.char !== expected ? 1 : 0);
      const inputs = s.inputs.slice();
      inputs[i] = typed + action.char;

      const next = { ...s, inputs, totalKeys, errorKeys };
      if (s.mode === 'words' && i === s.words.length - 1 && inputs[i] === target) {
        return finishState(next, action.now);
      }
      return next;
    }

    case 'SPACE': {
      if (state.finished) return state;
      const i = state.wordIndex;
      const typed = state.inputs[i] || '';
      if (!typed) return state;

      const s = state.running ? state : { ...state, running: true, startTime: action.now };
      const totalKeys = s.totalKeys + 1;

      if (s.mode === 'words' && i === s.words.length - 1) {
        return finishState({ ...s, totalKeys }, action.now);
      }

      const wordIndex = i + 1;
      let inputs = s.inputs;
      if (inputs[wordIndex]) {
        inputs = inputs.slice();
        inputs[wordIndex] = '';
      }

      let words = s.words;
      let nextInputs = inputs;
      if (s.mode === 'time' && words.length - wordIndex < 40) {
        const extra = genWords(80, s.punctuation, s.numbers);
        words = [...words, ...extra];
        nextInputs = [...inputs, ...extra.map(() => '')];
      }

      return { ...s, running: true, wordIndex, words, inputs: nextInputs, totalKeys };
    }

    case 'BACKSPACE': {
      if (state.finished || !state.running) return state;
      const i = state.wordIndex;
      const typed = state.inputs[i] || '';
      const inputs = state.inputs.slice();

      if (typed.length) {
        inputs[i] = typed.slice(0, -1);
        return { ...state, inputs };
      }
      if (i > 0) {
        for (let k = i; k < state.words.length; k++) inputs[k] = '';
        return { ...state, wordIndex: i - 1, inputs };
      }
      return state;
    }

    case 'TICK': {
      if (!state.running || state.finished) return state;
      const elapsed = (action.now - state.startTime) / 1000;
      if (state.mode === 'time' && state.value - elapsed <= 0) {
        return finishState(state, action.now);
      }

      let samples = state.samples;
      const second = Math.floor(elapsed);
      if (second > Math.floor(state.elapsed)) {
        const stats = computeStats(state);
        const spaces = Math.min(state.wordIndex, state.words.length - 1);
        const minutes = Math.max(elapsed / 60, 1 / 6000);
        samples = [
          ...samples,
          {
            t: second,
            wpm: Math.round((stats.correct + spaces) / 5 / minutes),
            raw: Math.round(state.totalKeys / 5 / minutes),
            errors: stats.incorrect,
          },
        ];
      }
      return { ...state, elapsed, samples };
    }

    default:
      return state;
  }
};

const TypingChart = ({ samples = [] }) => {
  const points = [];
  const source = [{ t: 0, wpm: 0, raw: 0 }, ...samples];
  source.forEach((p) => {
    if (!Number.isFinite(p.t)) return;
    if (points.length && p.t <= points[points.length - 1].t) return;
    points.push(p);
  });
  if (points.length < 2) return null;

  const W = 900;
  const H = 320;
  const padL = 52;
  const padR = 26;
  const padT = 28;
  const padB = 46;
  const last = points[points.length - 1];
  const maxT = Math.max(1, last.t);
  const maxY = Math.max(20, ...points.map((p) => Math.max(p.wpm, p.raw))) * 1.18;
  const wpmPoints = points.filter((p) => p.t > 0 && p.wpm > 0);
  const avg = wpmPoints.length
    ? Math.round(wpmPoints.reduce((sum, p) => sum + p.wpm, 0) / wpmPoints.length)
    : 0;
  const peak = wpmPoints.length ? Math.max(...wpmPoints.map((p) => p.wpm)) : 0;
  const x = (t) => padL + (t / maxT) * (W - padL - padR);
  const y = (v) => H - padB - (v / maxY) * (H - padT - padB);
  const line = (key) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');
  const area = `${line('wpm')} L ${x(maxT).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(
    1
  )} ${y(0).toFixed(1)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="dt-chart">
      <div className="dt-chart-head">
        <div>
          <span className="dt-chart-title">Speed curve</span>
          <p className="dt-chart-sub">
            Words per minute through the run. Raw counts every keystroke.
          </p>
        </div>
        <div className="dt-chart-legend">
          <span>
            <i className="wpm" /> wpm
          </span>
          <span>
            <i className="raw" /> raw
          </span>
          <span>
            <i className="avg" /> avg
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Words per minute over time">
        {ticks.map((f) => (
          <g key={f}>
            <line x1={padL} x2={W - padR} y1={y(maxY * f)} y2={y(maxY * f)} className="dt-grid" />
            <text x={padL - 10} y={y(maxY * f) + 4} textAnchor="end" className="dt-axis">
              {Math.round(maxY * f)}
            </text>
          </g>
        ))}

        {ticks.map((f) => (
          <text
            key={`x-${f}`}
            x={x(maxT * f)}
            y={H - 14}
            textAnchor={f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}
            className="dt-axis"
          >
            {Math.round(maxT * f)}s
          </text>
        ))}

        <path d={area} className="dt-area-wpm" />

        <line x1={padL} x2={W - padR} y1={y(avg)} y2={y(avg)} className="dt-line-avg" />
        <text x={W - padR} y={y(avg) - 7} textAnchor="end" className="dt-axis dt-axis-avg">
          avg {avg}
        </text>

        <path d={line('raw')} className="dt-line-raw" />
        <path d={line('wpm')} className="dt-line-wpm" />

        <circle cx={x(last.t)} cy={y(last.wpm)} r="4" className="dt-dot-wpm">
          <title>{`${last.wpm} wpm at ${Math.round(last.t)}s`}</title>
        </circle>
        <circle cx={x(last.t)} cy={y(last.raw)} r="3" className="dt-dot-raw">
          <title>{`${last.raw} raw at ${Math.round(last.t)}s`}</title>
        </circle>
      </svg>

      <div className="dt-chart-foot">
        <span>
          <b>{peak}</b> peak wpm
        </span>
        <span>
          <b>{avg}</b> average wpm
        </span>
        <span>
          <b>{last.raw}</b> raw wpm
        </span>
      </div>
    </div>
  );
};

const Loader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
    <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">
      Verifying session
    </p>
  </div>
);

const DumbTypesApp = () => {
  const navigate = useNavigate();
  const { toast: prToast, celebrate, dismiss } = usePrToast();
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => buildState('time', 30, false, false)
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const wordsRef = useRef(null);
  const caretRef = useRef(null);
  const wordElsRef = useRef([]);
  const reportedRef = useRef(false);

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  const configure = useCallback((mode, value) => {
    const s = stateRef.current;
    dispatch({ type: 'CONFIG', mode, value, punctuation: s.punctuation, numbers: s.numbers });
  }, []);

  const toggleOption = useCallback((key) => {
    const s = stateRef.current;
    dispatch({
      type: 'CONFIG',
      mode: s.mode,
      value: s.value,
      punctuation: key === 'punctuation' ? !s.punctuation : s.punctuation,
      numbers: key === 'numbers' ? !s.numbers : s.numbers,
    });
  }, []);

  useEffect(() => {
    if (!state.running || state.finished) return undefined;
    const id = setInterval(() => {
      dispatch({ type: 'TICK', now: performance.now() });
    }, 100);
    return () => clearInterval(id);
  }, [state.running, state.finished]);

  useEffect(() => {
    if (!state.finished || !state.result) {
      reportedRef.current = false;
      return;
    }
    if (reportedRef.current) return;
    reportedRef.current = true;

    const r = state.result;
    logActivity('typing', {
      wpm: r.wpm,
      raw: r.raw,
      acc: r.acc,
      chars: r.chars,
      time: r.time,
      mode: r.modeName,
      value: r.value,
      durationSec: r.durationSec,
      samples: r.samples,
    });
    celebrate('typing', r.wpm);
  }, [state.finished, state.result, celebrate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        restart();
        return;
      }
      // On the results graph, leave the result on screen until Tab is pressed.
      if (stateRef.current.finished) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        restart();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'BACKSPACE' });
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        dispatch({ type: 'SPACE', now: performance.now() });
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        dispatch({ type: 'CHAR', char: e.key, now: performance.now() });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [restart]);

  useLayoutEffect(() => {
    const caret = caretRef.current;
    const container = wordsRef.current;
    if (!caret || !container) return;

    const wordEl = wordElsRef.current[state.wordIndex];
    const target = state.words[state.wordIndex];
    if (!wordEl || target === undefined) return;

    const typed = state.inputs[state.wordIndex] || '';
    const letters = wordEl.children;
    if (!letters.length) return;

    let left;
    let top;
    let h;
    if (typed.length < target.length) {
      const next = letters[Math.min(typed.length, letters.length - 1)];
      left = next.offsetLeft;
      top = next.offsetTop;
      h = next.offsetHeight;
    } else {
      const last = letters[letters.length - 1];
      left = last.offsetLeft + last.offsetWidth;
      top = last.offsetTop;
      h = last.offsetHeight;
    }

    const caretH = Math.max(16, Math.round(h * 0.7));
    const y = top + (h - caretH) / 2;
    caret.style.height = caretH + 'px';
    caret.style.transform = `translate(${left}px, ${y}px)`;

    const lineH = letters[0].offsetHeight || h;
    const lineIndex = Math.round(top / lineH);
    const scroll = Math.max(0, lineIndex - 1) * lineH;
    container.style.transform = scroll ? `translateY(${-scroll}px)` : 'translateY(0px)';
  }, [state]);

  const stats = computeStats(state);
  const spaces = Math.min(state.wordIndex, state.words.length - 1);
  const elapsed = Math.max(state.elapsed, 0.35);
  const liveWpm = state.running
    ? Math.round((stats.correct + spaces) / 5 / (elapsed / 60))
    : 0;
  const liveAcc = state.totalKeys
    ? Math.round(((state.totalKeys - state.errorKeys) / state.totalKeys) * 100)
    : 100;

  const timerText =
    state.mode === 'time'
      ? state.running
        ? String(Math.max(0, Math.ceil(state.value - state.elapsed)))
        : String(state.value)
      : state.running
      ? String(Math.floor(state.elapsed))
      : '0';

  const mode = modeLabel(state.mode, state.value);

  const sampleWpms = (state.result?.samples || [])
    .map((p) => Number(p.wpm))
    .filter((v) => Number.isFinite(v) && v > 0);
  const peakWpm = Math.max(state.result?.wpm || 0, ...sampleWpms);
  const avgSampleWpm = sampleWpms.length
    ? sampleWpms.reduce((sum, v) => sum + v, 0) / sampleWpms.length
    : 0;
  const consistency =
    sampleWpms.length > 1 && avgSampleWpm > 0
      ? Math.round(
          Math.max(
            0,
            Math.min(
              100,
              100 -
                (Math.sqrt(
                  sampleWpms.reduce((sum, v) => sum + (v - avgSampleWpm) ** 2, 0) /
                    sampleWpms.length
                ) /
                  avgSampleWpm) *
                  100
            )
          )
        )
      : null;

  const pillCls = (active) => `dt-pill${active ? ' active' : ''}`;

  return (
    <div className="dt-root">
      <header className="dt-topbar">
        <button
          className="dt-back"
          onClick={() => navigate('/admin/dashboard')}
          title="Back to dashboard"
          aria-label="Back to dashboard"
        >
          <FiArrowLeft size={16} />
        </button>

        <div className="dt-brand">
          <span className="dt-brand-name">Dumb Types</span>
        </div>

        <nav className="dt-config" aria-label="test settings">
          <div className="dt-group" aria-label="time mode">
            {[15, 30, 60, 120].map((v) => (
              <button
                key={v}
                className={pillCls(state.mode === 'time' && state.value === v)}
                aria-pressed={state.mode === 'time' && state.value === v}
                onClick={() => configure('time', v)}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="dt-group" aria-label="words mode">
            {[10, 25, 50, 100].map((v) => (
              <button
                key={v}
                className={pillCls(state.mode === 'words' && state.value === v)}
                aria-pressed={state.mode === 'words' && state.value === v}
                onClick={() => configure('words', v)}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="dt-group" aria-label="options">
            <button
              className={pillCls(state.punctuation)}
              aria-pressed={state.punctuation}
              onClick={() => toggleOption('punctuation')}
            >
              punctuation
            </button>
            <button
              className={pillCls(state.numbers)}
              aria-pressed={state.numbers}
              onClick={() => toggleOption('numbers')}
            >
              numbers
            </button>
          </div>
        </nav>

        <div className="dt-actions">
          <button className="dt-icon" onClick={restart} title="restart test (tab)" aria-label="restart test">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
      </header>

      <main className="dt-main">
        {!state.finished ? (
          <section className="dt-test">
            <div className="dt-meta">
              <div className="dt-meta-left">
                <div className="dt-timer">{timerText}</div>
                <div className="dt-mode">
                  <span className="dt-dot" />
                  <span>{mode}</span>
                  {!state.running && (
                    <span className="dt-hint">
                      <span className="dt-sep">/</span> start typing to begin
                    </span>
                  )}
                </div>
              </div>
              <div className="dt-meta-right">
                <div className="dt-live">
                  <span className="dt-num">{liveWpm}</span>
                  <span className="dt-unit">wpm</span>
                </div>
                <div className="dt-live">
                  <span className="dt-num">{liveAcc}%</span>
                  <span className="dt-unit">acc</span>
                </div>
              </div>
            </div>

            <div className="dt-viewport">
              <div className="dt-words" ref={wordsRef}>
                {state.words.map((target, i) => {
                  const typed = state.inputs[i] || '';
                  const max = Math.max(target.length, typed.length);
                  const letters = [];
                  for (let j = 0; j < max; j++) {
                    if (j < target.length) {
                      let cls = 'dt-letter';
                      if (j < typed.length) {
                        cls += typed.charAt(j) === target.charAt(j) ? ' correct' : ' incorrect';
                      }
                      letters.push(
                        <span key={j} className={cls}>
                          {target.charAt(j)}
                        </span>
                      );
                    } else {
                      letters.push(
                        <span key={j} className="dt-letter extra">
                          {typed.charAt(j)}
                        </span>
                      );
                    }
                  }
                  return (
                    <div
                      key={i}
                      className="dt-word"
                      ref={(el) => {
                        wordElsRef.current[i] = el;
                      }}
                    >
                      {letters}
                    </div>
                  );
                })}
                <div className={`dt-caret${state.running ? ' typing' : ''}`} ref={caretRef} />
              </div>
            </div>

            <div className="dt-restart-row">
              <button className="dt-round" onClick={restart} title="restart test (tab)" aria-label="restart test">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                  <path d="M21 3v6h-6" />
                </svg>
              </button>
            </div>
          </section>
        ) : (
          <section className="dt-results" aria-live="polite">
            <div className="dt-results-top">
              <div>
                <span className="dt-eyebrow">last run</span>
                <h2 className="dt-results-title">Typing result</h2>
                <p className="dt-results-sub">
                  {state.result?.mode ?? mode} · {state.result?.acc ?? 100}% accuracy
                </p>
              </div>

              <div className="dt-results-scores">
                <div className="dt-result-block accent">
                  <span className="dt-result-value">{state.result?.wpm ?? 0}</span>
                  <span className="dt-result-label">words per minute</span>
                </div>
                <div className="dt-result-block">
                  <span className="dt-result-value">{state.result?.acc ?? 100}%</span>
                  <span className="dt-result-label">accuracy</span>
                </div>
              </div>
            </div>

            <TypingChart samples={state.result?.samples} />

            <div className="dt-results-grid">
              <div className="dt-grid-cell">
                <span className="k">raw wpm</span>
                <span className="v">{state.result?.raw ?? 0}</span>
              </div>
              <div className="dt-grid-cell">
                <span className="k">peak wpm</span>
                <span className="v">{peakWpm}</span>
              </div>
              <div className="dt-grid-cell">
                <span className="k">consistency</span>
                <span className="v">{consistency == null ? '—' : `${consistency}%`}</span>
              </div>
              <div className="dt-grid-cell">
                <span className="k">characters</span>
                <span className="v chars">{state.result?.chars ?? '0/0/0/0'}</span>
                <span className="dt-cell-sub">correct / incorrect / extra / missed</span>
              </div>
              <div className="dt-grid-cell">
                <span className="k">time</span>
                <span className="v">{state.result?.time ?? '0s'}</span>
              </div>
              <div className="dt-grid-cell">
                <span className="k">mode</span>
                <span className="v">{state.result?.mode ?? mode}</span>
              </div>
            </div>

            <div className="dt-results-actions">
              <button className="dt-primary" onClick={restart}>
                restart test
              </button>
              <span className="dt-hint-line">
                or press <kbd>tab</kbd>
              </span>
            </div>
          </section>
        )}
      </main>

      <footer className="dt-footer">
        <div className="dt-foot-hints">
          <span>
            <kbd>tab</kbd> restart
          </span>
          <span>
            <kbd>esc</kbd> reset
          </span>
          <span>
            <kbd>backspace</kbd> fix
          </span>
        </div>
        <span className="dt-foot-brand">english</span>
      </footer>

      <PrToast toast={prToast} onClose={dismiss} />
    </div>
  );
};

const DumbTypes = () => {
  const ready = useAdminAuth();
  if (!ready) return <Loader />;
  return <DumbTypesApp />;
};

export default DumbTypes;
