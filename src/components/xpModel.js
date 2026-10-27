// XP model — every session earns a small amount, daily check-ins and new
// personal records pay bonuses, and levels climb steeply so ranks stay hard.

export const PR_BONUS = 100;

const DAILY_BASE = 25;
const MAX_STREAK_BONUS_DAYS = 25;

const SESSION_BASE = {
  typing: 12,
  quiz: 14,
  periodic: 14,
  cube: 10,
};

const startOfDay = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const dayAfter = (date) => {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
};

export const activityXp = (activity) => {
  const type = activity?.type;
  const data = activity?.data || {};

  if (type === 'typing') {
    const wpm = Math.max(0, Number(data.wpm) || 0);
    return SESSION_BASE.typing + Math.min(10, Math.round(wpm / 20));
  }

  if (type === 'quiz' || type === 'periodic') {
    const accuracy = Math.min(100, Math.max(0, Number(data.accuracy) || 0));
    return SESSION_BASE[type] + Math.round(accuracy / 25);
  }

  if (type === 'cube') {
    const seconds = Number(data.durationSec);
    const speedBonus =
      Number.isFinite(seconds) && seconds > 0
        ? Math.max(0, Math.min(8, Math.round(10 - seconds / 10)))
        : 0;
    return SESSION_BASE.cube + speedBonus;
  }

  return 0;
};

export const xpForLevel = (level) => {
  const n = Math.max(1, Math.floor(level));
  return 150 * (n - 1) * n;
};

export const RANKS = [
  { name: 'Novice', min: 1, color: '#9B9A93' },
  { name: 'Bronze', min: 4, color: '#C2703D' },
  { name: 'Silver', min: 8, color: '#8A94A6' },
  { name: 'Gold', min: 13, color: '#CA8A04' },
  { name: 'Platinum', min: 20, color: '#0E7490' },
  { name: 'Diamond', min: 28, color: '#2563EB' },
  { name: 'Master', min: 38, color: '#7C3AED' },
  { name: 'Legend', min: 50, color: '#DB2777' },
  { name: 'Mythic', min: 65, color: '#EA580C' },
];

export const rankForLevel = (level) =>
  RANKS.reduce((current, rank) => (level >= rank.min ? rank : current), RANKS[0]);

export const nextRankForLevel = (level) => RANKS.find((rank) => rank.min > level) || null;

export const computeProgress = (activities = []) => {
  const today = startOfDay(new Date());
  const todayKey = dayKey(today);

  const chronological = activities
    .map((activity) => ({ activity, date: startOfDay(activity?.createdAt) }))
    .filter((entry) => entry.date)
    .sort((a, b) => a.date - b.date);

  const records = {
    typing: { key: 'typing', value: null, at: null, count: 0 },
    cube: { key: 'cube', value: null, at: null, count: 0 },
    quiz: { key: 'quiz', value: null, at: null, count: 0 },
    periodic: { key: 'periodic', value: null, at: null, count: 0 },
  };

  const byApp = {
    typing: { sessions: 0, sessionsXp: 0, prXp: 0, total: 0 },
    quiz: { sessions: 0, sessionsXp: 0, prXp: 0, total: 0 },
    periodic: { sessions: 0, sessionsXp: 0, prXp: 0, total: 0 },
    cube: { sessions: 0, sessionsXp: 0, prXp: 0, total: 0 },
  };

  const activeDays = new Set();
  let totalXp = 0;
  let sessionsXp = 0;
  let dailyXp = 0;
  let prXp = 0;
  let xpToday = 0;
  let sessionCount = 0;
  let lastDay = null;
  let streak = 0;

  const addToToday = (amount, key) => {
    if (key === todayKey) xpToday += amount;
  };

  const registerPr = (key, value, lowerIsBetter, activity) => {
    if (!Number.isFinite(value)) return;
    const record = records[key];
    const beats =
      record.value == null || (lowerIsBetter ? value < record.value : value > record.value);
    if (!beats) return;

    record.value = value;
    record.at = activity.createdAt;
    record.count += 1;
    prXp += PR_BONUS;
    totalXp += PR_BONUS;
    if (byApp[key]) byApp[key].prXp += PR_BONUS;
    addToToday(PR_BONUS, dayKey(startOfDay(activity.createdAt)));
  };

  chronological.forEach(({ activity, date }) => {
    const key = dayKey(date);
    activeDays.add(key);
    sessionCount += 1;

    const sessionGain = activityXp(activity);
    sessionsXp += sessionGain;
    totalXp += sessionGain;
    if (byApp[activity.type]) {
      byApp[activity.type].sessions += 1;
      byApp[activity.type].sessionsXp += sessionGain;
    }
    addToToday(sessionGain, key);

    if (key !== (lastDay ? dayKey(lastDay) : null)) {
      const consecutive = lastDay && dayKey(dayAfter(lastDay)) === key;
      streak = lastDay ? (consecutive ? streak + 1 : 1) : 1;

      const bonus = DAILY_BASE + Math.min(streak, MAX_STREAK_BONUS_DAYS) * 2;
      dailyXp += bonus;
      totalXp += bonus;
      addToToday(bonus, key);
      lastDay = date;
    }

    const data = activity.data || {};

    if (activity.type === 'typing') {
      const wpm = Number(data.wpm);
      if (wpm > 0) registerPr('typing', wpm, false, activity);
    } else if (activity.type === 'cube') {
      const seconds = Number(data.durationSec);
      if (seconds > 0) registerPr('cube', seconds, true, activity);
    } else if (activity.type === 'quiz' || activity.type === 'periodic') {
      const accuracy = Number(data.accuracy);
      if (Number.isFinite(accuracy) && accuracy >= 0) {
        registerPr(activity.type, accuracy, false, activity);
      }
    }
  });

  Object.values(byApp).forEach((app) => {
    app.total = app.sessionsXp + app.prXp;
  });

  let currentStreak = 0;
  const cursor = new Date(today);
  if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(dayKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) level += 1;

  const levelFloorXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const levelSpan = Math.max(1, nextLevelXp - levelFloorXp);
  const xpIntoLevel = totalXp - levelFloorXp;
  const xpToNextLevel = Math.max(0, nextLevelXp - totalXp);
  const levelProgress = Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100));

  const rank = rankForLevel(level);

  return {
    totalXp,
    sessionsXp,
    dailyXp,
    prXp,
    xpToday,
    level,
    rank,
    nextRank: nextRankForLevel(level),
    levelFloorXp,
    nextLevelXp,
    xpIntoLevel,
    levelSpan,
    xpToNextLevel,
    levelProgress,
    currentStreak,
    checkInDays: activeDays.size,
    totalSessions: sessionCount,
    byApp,
    prs: records,
  };
};
