import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Dock from './navbar';
import { VscHome, VscFile, VscGraph, VscBook, VscMortarBoard } from 'react-icons/vsc';
import { FiBookOpen } from 'react-icons/fi';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => navigate('/hero') },
    { icon: <VscFile size={18} />, label: 'Projects', onClick: () => navigate('/projects') },
    { icon: <VscGraph size={18} />, label: 'Skills', onClick: () => navigate('/about') },
    { icon: <VscMortarBoard size={18} />, label: 'Acheivements', onClick: () => navigate('/acheivements') },
    { icon: <VscBook size={18} />, label: 'Contact', onClick: () => navigate('/contact') },
  ];

  const isBlogOrAdmin = location.pathname.startsWith('/blog') || location.pathname.startsWith('/admin') || location.pathname === '/';

  return (
    <div className="min-h-screen text-white relative">
      {/* Top Left Blog Link */}
      {!isBlogOrAdmin && (
        <div className="fixed top-8 left-8 z-50">
          <Link
            to="/blog"
            className="group relative inline-flex items-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/45 hover:text-white transition-colors duration-300"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Read My Blog
            <span className="absolute left-0 bottom-[-6px] w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
      )}

      <main className="pb-24">
        <Outlet />
      </main>
      {location.pathname !== '/' && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Dock
            items={items}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
          />
        </div>
      )}
    </div>
  );
};

export default Layout;
