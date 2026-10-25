import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const shortDate = (t) =>
  new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const MetricLineChart = ({
  title,
  subtitle,
  points = [],
  color = '#EC4899',
  filter,
  emptyText = 'No sessions recorded yet.',
  formatValue = (v) => String(Math.round(v)),
  yMin,
  yMax,
}) => {
  const data = points
    .map((p) => ({ ...p, t: new Date(p.t).getTime(), value: Number(p.value) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.value))
    .sort((a, b) => a.t - b.t);

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-[14px] font-bold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-[12.5px] text-[#6F6E69] dark:text-[#A1A1A1]">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filter}
        <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
          {data.length} session{data.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );

  if (!data.length) {
    return (
      <div>
        {header}
        <div className="mt-5 flex h-[180px] flex-col items-center justify-center rounded-apple border border-dashed border-[#E9E9E6] text-center dark:border-[#232323]">
          <FiTrendingUp size={22} className="text-[#9B9A93] dark:text-[#6E6E6E]" />
          <p className="mt-3 text-[13px] font-semibold">No data yet</p>
          <p className="mt-1 max-w-[240px] text-[12.5px] text-[#6F6E69] dark:text-[#A1A1A1]">
            {emptyText}
          </p>
        </div>
      </div>
    );
  }

  const valueList = data.map((p) => p.value);
  const minV = valueList.reduce((m, v) => Math.min(m, v), Infinity);
  const maxV = valueList.reduce((m, v) => Math.max(m, v), -Infinity);

  const W = 720;
  const H = 220;
  const padL = 50;
  const padR = 12;
  const padT = 14;
  const padB = 28;

  const count = data.length;
  const firstT = data[0].t;
  const lastT = data[count - 1].t;

  const fixedMin = yMin != null;
  const fixedMax = yMax != null;
  const span = Math.max(1e-6, maxV - minV);
  const lo = fixedMin ? yMin : Math.max(0, minV - span * 0.18);
  const hi = fixedMax ? yMax : maxV + span * 0.18;
  const range = Math.max(1e-6, hi - lo);

  const x = (t) =>
    count === 1
      ? padL + (W - padL - padR) / 2
      : padL + ((t - firstT) / Math.max(1, lastT - firstT)) * (W - padL - padR);
  const y = (v) => H - padB - ((v - lo) / range) * (H - padT - padB);

  const line = data
    .map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(' ');
  const area = `${line} L ${x(lastT).toFixed(1)} ${y(lo).toFixed(1)} L ${x(firstT).toFixed(
    1
  )} ${y(lo).toFixed(1)} Z`;

  const grid = [0, 0.25, 0.5, 0.75, 1];
  const midT = count === 1 ? firstT : firstT + (lastT - firstT) / 2;
  const xTicks = count === 1 ? [firstT] : [firstT, midT, lastT];

  return (
    <div>
      {header}
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={title}>
        {grid.map((f) => {
          const gy = y(lo + range * f);
          return (
            <g key={f}>
              <line
                x1={padL}
                x2={W - padR}
                y1={gy}
                y2={gy}
                stroke="currentColor"
                className="text-[#EFEFEA] dark:text-[#1d1d1d]"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={gy + 3}
                textAnchor="end"
                fill="currentColor"
                className="text-[#9B9A93] dark:text-[#6E6E6E]"
                fontSize="9"
              >
                {formatValue(lo + range * f)}
              </text>
            </g>
          );
        })}

        <path d={area} fill={color} opacity="0.07" />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {count <= 40 &&
          data.map((p, i) => (
            <circle key={`${p.t}-${i}`} cx={x(p.t)} cy={y(p.value)} r="2.6" fill={color}>
              <title>{p.label || `${formatValue(p.value)} · ${shortDate(p.t)}`}</title>
            </circle>
          ))}

        {count > 40 && (
          <circle cx={x(lastT)} cy={y(data[count - 1].value)} r="3" fill={color}>
            <title>{data[count - 1].label || formatValue(data[count - 1].value)}</title>
          </circle>
        )}

        {xTicks.map((t, i) => (
          <text
            key={`${t}-${i}`}
            x={x(t)}
            y={H - 8}
            textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
            fill="currentColor"
            className="text-[#9B9A93] dark:text-[#6E6E6E]"
            fontSize="8.5"
          >
            {shortDate(t)}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default MetricLineChart;
