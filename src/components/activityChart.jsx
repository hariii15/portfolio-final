import React from 'react';
import { FiActivity } from 'react-icons/fi';
import { SectionLabel } from './ui';

const dayStart = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const ActivityChart = ({ activities = [] }) => {
  const typing = activities.filter((a) => a.type === 'typing');
  const quizzes = activities.filter((a) => a.type === 'quiz');
  const cubes = activities.filter((a) => a.type === 'cube');

  const bestWpm = typing.reduce((max, a) => Math.max(max, Number(a.data?.wpm) || 0), 0);
  const typingAcc = typing.length
    ? Math.round(typing.reduce((sum, a) => sum + (Number(a.data?.acc) || 0), 0) / typing.length)
    : 0;
  const quizAcc = quizzes.length
    ? Math.round(quizzes.reduce((sum, a) => sum + (Number(a.data?.accuracy) || 0), 0) / quizzes.length)
    : 0;
  const bestSolve = cubes.reduce((best, a) => {
    const v = Number(a.data?.durationSec);
    return Number.isFinite(v) && v > 0 ? Math.min(best, v) : best;
  }, Infinity);

  const total = activities.length;
  const days = 14;
  const today = dayStart(new Date());
  const buckets = Array.from({ length: days }, (_, i) => ({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i)),
    typing: 0,
    quiz: 0,
    cube: 0,
  }));
  const index = new Map(buckets.map((b, i) => [b.date.getTime(), i]));

  activities.forEach((a) => {
    const d = dayStart(a.createdAt);
    if (!d) return;
    const i = index.get(d.getTime());
    if (i === undefined) return;
    if (a.type === 'typing') buckets[i].typing += 1;
    else if (a.type === 'quiz') buckets[i].quiz += 1;
    else if (a.type === 'cube') buckets[i].cube += 1;
  });

  const max = Math.max(2, ...buckets.map((b) => b.typing + b.quiz + b.cube));

  const W = 720;
  const H = 190;
  const padL = 26;
  const padR = 6;
  const padT = 10;
  const padB = 24;
  const slot = (W - padL - padR) / days;
  const barW = slot * 0.56;
  const y = (v) => H - padB - (v / max) * (H - padT - padB);

  const summary = [
    { label: 'sessions', value: total },
    { label: 'typing tests', value: typing.length },
    { label: 'quizzes', value: quizzes.length },
    { label: 'cube solves', value: cubes.length },
    { label: 'best wpm', value: bestWpm },
    { label: 'typing acc', value: `${typingAcc}%` },
    { label: 'quiz acc', value: `${quizAcc}%` },
    { label: 'best solve', value: Number.isFinite(bestSolve) ? `${bestSolve.toFixed(2)}s` : '—' },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Activity</SectionLabel>
          <p className="mt-1 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
            Every completed quiz, typing test, and cube solve.
          </p>
        </div>
        <div className="hidden items-center gap-4 pt-1 text-[11px] text-[#6F6E69] dark:text-[#A1A1A1] sm:flex">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-0.5 w-3 rounded-full bg-[#EC4899]" /> typing
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-0.5 w-3 rounded-full bg-[#111111] dark:bg-[#EDEDED]" /> quiz
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-0.5 w-3 rounded-full bg-[#9B9A93] dark:bg-[#6E6E6E]" /> cube
          </span>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-apple border border-dashed border-[#E9E9E6] py-10 text-center dark:border-[#232323]">
          <FiActivity size={22} className="text-[#9B9A93] dark:text-[#6E6E6E]" />
          <p className="mt-3 text-[13px] font-semibold">No activity yet</p>
          <p className="mt-1 text-[12.5px] text-[#6F6E69] dark:text-[#A1A1A1]">
            Finish a quiz, typing test, or cube solve to start the graph.
          </p>
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-5 h-auto w-full"
            role="img"
            aria-label="Completed activity over the last 14 days"
          >
            {[0, 0.5, 1].map((f) => (
              <g key={f}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y(max * f)}
                  y2={y(max * f)}
                  stroke="currentColor"
                  className="text-[#E9E9E6] dark:text-[#232323]"
                  strokeWidth="1"
                />
                <text
                  x={padL - 6}
                  y={y(max * f) + 3}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-[#9B9A93] dark:text-[#6E6E6E]"
                  fontSize="9"
                >
                  {Math.round(max * f)}
                </text>
              </g>
            ))}
            {buckets.map((b, i) => {
              const x = padL + i * slot + (slot - barW) / 2;
              const tH = (b.typing / max) * (H - padT - padB);
              const qH = (b.quiz / max) * (H - padT - padB);
              const cH = (b.cube / max) * (H - padT - padB);
              return (
                <g key={b.date.toISOString()}>
                  <title>{`${b.date.toLocaleDateString()} · ${b.typing} typing · ${b.quiz} quiz · ${b.cube} cube`}</title>
                  {b.typing > 0 && (
                    <rect x={x} y={y(b.typing)} width={barW} height={tH} rx="1.5" fill="#EC4899" />
                  )}
                  {b.quiz > 0 && (
                    <rect
                      x={x}
                      y={y(b.typing + b.quiz)}
                      width={barW}
                      height={qH}
                      rx="1.5"
                      fill="currentColor"
                      className="text-[#111111] dark:text-[#EDEDED]"
                    />
                  )}
                  {b.cube > 0 && (
                    <rect
                      x={x}
                      y={y(b.typing + b.quiz + b.cube)}
                      width={barW}
                      height={cH}
                      rx="1.5"
                      fill="currentColor"
                      className="text-[#9B9A93] dark:text-[#6E6E6E]"
                    />
                  )}
                  {i % 2 === 0 && (
                    <text
                      x={x + barW / 2}
                      y={H - 7}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[#9B9A93] dark:text-[#6E6E6E]"
                      fontSize="8.5"
                    >
                      {b.date.getDate()}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            {summary.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-2 border-b border-[#E9E9E6] pb-2 dark:border-[#232323]"
              >
                <span className="text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
                  {s.label}
                </span>
                <span className="mono text-[15px] font-semibold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityChart;
