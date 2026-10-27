import React from 'react';
import { FiBox, FiGlobe, FiGrid, FiType } from 'react-icons/fi';
import { SectionLabel } from './ui';
import { PR_BONUS, RANKS } from './xpModel';

const PR_ROWS = [
  {
    key: 'typing',
    label: 'Typing speed',
    unit: 'wpm',
    icon: FiType,
    accent: 'text-[#EC4899]',
    format: (value) => Math.round(value),
  },
  {
    key: 'cube',
    label: 'Cube solve',
    unit: 'sec',
    icon: FiBox,
    accent: 'text-[#60A5FA]',
    format: (value) => Number(value).toFixed(2),
  },
  {
    key: 'quiz',
    label: 'World quiz',
    unit: '%',
    icon: FiGlobe,
    accent: 'text-[#111111] dark:text-[#EDEDED]',
    format: (value) => Math.round(value),
  },
  {
    key: 'periodic',
    label: 'Element quiz',
    unit: '%',
    icon: FiGrid,
    accent: 'text-[#16A34A]',
    format: (value) => Math.round(value),
  },
];

const APP_ROWS = [
  {
    key: 'typing',
    label: 'Typing',
    icon: FiType,
    accent: 'text-[#EC4899]',
    bar: 'bg-[#EC4899]',
  },
  {
    key: 'quiz',
    label: 'World quiz',
    icon: FiGlobe,
    accent: 'text-[#111111] dark:text-[#EDEDED]',
    bar: 'bg-[#111111] dark:bg-[#EDEDED]',
  },
  {
    key: 'periodic',
    label: 'Element quiz',
    icon: FiGrid,
    accent: 'text-[#16A34A]',
    bar: 'bg-[#16A34A]',
  },
  {
    key: 'cube',
    label: 'Cube timer',
    icon: FiBox,
    accent: 'text-[#60A5FA]',
    bar: 'bg-[#60A5FA]',
  },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const XpSummary = ({ progress }) => {
  const { rank, nextRank, level } = progress;

  const stats = [
    { label: 'XP today', value: progress.xpToday.toLocaleString() },
    { label: 'Streak', value: `${progress.currentStreak}d` },
    { label: 'Sessions', value: progress.totalSessions.toLocaleString() },
    { label: 'Active days', value: progress.checkInDays.toLocaleString() },
  ];

  return (
    <div>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mono flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B9A93] dark:text-[#6E6E6E]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: rank.color }} />
            Level {level} · {rank.name}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[44px] font-bold leading-none tracking-tight tabular-nums">
              {progress.totalXp.toLocaleString()}
            </span>
            <span className="text-[13px] font-medium text-[#6F6E69] dark:text-[#A1A1A1]">XP</span>
          </div>
          <p className="mt-2 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
            {progress.totalSessions} session{progress.totalSessions === 1 ? '' : 's'} across{' '}
            {progress.checkInDays} day{progress.checkInDays === 1 ? '' : 's'}
            {nextRank
              ? ` · ${nextRank.min - level} level${nextRank.min - level === 1 ? '' : 's'} to ${
                  nextRank.name
                }`
              : ' · top rank reached'}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B9A93] dark:text-[#6E6E6E]">
                {stat.label}
              </dt>
              <dd className="font-display mt-1 text-[22px] font-bold leading-none tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12px]">
          <span className="font-medium">
            Level {level} <span className="text-[#9B9A93] dark:text-[#6E6E6E]">→</span> Level{' '}
            {level + 1}
          </span>
          <span className="mono tabular-nums text-[#6F6E69] dark:text-[#A1A1A1]">
            {progress.xpIntoLevel.toLocaleString()} / {progress.levelSpan.toLocaleString()} XP
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9E9E6] dark:bg-[#232323]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress.levelProgress}%`, backgroundColor: rank.color }}
          />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11.5px] text-[#9B9A93] dark:text-[#6E6E6E]">
          <span>{progress.xpToNextLevel.toLocaleString()} XP to the next level</span>
          <span>{progress.levelProgress}%</span>
        </div>
      </div>
    </div>
  );
};

export const XpBreakdown = ({ progress }) => {
  const apps = APP_ROWS.map((app) => ({ ...app, ...progress.byApp[app.key] }));
  const maxAppXp = Math.max(1, ...apps.map((app) => app.total));
  const attributedXp = apps.reduce((sum, app) => sum + app.total, 0);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
          Session and PR XP per tool. Daily bonuses are not split.
        </p>
        <span className="mono text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
          {attributedXp.toLocaleString()} XP attributed
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {apps.map((app) => {
          const Icon = app.icon;
          const width = app.total > 0 ? Math.max(3, (app.total / maxAppXp) * 100) : 0;
          return (
            <div key={app.key}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <Icon size={14} className={app.accent} />
                  {app.label}
                </span>
                <span className="mono text-[12.5px] tabular-nums text-[#6F6E69] dark:text-[#A1A1A1]">
                  {app.total.toLocaleString()} XP
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9E9E6] dark:bg-[#232323]">
                <div className={`h-full rounded-full ${app.bar}`} style={{ width: `${width}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-[#9B9A93] dark:text-[#6E6E6E]">
                {app.sessions} session{app.sessions === 1 ? '' : 's'} ·{' '}
                {app.sessionsXp.toLocaleString()} session XP · {app.prXp.toLocaleString()} PR XP
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#E9E9E6] pt-6 dark:border-[#232323]">
        <SectionLabel>Rank ladder</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {RANKS.map((item) => {
            const reached = progress.level >= item.min;
            const current = item.name === progress.rank.name;
            return (
              <span
                key={item.name}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                  current
                    ? ''
                    : reached
                    ? 'border-[#E9E9E6] text-[#37352F] dark:border-[#2E2E2E] dark:text-[#C9C9C9]'
                    : 'border-dashed border-[#E9E9E6] text-[#9B9A93] dark:border-[#2E2E2E] dark:text-[#6E6E6E]'
                }`}
                style={
                  current
                    ? {
                        borderColor: `${item.color}88`,
                        backgroundColor: `${item.color}14`,
                        color: item.color,
                      }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.color, opacity: reached ? 1 : 0.35 }}
                />
                {item.name}
                <span className="mono text-[9.5px] opacity-60">Lv {item.min}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PersonalRecords = ({ progress }) => (
  <div>
    <p className="text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
      Every new record pays a {PR_BONUS} XP bonus.
    </p>

    <div className="mt-4 divide-y divide-[#E9E9E6] border-y border-[#E9E9E6] dark:divide-[#232323] dark:border-[#232323]">
      {PR_ROWS.map((card) => {
        const record = progress.prs[card.key];
        const Icon = card.icon;
        const hasRecord = record?.value != null;
        return (
          <div
            key={card.key}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3.5 sm:grid-cols-[1fr_120px_auto]"
          >
            <span className="flex min-w-0 items-center gap-2.5 text-[13.5px] font-medium">
              <Icon size={15} className={`shrink-0 ${card.accent}`} />
              {card.label}
            </span>

            <span className="font-display text-right text-[20px] font-bold leading-none tabular-nums sm:text-left">
              {hasRecord ? card.format(record.value) : '—'}
              {hasRecord && (
                <span className="ml-1 text-[11px] font-medium text-[#9B9A93] dark:text-[#6E6E6E]">
                  {card.unit}
                </span>
              )}
            </span>

            <span className="col-span-2 text-[11.5px] text-[#9B9A93] dark:text-[#6E6E6E] sm:col-span-1 sm:text-right">
              {hasRecord
                ? `Set ${formatDate(record.at)} · ${record.count} PR${
                    record.count === 1 ? '' : 's'
                  } · +${(record.count * PR_BONUS).toLocaleString()} XP`
                : 'No result logged yet'}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);
