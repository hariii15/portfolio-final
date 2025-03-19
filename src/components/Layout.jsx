import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Dock from './navbar';
import { VscHome, VscFile, VscGraph, VscBook, VscMortarBoard } from 'react-icons/vsc'; // Add VscMortarBoard icon

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => navigate('/hero') },
    { icon: <VscFile size={18} />, label: 'Projects', onClick: () => navigate('/projects') },
    { icon: <VscGraph size={18} />, label: 'Skills', onClick: () => navigate('/about') },
    { icon: <VscMortarBoard size={18} />, label: 'Certificates', onClick: () => navigate('/certificates') }, // New item
    { icon: <VscBook size={18} />, label: 'Contact', onClick: () => navigate('/contact') },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
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
