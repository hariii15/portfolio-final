import React from 'react';
import { FiBox, FiGlobe, FiGrid, FiType } from 'react-icons/fi';
import { Card, SectionLabel } from './ui';
import { PR_BONUS, RANKS, computeProgress } from './xpModel';

const PR_CARDS = [
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

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const XP_STATS = (progress) => [
  { label: 'XP today', value: progress.xpToday },
  { label: 'Session XP', value: progress.sessionsXp },
  { label: 'Daily XP', value: progress.dailyXp },
  { label: 'PR bonuses', value: progress.prXp },
];

const XpPanel = ({ activities = [] }) => {
  const progress = computeProgress(activities);
  const { rank, nextRank, level, prs } = progress;
  const stats = XP_STATS(progress);

  return (
    <div>
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-5">
            <div
              className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[20px] border"
              style={{
                borderColor: `${rank.color}66`,
                backgroundColor: `${rank.color}14`,
                color: rank.color,
              }}
            >
              <span className="mono text-[9px] font-semibold uppercase tracking-[0.16em] opacity-80">
                Level
              </span>
              <span className="font-display text-[42px] font-bold leading-none">{level}</span>
            </div>

            <div>
              <SectionLabel>Rank</SectionLabel>
              <h2 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {rank.name}
              </h2>
              <p className="mt-1.5 text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
                <span className="font-semibold text-[#111111] dark:text-[#EDEDED]">
                  {progress.totalXp.toLocaleString()} XP
                </span>{' '}
                · {progress.totalSessions} session{progress.totalSessions === 1 ? '' : 's'} across{' '}
                {progress.checkInDays} day{progress.checkInDays === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 xl:gap-x-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B9A93] dark:text-[#6E6E6E]">
                  {stat.label}
                </p>
                <p className="font-display mt-1 text-[24px] font-bold leading-none tabular-nums">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold">
              Level {level} <span className="text-[#9B9A93] dark:text-[#6E6E6E]">→</span> Level{' '}
              {level + 1}
            </span>
            <span className="mono text-[#6F6E69] dark:text-[#A1A1A1]">
              {progress.xpIntoLevel.toLocaleString()} / {progress.levelSpan.toLocaleString()} XP
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#EFEFEA] dark:bg-[#1A1A1A]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.levelProgress}%`, backgroundColor: rank.color }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11.5px] text-[#9B9A93] dark:text-[#6E6E6E]">
            <span>{progress.xpToNextLevel.toLocaleString()} XP to the next level</span>
            <span>
              {nextRank
                ? `${nextRank.min - level} level${nextRank.min - level === 1 ? '' : 's'} to ${
                    nextRank.name
                  }`
                : 'Top rank reached'}
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {RANKS.map((item) => {
            const reached = level >= item.min;
            const current = item.name === rank.name;
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
      </Card>

      <section id="records" className="mt-8 scroll-mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Personal records</SectionLabel>
            <p className="mt-1.5 text-[14px] text-[#6F6E69] dark:text-[#A1A1A1]">
              Every new record pays a {PR_BONUS} XP bonus.
            </p>
          </div>
          <span className="mono text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
            +{progress.prXp.toLocaleString()} XP from PRs
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PR_CARDS.map((card) => {
            const record = prs[card.key];
            const Icon = card.icon;
            const hasRecord = record?.value != null;
            return (
              <Card key={card.key} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E9E9E6] bg-[#F7F7F5] dark:border-[#2E2E2E] dark:bg-[#0A0A0A] ${card.accent}`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="mono text-[9.5px] uppercase tracking-[0.14em] text-[#9B9A93] dark:text-[#6E6E6E]">
                    Record
                  </span>
                </div>

                <p className="mt-4 text-[12px] font-medium text-[#6F6E69] dark:text-[#A1A1A1]">
                  {card.label}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  {hasRecord ? (
                    <>
                      <span className="font-display text-[36px] font-bold leading-none tabular-nums">
                        {card.format(record.value)}
                      </span>
                      <span className="text-[12px] font-medium text-[#9B9A93] dark:text-[#6E6E6E]">
                        {card.unit}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-[36px] font-bold leading-none text-[#9B9A93] dark:text-[#6E6E6E]">
                      —
                    </span>
                  )}
                </div>

                <p className="mt-3 border-t border-[#E9E9E6] pt-3 text-[11.5px] text-[#9B9A93] dark:border-[#232323] dark:text-[#6E6E6E]">
                  {hasRecord
                    ? `Set ${formatDate(record.at)} · ${record.count} PR${
                        record.count === 1 ? '' : 's'
                      } · +${(record.count * PR_BONUS).toLocaleString()} XP`
                    : 'No result logged yet'}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default XpPanel;
