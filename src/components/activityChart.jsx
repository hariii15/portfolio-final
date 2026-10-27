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
  const periodic = activities.filter((a) => a.type === 'periodic');

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
  const bestElementScore = periodic.reduce(
    (best, a) => Math.max(best, Number(a.data?.accuracy) || 0),
    0
  );

  const total = activities.length;
  const days = 14;
  const today = dayStart(new Date());
  const buckets = Array.from({ length: days }, (_, i) => ({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i)),
    typing: 0,
    quiz: 0,
    cube: 0,
    periodic: 0,
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
    else if (a.type === 'periodic') buckets[i].periodic += 1;
  });

  const max = Math.max(
    2,
    ...buckets.map((b) => b.typing + b.quiz + b.cube + b.periodic)
  );

  const W = 900;
  const H = 240;
  const padL = 34;
  const padR = 10;
  const padT = 16;
  const padB = 30;
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
    { label: 'element quizzes', value: periodic.length },
    { label: 'best elem score', value: `${bestElementScore}%` },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Activity</SectionLabel>
          <p className="mt-1.5 text-[14px] text-[#6F6E69] dark:text-[#A1A1A1]">
            Every completed quiz, typing test, cube solve, and element quiz.
          </p>
        </div>
        <div className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 pt-1.5 text-[12px] text-[#6F6E69] dark:text-[#A1A1A1] sm:flex">
          <span className="flex items-center gap-2">
            <i className="inline-block h-0.5 w-4 rounded-full bg-[#EC4899]" /> typing
          </span>
          <span className="flex items-center gap-2">
            <i className="inline-block h-0.5 w-4 rounded-full bg-[#111111] dark:bg-[#EDEDED]" /> quiz
          </span>
          <span className="flex items-center gap-2">
            <i className="inline-block h-0.5 w-4 rounded-full bg-[#9B9A93] dark:bg-[#6E6E6E]" /> cube
          </span>
          <span className="flex items-center gap-2">
            <i className="inline-block h-0.5 w-4 rounded-full bg-[#16A34A]" /> element quiz
          </span>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-apple border border-dashed border-[#D9D9D3] py-14 text-center dark:border-[#2E2E2E]">
          <FiActivity size={26} className="text-[#9B9A93] dark:text-[#6E6E6E]" />
          <p className="mt-4 text-[15px] font-semibold">No activity yet</p>
          <p className="mt-1.5 text-[13.5px] text-[#6F6E69] dark:text-[#A1A1A1]">
            Finish a quiz, typing test, cube solve, or element quiz to start the graph.
          </p>
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-6 h-auto w-full"
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
                  x={padL - 8}
                  y={y(max * f) + 4}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-[#9B9A93] dark:text-[#6E6E6E]"
                  fontSize="10.5"
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
              const pH = (b.periodic / max) * (H - padT - padB);
              return (
                <g key={b.date.toISOString()}>
                  <title>{`${b.date.toLocaleDateString()} · ${b.typing} typing · ${b.quiz} quiz · ${b.cube} cube · ${b.periodic} element`}</title>
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
                  {b.periodic > 0 && (
                    <rect
                      x={x}
                      y={y(b.typing + b.quiz + b.cube + b.periodic)}
                      width={barW}
                      height={pH}
                      rx="1.5"
                      fill="#16A34A"
                    />
                  )}
                  {i % 2 === 0 && (
                    <text
                      x={x + barW / 2}
                      y={H - 10}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[#9B9A93] dark:text-[#6E6E6E]"
                      fontSize="10"
                    >
                      {b.date.getDate()}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {summary.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-2 border-b border-[#E9E9E6] pb-2.5 dark:border-[#232323]"
              >
                <span className="text-[12px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
                  {s.label}
                </span>
                <span className="mono text-[18px] font-semibold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityChart;
