import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

/* Shared flat primitives — Notion light / Jev dark, Apple radius, no gradients/glow/glass */

export const Page = ({ children, narrow = false }) => (
  <div className="min-h-screen bg-white text-[#111111] dark:bg-[#0A0A0A] dark:text-[#EDEDED]">
    <div className={`mx-auto w-full ${narrow ? 'max-w-3xl' : 'max-w-6xl'} px-5 sm:px-8 pb-28`}>
      {children}
    </div>
  </div>
);

export const Eyebrow = ({ children }) => (
  <p className="eyebrow text-[#9B9A93] dark:text-[#6E6E6E]">{children}</p>
);

export const PageTitle = ({ children }) => (
  <h1
    className="font-display font-bold tracking-tight text-[#111111] dark:text-[#EDEDED] leading-[1.02]"
    style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.035em' }}
  >
    {children}
  </h1>
);

export const PageSubtitle = ({ children }) => (
  <p className="mt-4 max-w-2xl text-[16px] sm:text-[17px] leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
    {children}
  </p>
);

export const Card = ({ children, className = '', ...rest }) => (
  <div
    className={`rounded-apple-lg border border-[#E9E9E6] bg-white shadow-apple dark:border-[#232323] dark:bg-[#111111] dark:shadow-none ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const Pill = ({ children, active = false }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[12.5px] font-medium leading-none ${
      active
        ? 'border-[#111111] bg-[#111111] text-white dark:border-[#EDEDED] dark:bg-[#EDEDED] dark:text-[#0A0A0A]'
        : 'border-[#E9E9E6] bg-[#F7F7F5] text-[#37352F] dark:border-[#2E2E2E] dark:bg-[#161616] dark:text-[#A1A1A1]'
    }`}
  >
    {children}
  </span>
);

export const Tag = ({ children }) => (
  <span className="mono inline-flex items-center rounded-md border border-[#E9E9E6] bg-[#F7F7F5] px-2 py-1 text-[11.5px] font-medium text-[#6F6E69] dark:border-[#2E2E2E] dark:bg-[#161616] dark:text-[#A1A1A1]">
    {children}
  </span>
);

export const PrimaryButton = ({ children, onClick, to, type = 'button', className = '' }) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-apple bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2b2b2b] dark:bg-[#EDEDED] dark:text-[#0A0A0A] dark:hover:bg-white ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} className={cls}>{children}</button>;
};

export const SecondaryButton = ({ children, onClick, to, href, className = '' }) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-apple border border-[#E9E9E6] bg-white px-5 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F7F7F5] dark:border-[#2E2E2E] dark:bg-transparent dark:text-[#EDEDED] dark:hover:bg-[#161616] ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  return <button onClick={onClick} className={cls}>{children}</button>;
};

export const AccentButton = ({ children, onClick, to, href, className = '' }) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-apple bg-[#EC4899] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63d89] ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  return <button onClick={onClick} className={cls}>{children}</button>;
};

export const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6F6E69] dark:text-[#6E6E6E]">
      {label}
    </label>
    {children}
  </div>
);

export const inputCls =
  'w-full rounded-apple border border-[#E9E9E6] bg-white px-4 py-2.5 text-sm text-[#111111] placeholder-[#9B9A93] outline-none transition-colors focus:border-[#111111] dark:border-[#2E2E2E] dark:bg-[#0A0A0A] dark:text-[#EDEDED] dark:placeholder-[#6E6E6E] dark:focus:border-[#EDEDED]';

export const SectionLabel = ({ children }) => (
  <p className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B9A93] dark:text-[#6E6E6E]">
    {children}
  </p>
);

export const Divider = () => (
  <div className="border-t border-[#E9E9E6] dark:border-[#232323]" />
);

export const Disclosure = ({
  title,
  summary,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = React.useId();

  return (
    <section className={`border-t border-[#E9E9E6] dark:border-[#232323] ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center gap-4 py-5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="font-display block text-[17px] font-semibold tracking-tight">
            {title}
          </span>
          {summary && (
            <span className="mt-0.5 block text-[13px] text-[#6F6E69] dark:text-[#A1A1A1]">
              {summary}
            </span>
          )}
        </span>
        <FiChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-[#9B9A93] transition-transform duration-200 group-hover:text-[#111111] dark:text-[#6E6E6E] dark:group-hover:text-[#EDEDED] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div id={panelId} className="pb-9">
          {children}
        </div>
      )}
    </section>
  );
};

export const CodeBlock = ({ title, children }) => (
  <div className="codeblock">
    <div className="codeblock-header">
      <span>{title}</span>
    </div>
    <div className="codeblock-body text-[#111111] dark:text-[#EDEDED]">{children}</div>
  </div>
);
