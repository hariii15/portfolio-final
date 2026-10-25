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
        <h3 className="font-display text-[17px] font-bold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-[14px] text-[#6F6E69] dark:text-[#A1A1A1]">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {filter}
        <span className="mono text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
          {data.length} session{data.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );

  if (!data.length) {
    return (
      <div>
        {header}
        <div className="mt-6 flex h-[280px] flex-col items-center justify-center rounded-apple border border-dashed border-[#D9D9D3] text-center dark:border-[#2E2E2E]">
          <FiTrendingUp size={26} className="text-[#9B9A93] dark:text-[#6E6E6E]" />
          <p className="mt-4 text-[15px] font-semibold">No data yet</p>
          <p className="mt-1.5 max-w-[280px] text-[13.5px] text-[#6F6E69] dark:text-[#A1A1A1]">
            {emptyText}
          </p>
        </div>
      </div>
    );
  }

  const valueList = data.map((p) => p.value);
  const minV = valueList.reduce((m, v) => Math.min(m, v), Infinity);
  const maxV = valueList.reduce((m, v) => Math.max(m, v), -Infinity);

  const W = 900;
  const H = 300;
  const padL = 64;
  const padR = 18;
  const padT = 20;
  const padB = 40;

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
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 h-auto w-full" role="img" aria-label={title}>
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
                className="text-[#E9E9E6] dark:text-[#232323]"
                strokeWidth="1"
              />
              <text
                x={padL - 10}
                y={gy + 4}
                textAnchor="end"
                fill="currentColor"
                className="text-[#9B9A93] dark:text-[#6E6E6E]"
                fontSize="10.5"
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
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {count <= 40 &&
          data.map((p, i) => (
            <circle key={`${p.t}-${i}`} cx={x(p.t)} cy={y(p.value)} r="3.2" fill={color}>
              <title>{p.label || `${formatValue(p.value)} · ${shortDate(p.t)}`}</title>
            </circle>
          ))}

        {count > 40 && (
          <circle cx={x(lastT)} cy={y(data[count - 1].value)} r="3.6" fill={color}>
            <title>{data[count - 1].label || formatValue(data[count - 1].value)}</title>
          </circle>
        )}

        {xTicks.map((t, i) => (
          <text
            key={`${t}-${i}`}
            x={x(t)}
            y={H - 12}
            textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
            fill="currentColor"
            className="text-[#9B9A93] dark:text-[#6E6E6E]"
            fontSize="10"
          >
            {shortDate(t)}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default MetricLineChart;
