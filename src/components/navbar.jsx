import React from 'react';
import { NavLink } from 'react-router-dom';

// Legacy Dock replaced with a flat static nav row.
// Kept for compatibility — Layout now uses its own TopBar.
export default function Dock({ items = [] }) {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-center gap-1 px-5 pb-6">
      <div className="flex items-center gap-1 rounded-apple-lg border border-[#E9E9E6] bg-white p-1.5 dark:border-[#232323] dark:bg-[#111111]">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            title={item.label}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#6F6E69] transition-colors hover:bg-[#F7F7F5] hover:text-[#111111] dark:text-[#A1A1A1] dark:hover:bg-[#161616] dark:hover:text-[#EDEDED]"
          >
            {item.icon}
          </button>
        ))}
      </div>
    </nav>
  );
}

export const TopNavLink = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `rounded-[8px] px-3 py-1.5 text-[13.5px] font-medium ${isActive ? 'text-[#EC4899]' : 'text-[#6F6E69] dark:text-[#A1A1A1]'}`
    }
  >
    {children}
  </NavLink>
);
