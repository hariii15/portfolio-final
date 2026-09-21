import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../theme/ThemeContext';

const links = [
  { to: '/hero', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'Skills' },
  { to: '/acheivements', label: 'Achievements' },
  { to: '/contact', label: 'Contact' },
  { to: '/blog', label: 'Blog' },
];

const TopBar = () => {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9E9E6] bg-white dark:border-[#232323] dark:bg-[#0A0A0A]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <button
          onClick={() => navigate('/hero')}
          className="flex items-center gap-2.5 text-left"
          aria-label="Home"
        >
          
          <span className="hidden text-[13px] font-semibold tracking-tight sm:block">
            Hariharpradeep J
          </span>
          <span className="mono hidden text-[11px] text-[#9B9A93] dark:text-[#6E6E6E] md:block">
            / portfolio
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-[8px] px-3 py-1.5 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#EC4899]'
                    : 'text-[#6F6E69] hover:bg-[#F7F7F5] hover:text-[#111111] dark:text-[#A1A1A1] dark:hover:bg-[#161616] dark:hover:text-[#EDEDED]'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E9E9E6] text-[#6F6E69] transition-colors hover:bg-[#F7F7F5] hover:text-[#111111] dark:border-[#2E2E2E] dark:text-[#A1A1A1] dark:hover:bg-[#161616] dark:hover:text-[#EDEDED]"
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <Link
            to="/contact"
            className="hidden rounded-[10px] bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#2b2b2b] dark:bg-[#EDEDED] dark:text-[#0A0A0A] dark:hover:bg-white sm:block"
          >
            Get in touch
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E9E9E6] text-[#111111] dark:border-[#2E2E2E] dark:text-[#EDEDED] lg:hidden"
          >
            {open ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#E9E9E6] bg-white px-5 py-3 dark:border-[#232323] dark:bg-[#0A0A0A] lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-[10px] px-3 py-2.5 text-[14px] font-medium ${
                    isActive
                      ? 'bg-[#F7F7F5] text-[#EC4899] dark:bg-[#161616]'
                      : 'text-[#37352F] dark:text-[#A1A1A1]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

const Layout = () => {
  const location = useLocation();
  const isStandalone = location.pathname === '/' || location.pathname.startsWith('/admin');

  if (isStandalone) return <Outlet />;

  return (
    <div className="min-h-screen bg-white text-[#111111] dark:bg-[#0A0A0A] dark:text-[#EDEDED]">
      <TopBar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-[#E9E9E6] dark:border-[#232323]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="mono text-[12px] text-[#9B9A93] dark:text-[#6E6E6E]">
            Hariharpradeep J — AI &amp; Full-Stack Developer
          </p>
          <div className="flex items-center gap-4 text-[13px] font-medium text-[#6F6E69] dark:text-[#A1A1A1]">
            <a href="https://github.com/hariii15" target="_blank" rel="noopener noreferrer" className="hover:text-[#EC4899]">GitHub</a>
            <a href="https://www.linkedin.com/in/hari2a" target="_blank" rel="noopener noreferrer" className="hover:text-[#EC4899]">LinkedIn</a>
            <Link to="/blog" className="hover:text-[#EC4899]">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
