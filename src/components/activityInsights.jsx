import React, { useState } from 'react';
import ActivityHeatmap from './activityHeatmap';
import MetricLineChart from './metricLineChart';
import Dropdown from './dropdown';

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
    <div className="space-y-20">
      <ActivityHeatmap activities={activities} />

      <MetricLineChart
        title="Typing speed"
        subtitle="Words per minute for completed tests."
        points={wpmPoints}
        formatValue={(v) => Math.round(v)}
        emptyText="Complete a typing test to see the trend."
        filter={
          <Dropdown
            value={wpmFilter}
            onChange={setWpmFilter}
            options={WPM_OPTIONS}
            ariaLabel="Filter typing tests"
            className="w-full sm:w-[190px]"
          />
        }
      />

      <MetricLineChart
        title="Quiz score"
        subtitle="First-try accuracy for completed quizzes."
        points={quizPoints}
        formatValue={(v) => `${Math.round(v)}%`}
        yMin={0}
        yMax={100}
        emptyText="Finish a quiz to see the trend."
        filter={
          <Dropdown
            value={quizFilter}
            onChange={setQuizFilter}
            options={QUIZ_OPTIONS}
            ariaLabel="Filter quizzes by region"
            className="w-full sm:w-[190px]"
          />
        }
      />

      <MetricLineChart
        title="Cube solve time"
        subtitle="Seconds per solve — lower is better."
        points={cubePoints}
        formatValue={formatCube}
        emptyText="Finish a cube solve to see the trend."
        filter={
          <Dropdown
            value={cubeFilter}
            onChange={setCubeFilter}
            options={CUBE_OPTIONS}
            ariaLabel="Filter cube solves by method"
            className="w-full sm:w-[190px]"
          />
        }
      />
    </div>
  );
};

export default ActivityInsights;
