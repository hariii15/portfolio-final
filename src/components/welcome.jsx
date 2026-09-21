import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { useTheme } from '../theme/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const Welcome = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F7F7F5] text-[#111111] dark:bg-[#0A0A0A] dark:text-[#EDEDED]">
      {/* corner marks — Jev editorial */}
      <span className="mono pointer-events-none absolute left-5 top-5 select-none text-[#9B9A93] dark:text-[#3a3a3a]">┌</span>
      <span className="mono pointer-events-none absolute right-5 top-5 select-none text-[#9B9A93] dark:text-[#3a3a3a]">┐</span>
      <span className="mono pointer-events-none absolute bottom-5 left-5 select-none text-[#9B9A93] dark:text-[#3a3a3a]">└</span>
      <span className="mono pointer-events-none absolute bottom-5 right-5 select-none text-[#9B9A93] dark:text-[#3a3a3a]">┘</span>

      <div className="absolute right-5 top-4">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E9E9E6] bg-white text-[#6F6E69] dark:border-[#2E2E2E] dark:bg-transparent dark:text-[#A1A1A1]"
        >
          {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mono inline-block bg-[#111111] px-3 py-1.5 text-[12px] font-medium tracking-wide text-white dark:bg-[#EDEDED] dark:text-[#0A0A0A]">
          Portfolio — 2026
        </span>
        <p className="mono mt-5 text-[12.5px] tracking-wide text-[#6F6E69] dark:text-[#6E6E6E]">
          Sep 2026 · AI &amp; Full-Stack Development
        </p>

        <h1
          className="font-display mt-8 font-bold leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)', letterSpacing: '-0.04em' }}
        >
          Hariharpradeep J
        </h1>
        <p
          className="font-display mt-2 font-semibold text-[#6F6E69] dark:text-[#A1A1A1]"
          style={{ fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', letterSpacing: '-0.02em' }}
        >
          AI &amp; Full-Stack Developer
        </p>

        <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
          Building intelligent, scalable applications with machine learning,
          generative AI, and cloud-native engineering.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/hero')}
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2b2b2b] dark:bg-[#EDEDED] dark:text-[#0A0A0A] dark:hover:bg-white"
          >
            Know more about me
            <FiArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#D9D9D3] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#EFEFEA] dark:border-[#2E2E2E] dark:bg-transparent dark:text-[#EDEDED] dark:hover:bg-[#161616]"
          >
            Read my blog
            <FiArrowUpRight size={16} />
          </button>
        </div>

        <div className="mono mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] uppercase tracking-[0.12em] text-[#9B9A93] dark:text-[#6E6E6E]">
          <span>Generative AI</span>
          <span>Full-Stack</span>
          <span>Cloud-Native</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
