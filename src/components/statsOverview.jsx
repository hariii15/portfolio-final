import React from 'react';
import { SectionLabel } from './ui';

const MIX = [
  {
    key: 'typing',
    label: 'Typing',
    stroke: 'text-[#EC4899]',
    dot: 'bg-[#EC4899]',
  },
  {
    key: 'quiz',
    label: 'World quiz',
    stroke: 'text-[#111111] dark:text-[#EDEDED]',
    dot: 'bg-[#111111] dark:bg-[#EDEDED]',
  },
  {
    key: 'periodic',
    label: 'Element quiz',
    stroke: 'text-[#16A34A]',
    dot: 'bg-[#16A34A]',
  },
  {
    key: 'cube',
    label: 'Cube',
    stroke: 'text-[#9B9A93] dark:text-[#6E6E6E]',
    dot: 'bg-[#9B9A93] dark:bg-[#6E6E6E]',
  },
];

const startOfDay = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const weekStart = (value) => {
  const d = startOfDay(value);
  if (!d) return null;
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
};

const StatsOverview = ({ activities = [] }) => {
  const counts = { typing: 0, quiz: 0, periodic: 0, cube: 0 };
  activities.forEach((a) => {
    if (Object.prototype.hasOwnProperty.call(counts, a.type)) counts[a.type] += 1;
  });
  const mixTotal = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const RADIUS = 54;
  const CIRC = 2 * Math.PI * RADIUS;
  let mixOffset = 0;
  const mixSegments = MIX.map((item) => {
    const value = counts[item.key];
    const fraction = mixTotal ? value / mixTotal : 0;
    const segment = { ...item, value, fraction, offset: mixOffset };
    mixOffset += fraction;
    return segment;
  });

  const currentWeek = weekStart(new Date());
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (7 - i) * 7);
    return { start, typing: 0, quiz: 0, periodic: 0, cube: 0, total: 0 };
  });
  const weekMap = new Map(weeks.map((week) => [week.start.getTime(), week]));
  activities.forEach((a) => {
    const start = weekStart(a.createdAt);
    if (!start) return;
    const week = weekMap.get(start.getTime());
    if (!week) return;
    if (Object.prototype.hasOwnProperty.call(counts, a.type)) week[a.type] += 1;
    week.total += 1;
  });

  const W = 560;
  const H = 280;
  const padL = 32;
  const padR = 8;
  const padT = 24;
  const padB = 34;
  const slot = (W - padL - padR) / weeks.length;
  const barW = Math.min(34, slot * 0.5);
  const max = Math.max(2, ...weeks.map((week) => week.total));
  const y = (value) => H - padB - (value / max) * (H - padT - padB);
  const ticks = [0, 0.5, 1];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel>Practice mix</SectionLabel>
            <p className="mt-1.5 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
              Where your sessions went.
            </p>
          </div>
          <span className="mono text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
            {mixTotal} total
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
          <svg
            viewBox="0 0 140 140"
            className="h-[180px] w-[180px] shrink-0"
            role="img"
            aria-label="Sessions by app"
          >
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              strokeWidth="14"
              stroke="currentColor"
              className="text-[#E9E9E6] dark:text-[#232323]"
            />
            {mixSegments.map((segment) => (
              <circle
                key={segment.key}
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                strokeWidth="14"
                stroke="currentColor"
                strokeLinecap="butt"
                strokeDasharray={`${segment.fraction * CIRC} ${CIRC}`}
                strokeDashoffset={-segment.offset * CIRC}
                transform="rotate(-90 70 70)"
                className={segment.stroke}
              >
                <title>{`${segment.label} · ${segment.value} sessions`}</title>
              </circle>
            ))}
            <text
              x="70"
              y="68"
              textAnchor="middle"
              fill="currentColor"
              className="text-[#111111] dark:text-[#EDEDED]"
              style={{
                fontFamily: "'Inter Tight', 'Inter', sans-serif",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {mixTotal}
            </text>
            <text
              x="70"
              y="86"
              textAnchor="middle"
              fill="currentColor"
              className="text-[#9B9A93] dark:text-[#6E6E6E]"
              style={{ fontSize: 8, letterSpacing: 1.6 }}
            >
              SESSIONS
            </text>
          </svg>

          <ul className="w-full flex-1 space-y-3">
            {mixSegments.map((segment) => (
              <li
                key={segment.key}
                className="flex items-center justify-between gap-3 border-b border-[#E9E9E6] pb-3 last:border-0 last:pb-0 dark:border-[#232323]"
              >
                <span className="flex items-center gap-2 text-[13px] text-[#37352F] dark:text-[#C9C9C9]">
                  <span className={`h-2.5 w-2.5 rounded-full ${segment.dot}`} />
                  {segment.label}
                </span>
                <span className="mono text-[13px] tabular-nums text-[#6F6E69] dark:text-[#A1A1A1]">
                  {segment.value}{' '}
                  <span className="text-[#9B9A93] dark:text-[#6E6E6E]">
                    {Math.round(segment.fraction * 100)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E9E9E6] pt-10 dark:border-[#232323]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel>Weekly volume</SectionLabel>
            <p className="mt-1.5 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
              Sessions per week, stacked by app.
            </p>
          </div>
          <span className="mono text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
            {weeks[weeks.length - 1].total} this week
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 h-auto w-full"
          role="img"
          aria-label="Sessions per week for the last eight weeks"
        >
          {ticks.map((f) => (
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
                x={padL - 7}
                y={y(max * f) + 3.5}
                textAnchor="end"
                fill="currentColor"
                className="text-[#9B9A93] dark:text-[#6E6E6E]"
                fontSize="10.5"
              >
                {Math.round(max * f)}
              </text>
            </g>
          ))}

          {weeks.map((week, index) => {
            const center = padL + index * slot + slot / 2;
            const left = center - barW / 2;
            let stacked = 0;
            return (
              <g key={week.start.toISOString()}>
                <title>{`Week of ${week.start.toLocaleDateString()} · ${week.total} sessions`}</title>

                {mixSegments.map((segment) => {
                  const value = week[segment.key];
                  if (!value) return null;
                  const height = (value / max) * (H - padT - padB);
                  const rect = (
                    <rect
                      key={segment.key}
                      x={left}
                      y={y(stacked + value)}
                      width={barW}
                      height={height}
                      rx="1.5"
                      fill="currentColor"
                      className={segment.stroke}
                    />
                  );
                  stacked += value;
                  return rect;
                })}

                {week.total > 0 && (
                  <text
                    x={center}
                    y={y(week.total) - 6}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[#9B9A93] dark:text-[#6E6E6E]"
                    fontSize="10.5"
                  >
                    {week.total}
                  </text>
                )}

                <text
                  x={center}
                  y={H - 10}
                  textAnchor="middle"
                  fill="currentColor"
                  className={
                    index === weeks.length - 1
                      ? 'text-[#111111] dark:text-[#EDEDED]'
                      : 'text-[#9B9A93] dark:text-[#6E6E6E]'
                  }
                  fontSize="10"
                >
                  {`${week.start.getMonth() + 1}/${week.start.getDate()}`}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[#9B9A93] dark:text-[#6E6E6E]">
          {mixSegments.map((segment) => (
            <span key={segment.key} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${segment.dot}`} />
              {segment.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
