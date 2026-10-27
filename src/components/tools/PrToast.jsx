import React from 'react';
import { FiAward, FiX } from 'react-icons/fi';
import { PR_BONUS } from '../xpModel';

const META = {
  typing: { label: 'Typing speed', unit: 'wpm', format: (value) => Math.round(value) },
  cube: { label: 'Cube solve', unit: 'sec', format: (value) => Number(value).toFixed(2) },
  quiz: { label: 'World quiz', unit: '%', format: (value) => Math.round(value) },
  periodic: { label: 'Element quiz', unit: '%', format: (value) => Math.round(value) },
};

const PrToast = ({ toast, onClose }) => {
  if (!toast) return null;
  const meta = META[toast.type];
  if (!meta) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[90] flex items-start gap-3 rounded-[14px] border border-[#2E2E2E] bg-[#111111] p-4 text-white shadow-2xl sm:left-auto sm:w-[360px]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#EC4899]/40 bg-[#EC4899]/15 text-[#EC4899]">
        <FiAward size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#A1A1A1]">
          New personal record
        </p>
        <p className="mt-1 text-[15px] font-semibold">{meta.label}</p>
        <p className="mt-0.5 text-[13px] text-[#C9C9C9]">
          <span className="font-semibold text-white">
            {meta.format(toast.value)} {meta.unit}
          </span>{' '}
          · +{PR_BONUS} XP
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss personal record"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[#A1A1A1] transition-colors hover:bg-[#1E1E1E] hover:text-white"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

export default PrToast;
