import React from 'react';
import { Card, SectionLabel } from './ui';

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

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const weekStart = (value) => {
  const d = startOfDay(value);
  if (!d) return null;
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
};

const StatsOverview = ({ activities = [] }) => {
  const today = startOfDay(new Date());
  const activeDays = new Set();

  activities.forEach((a) => {
    const d = startOfDay(a.createdAt);
    if (d && d <= today) activeDays.add(dayKey(d));
  });

  const sortedDays = [...activeDays]
    .map((key) => {
      const [year, month, date] = key.split('-').map(Number);
      return new Date(year, month, date);
    })
    .sort((a, b) => a - b);

  let bestStreak = 0;
  let run = 0;
  let prev = null;
  sortedDays.forEach((date) => {
    if (prev) {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      run = dayKey(next) === dayKey(date) ? run + 1 : 1;
    } else {
      run = 1;
    }
    bestStreak = Math.max(bestStreak, run);
    prev = date;
  });

  let streak = 0;
  const cursor = new Date(today);
  if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  const inRange = (a, from, to) => {
    const d = startOfDay(a.createdAt);
    return Boolean(d) && d >= from && d <= to;
  };

  const last7 = activities.filter((a) => inRange(a, daysAgo(6), today));
  const prev7 = activities.filter((a) => inRange(a, daysAgo(13), daysAgo(7)));
  const delta = prev7.length
    ? Math.round(((last7.length - prev7.length) / prev7.length) * 100)
    : last7.length
    ? 100
    : 0;

  const from30 = daysAgo(29);
  const active30 = new Set();
  activities.forEach((a) => {
    const d = startOfDay(a.createdAt);
    if (d && d >= from30 && d <= today) active30.add(dayKey(d));
  });

  const quizEvents = activities.filter((a) => a.type === 'quiz' || a.type === 'periodic');
  const quizAccuracy = quizEvents.length
    ? Math.round(
        quizEvents.reduce((sum, a) => sum + (Number(a.data?.accuracy) || 0), 0) /
          quizEvents.length
      )
    : 0;

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

  const currentWeek = weekStart(today);
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

  const kpis = [
    {
      label: 'Current streak',
      value: streak,
      unit: streak === 1 ? 'day' : 'days',
      sub: bestStreak ? `Best run: ${bestStreak} days` : 'Start a streak today',
    },
    {
      label: 'Last 7 days',
      value: last7.length,
      unit: 'sessions',
      sub: `${delta >= 0 ? '+' : ''}${delta}% vs previous 7`,
    },
    {
      label: 'Active days',
      value: active30.size,
      unit: '/ 30',
      sub: `${Math.round((active30.size / 30) * 100)}% consistency`,
    },
    {
      label: 'Quiz accuracy',
      value: `${quizAccuracy}%`,
      sub: `${quizEvents.length} quiz${quizEvents.length === 1 ? '' : 'zes'} logged`,
    },
  ];

  const W = 560;
  const H = 250;
  const padL = 30;
  const padR = 8;
  const padT = 22;
  const padB = 30;
  const slot = (W - padL - padR) / weeks.length;
  const barW = Math.min(30, slot * 0.48);
  const max = Math.max(2, ...weeks.map((week) => week.total));
  const y = (value) => H - padB - (value / max) * (H - padT - padB);
  const ticks = [0, 0.5, 1];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4 sm:p-5">
            <SectionLabel>{kpi.label}</SectionLabel>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[26px] font-bold leading-none tracking-tight tabular-nums sm:text-[30px]">
                {kpi.value}
              </span>
              {kpi.unit && (
                <span className="text-[11.5px] font-medium text-[#6F6E69] dark:text-[#A1A1A1]">
                  {kpi.unit}
                </span>
              )}
            </div>
            <p className="mt-2 text-[11.5px] leading-snug text-[#9B9A93] dark:text-[#6E6E6E]">
              {kpi.sub}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <SectionLabel>Practice mix</SectionLabel>
              <p className="mt-1.5 text-[14px] text-[#6F6E69] dark:text-[#A1A1A1]">
                Where your sessions went.
              </p>
            </div>
            <span className="mono text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
              {mixTotal} total
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
            <svg
              viewBox="0 0 140 140"
              className="h-[164px] w-[164px] shrink-0"
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
                  fontSize: 30,
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

            <ul className="w-full flex-1 space-y-2.5">
              {mixSegments.map((segment) => (
                <li
                  key={segment.key}
                  className="flex items-center justify-between gap-3 border-b border-[#E9E9E6] pb-2.5 last:border-0 last:pb-0 dark:border-[#232323]"
                >
                  <span className="flex items-center gap-2 text-[12.5px] text-[#37352F] dark:text-[#C9C9C9]">
                    <span className={`h-2 w-2 rounded-full ${segment.dot}`} />
                    {segment.label}
                  </span>
                  <span className="mono text-[12px] tabular-nums text-[#6F6E69] dark:text-[#A1A1A1]">
                    {segment.value}{' '}
                    <span className="text-[#9B9A93] dark:text-[#6E6E6E]">
                      {Math.round(segment.fraction * 100)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <SectionLabel>Weekly volume</SectionLabel>
              <p className="mt-1.5 text-[14px] text-[#6F6E69] dark:text-[#A1A1A1]">
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
                  fontSize="9.5"
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
                      fontSize="9.5"
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
                    fontSize="9"
                  >
                    {`${week.start.getMonth() + 1}/${week.start.getDate()}`}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10.5px] text-[#9B9A93] dark:text-[#6E6E6E]">
            {mixSegments.map((segment) => (
              <span key={segment.key} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${segment.dot}`} />
                {segment.label}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatsOverview;
