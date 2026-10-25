import React, { useMemo, useState } from 'react';
import { SectionLabel } from './ui';

const APPS = [
  { value: 'all', label: 'All apps' },
  { value: 'typing', label: 'Typing' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'cube', label: 'Cube timer' },
];

const startOfDay = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const sessionLabel = (app, n) => {
  if (app === 'all') return `${n} session${n === 1 ? '' : 's'}`;
  if (app === 'typing') return `${n} typing test${n === 1 ? '' : 's'}`;
  if (app === 'quiz') return `${n} ${n === 1 ? 'quiz' : 'quizzes'}`;
  return `${n} cube solve${n === 1 ? '' : 's'}`;
};

const ActivityHeatmap = ({ activities = [] }) => {
  const [app, setApp] = useState('all');

  const model = useMemo(() => {
    const filtered = app === 'all' ? activities : activities.filter((a) => a.type === app);
    const counts = new Map();

    filtered.forEach((a) => {
      const d = startOfDay(a.createdAt);
      if (!d) return;
      const k = dayKey(d);
      counts.set(k, (counts.get(k) || 0) + 1);
    });

    const today = startOfDay(new Date());
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());

    const weeks = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(cursor);
        week.push({
          date,
          key: dayKey(date),
          count: counts.get(dayKey(date)) || 0,
          future: date > today,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    let total = 0;
    let activeDays = 0;
    weeks.forEach((week) =>
      week.forEach((d) => {
        if (d.future) return;
        total += d.count;
        if (d.count > 0) activeDays += 1;
      })
    );

    const months = [];
    let last = -1;
    weeks.forEach((week, wi) => {
      const first = week[0].date;
      if (first.getMonth() !== last) {
        months.push({ wi, label: first.toLocaleString('en-US', { month: 'short' }) });
        last = first.getMonth();
      }
    });

    return { weeks, months, total, activeDays };
  }, [activities, app]);

  const opacity = [0, 0.28, 0.5, 0.74, 1];
  const level = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);

  const cell = 11;
  const gap = 3;
  const padLeft = 28;
  const padTop = 20;
  const W = padLeft + model.weeks.length * (cell + gap) + 2;
  const H = padTop + 7 * (cell + gap) + 18;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel>Participation</SectionLabel>
          <p className="mt-1 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
            {model.total} session{model.total === 1 ? '' : 's'} across {model.activeDays} active day
            {model.activeDays === 1 ? '' : 's'} in the last year.
          </p>
        </div>
        <select
          value={app}
          onChange={(e) => setApp(e.target.value)}
          aria-label="Filter participation by application"
          className="rounded-apple border border-[#E9E9E6] bg-white px-3 py-2 text-[12.5px] font-medium text-[#111111] outline-none transition-colors focus:border-[#111111] dark:border-[#2E2E2E] dark:bg-[#0A0A0A] dark:text-[#EDEDED] dark:focus:border-[#EDEDED]"
        >
          {APPS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[580px]"
          role="img"
          aria-label="Participation intensity over the last year"
        >
          {model.months.map((m) => (
            <text
              key={`${m.wi}-${m.label}`}
              x={padLeft + m.wi * (cell + gap)}
              y={11}
              fill="currentColor"
              className="text-[#9B9A93] dark:text-[#6E6E6E]"
              fontSize="9"
            >
              {m.label}
            </text>
          ))}

          {[1, 3, 5].map((row, i) => (
            <text
              key={row}
              x={0}
              y={padTop + row * (cell + gap) + cell - 2}
              fill="currentColor"
              className="text-[#9B9A93] dark:text-[#6E6E6E]"
              fontSize="8.5"
            >
              {['Mon', 'Wed', 'Fri'][i]}
            </text>
          ))}

          {model.weeks.map((week, wi) =>
            week.map((d, di) => {
              if (d.future) return null;
              const l = level(d.count);
              return (
                <rect
                  key={d.key}
                  x={padLeft + wi * (cell + gap)}
                  y={padTop + di * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx="2.5"
                  fill={l === 0 ? 'currentColor' : '#EC4899'}
                  opacity={l === 0 ? 1 : opacity[l]}
                  className={l === 0 ? 'text-[#EFEFEA] dark:text-[#161616]' : undefined}
                >
                  <title>{`${sessionLabel(app, d.count)} · ${d.date.toLocaleDateString()}`}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 text-[10.5px] text-[#9B9A93] dark:text-[#6E6E6E]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="inline-block h-[10px] w-[10px] rounded-[2px]"
            style={{
              backgroundColor: l === 0 ? undefined : '#EC4899',
              opacity: l === 0 ? 1 : opacity[l],
              border: l === 0 ? '1px solid currentColor' : undefined,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
