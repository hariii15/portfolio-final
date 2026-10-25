import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRotateCcw } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import Dropdown from '../dropdown';
import './cube-timer.css';

const INSPECTION = 15;
const METHODS = ['CFOP', 'Beginner', 'Roux'];

const formatSolve = (seconds) => {
  if (!Number.isFinite(seconds)) return '0.00';
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const rest = seconds - m * 60;
    return `${m}:${rest.toFixed(2).padStart(5, '0')}`;
  }
  return seconds.toFixed(2);
};

const Loader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
    <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">
      Verifying session
    </p>
  </div>
);

const CubeTimerApp = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('CFOP');
  const [phase, setPhase] = useState('idle');
  const [display, setDisplay] = useState(INSPECTION);
  const [result, setResult] = useState(null);
  const [resultMethod, setResultMethod] = useState('CFOP');

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const startRef = useRef(0);
  const recordedRef = useRef(false);

  const startInspection = useCallback(() => {
    recordedRef.current = false;
    setResult(null);
    startRef.current = performance.now();
    setDisplay(INSPECTION);
    setPhase('inspection');
  }, []);

  const startSolve = useCallback(() => {
    startRef.current = performance.now();
    setDisplay(0);
    setPhase('solving');
  }, []);

  const stopSolve = useCallback(() => {
    const elapsed = Math.max(0, (performance.now() - startRef.current) / 1000);
    setDisplay(elapsed);
    setResult(elapsed);
    setResultMethod(method);
    setPhase('stopped');
  }, [method]);

  const reset = useCallback(() => {
    setPhase('idle');
    setDisplay(INSPECTION);
    setResult(null);
  }, []);

  const action = useCallback(() => {
    const p = phaseRef.current;
    if (p === 'idle') startInspection();
    else if (p === 'inspection') startSolve();
    else if (p === 'solving') stopSolve();
    else startInspection();
  }, [startInspection, startSolve, stopSolve]);

  useEffect(() => {
    if (phase !== 'inspection' && phase !== 'solving') return undefined;

    let raf;
    const tick = () => {
      const now = performance.now();
      if (phase === 'inspection') {
        const left = INSPECTION - (now - startRef.current) / 1000;
        if (left <= 0) {
          startRef.current = now;
          setDisplay(0);
          setPhase('solving');
          return;
        }
        setDisplay(left);
      } else {
        setDisplay((now - startRef.current) / 1000);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'stopped' || result == null || recordedRef.current) return;
    recordedRef.current = true;
    logActivity('cube', {
      method: resultMethod,
      durationSec: Number(result.toFixed(2)),
      inspectionSec: INSPECTION,
    });
  }, [phase, result, resultMethod]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      const tag = e.target instanceof HTMLElement ? e.target.tagName : '';
      if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      e.preventDefault();
      action();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [action]);

  const busy = phase === 'inspection' || phase === 'solving';
  const phaseLabel =
    phase === 'inspection'
      ? 'inspection'
      : phase === 'solving'
      ? 'solving'
      : phase === 'stopped'
      ? `solved · ${resultMethod}`
      : 'inspection timer';

  const timerValue =
    phase === 'idle'
      ? String(INSPECTION)
      : phase === 'inspection'
      ? String(Math.ceil(display))
      : formatSolve(result == null ? display : result);

  return (
    <div className="cube-root">
      <header className="cube-header">
        <button
          className="cube-back"
          onClick={() => navigate('/admin/dashboard')}
          title="Back to dashboard"
          aria-label="Back to dashboard"
        >
          <FiArrowLeft size={16} />
        </button>

        <h1 className="cube-title">Cube Timer</h1>

        <div className="cube-controls">
          <Dropdown
            className="w-[132px]"
            size="sm"
            tone="dark"
            value={method}
            onChange={setMethod}
            disabled={busy}
            ariaLabel="Solving method"
            options={METHODS.map((m) => ({ value: m, label: m }))}
          />

          <button className="cube-reset" onClick={reset} title="Reset timer" aria-label="Reset timer">
            <FiRotateCcw size={15} />
          </button>
        </div>
      </header>

      <div
        className="cube-stage"
        role="button"
        tabIndex={0}
        onClick={action}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            action();
          }
        }}
        aria-label="Start, stop, or continue the cube timer"
      >
        <span className={`cube-phase ${phase}`}>{phaseLabel}</span>
        <span className={`cube-time ${phase}`}>{timerValue}</span>
        <span className="cube-hint">
          {phase === 'idle' && 'Press space or tap to start 15s inspection'}
          {phase === 'inspection' && 'Press space or tap to start the solve'}
          {phase === 'solving' && 'Press space or tap to stop'}
          {phase === 'stopped' && 'Press space or tap for the next solve'}
        </span>
      </div>

      <footer className="cube-footer">
        <span>space / tap: {phase === 'solving' ? 'stop' : phase === 'stopped' ? 'next' : 'start'}</span>
        <span>{method}</span>
      </footer>
    </div>
  );
};

const CubeTimer = () => {
  const ready = useAdminAuth();
  if (!ready) return <Loader />;
  return <CubeTimerApp />;
};

export default CubeTimer;
