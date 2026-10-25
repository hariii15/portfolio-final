import React, { useState } from 'react';
import { Card } from './ui';
import ActivityHeatmap from './activityHeatmap';
import MetricLineChart from './metricLineChart';

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

const WPM_OPTIONS = [
  { value: 'any', label: 'All tests' },
  ...[15, 30, 60, 120].map((v) => ({ value: `time:${v}`, label: `Time ${v}s` })),
  ...[10, 25, 50, 100].map((v) => ({ value: `words:${v}`, label: `Words ${v}` })),
];

const QUIZ_OPTIONS = [
  { value: 'any', label: 'All quizzes' },
  { value: 'All', label: 'Whole world' },
  ...CONTINENTS.map((c) => ({ value: c, label: c })),
];

const CUBE_OPTIONS = [
  { value: 'any', label: 'All methods' },
  { value: 'CFOP', label: 'CFOP' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Roux', label: 'Roux' },
];

const selectCls =
  'rounded-apple border border-[#E9E9E6] bg-white px-3 py-2 text-[12.5px] font-medium text-[#111111] outline-none transition-colors focus:border-[#111111] dark:border-[#2E2E2E] dark:bg-[#0A0A0A] dark:text-[#EDEDED] dark:focus:border-[#EDEDED]';

const Select = ({ value, onChange, options, label }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className={selectCls}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const formatCube = (v) =>
  v >= 60
    ? `${Math.floor(v / 60)}:${(v % 60).toFixed(1).padStart(4, '0')}`
    : v.toFixed(1);

const ActivityInsights = ({ activities = [] }) => {
  const [wpmFilter, setWpmFilter] = useState('any');
  const [quizFilter, setQuizFilter] = useState('any');
  const [cubeFilter, setCubeFilter] = useState('any');

  const typing = activities.filter((a) => a.type === 'typing');
  const quizzes = activities.filter((a) => a.type === 'quiz');
  const cubes = activities.filter((a) => a.type === 'cube');

  const wpmFiltered = typing.filter((a) => {
    if (wpmFilter === 'any') return true;
    const [mode, value] = wpmFilter.split(':');
    return a.data?.mode === mode && Number(a.data?.value) === Number(value);
  });

  const quizFiltered = quizzes.filter(
    (a) => quizFilter === 'any' || a.data?.region === quizFilter
  );

  const cubeFiltered = cubes.filter(
    (a) => cubeFilter === 'any' || a.data?.method === cubeFilter
  );

  const wpmPoints = wpmFiltered.map((a) => ({
    t: a.createdAt,
    value: Number(a.data?.wpm) || 0,
    label: `${a.data?.wpm ?? 0} wpm · ${a.data?.time ?? ''}`,
  }));

  const quizPoints = quizFiltered.map((a) => ({
    t: a.createdAt,
    value: Number(a.data?.accuracy) || 0,
    label: `${a.data?.accuracy ?? 0}% · ${a.data?.firstTry ?? 0}/${a.data?.total ?? 0}`,
  }));

  const cubePoints = cubeFiltered.map((a) => ({
    t: a.createdAt,
    value: Number(a.data?.durationSec) || 0,
    label: `${Number(a.data?.durationSec || 0).toFixed(2)}s · ${a.data?.method ?? ''}`,
  }));

  return (
    <div className="mt-5 space-y-5">
      <Card className="p-6">
        <ActivityHeatmap activities={activities} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <MetricLineChart
            title="Typing speed"
            subtitle="Words per minute for completed tests."
            points={wpmPoints}
            formatValue={(v) => Math.round(v)}
            emptyText="Complete a typing test to see the trend."
            filter={
              <Select
                value={wpmFilter}
                onChange={setWpmFilter}
                options={WPM_OPTIONS}
                label="Filter typing tests"
              />
            }
          />
        </Card>

        <Card className="p-6">
          <MetricLineChart
            title="Quiz score"
            subtitle="First-try accuracy for completed quizzes."
            points={quizPoints}
            formatValue={(v) => `${Math.round(v)}%`}
            yMin={0}
            yMax={100}
            emptyText="Finish a quiz to see the trend."
            filter={
              <Select
                value={quizFilter}
                onChange={setQuizFilter}
                options={QUIZ_OPTIONS}
                label="Filter quizzes by region"
              />
            }
          />
        </Card>
      </div>

      <Card className="p-6">
        <MetricLineChart
          title="Cube solve time"
          subtitle="Seconds per solve — lower is better."
          points={cubePoints}
          formatValue={formatCube}
          emptyText="Finish a cube solve to see the trend."
          filter={
            <Select
              value={cubeFilter}
              onChange={setCubeFilter}
              options={CUBE_OPTIONS}
              label="Filter cube solves by method"
            />
          }
        />
      </Card>
    </div>
  );
};

export default ActivityInsights;
