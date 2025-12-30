import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { id: AppView.EDITOR, label: 'Image Editor', icon: '🎨' },
    { id: AppView.AI_IMAGE, label: 'AI Image Gen', icon: '✨' },
    { id: AppView.AI_VIDEO, label: 'AI Video Gen', icon: '🎬' },
    { id: AppView.ID_PHOTO, label: 'ID Photo Maker', icon: '🪪' },
    { id: AppView.COLLAGE, label: 'Collage Maker', icon: '🧩' },
    { id: AppView.HISTORY, label: 'My Gallery', icon: '📁' },
  ];

  const handleNav = (id: AppView) => {
    setView(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PixelForge AI
          </h1>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400">
            ✕
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${currentView === item.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-6">
          <div className="bg-slate-800 rounded-lg p-4 text-xs text-slate-400 border border-slate-700">
            <p className="font-semibold text-slate-300 mb-1">Free Tier</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-blue-500 w-3/4 h-full rounded-full"></div>
            </div>
            <p>12/20 Credits Used</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
