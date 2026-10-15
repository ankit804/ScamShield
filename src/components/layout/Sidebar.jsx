import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ScanSearch, 
  History, 
  BookOpen, 
  Settings, 
  Shield, 
  HelpCircle,
  ExternalLink,
  X,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { currentView, setCurrentView, t, language } = useApp();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { id: 'overview', label: t.overview, icon: LayoutDashboard },
    { id: 'analyze', label: t.analyze, icon: ScanSearch },
    { id: 'history', label: t.scanHistory, icon: History },
    { id: 'guide', label: t.safetyGuide, icon: BookOpen },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    if (onClose) onClose();
  };

  const initials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'AS';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#142D4E] text-white flex flex-col justify-between
        transition-transform duration-300 ease-in-out border-r border-[#1B3B66]
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand / Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#1C3B64]">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick('overview')}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/40 group-hover:bg-blue-500 transition-colors">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white leading-tight font-heading">
                  {t.brand}
                </span>
                <span className="text-[11px] font-medium tracking-wide text-blue-300 uppercase leading-none mt-0.5">
                  {t.brandSubtitle}
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'analyze' && currentView === 'results');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                    ${isActive 
                      ? 'bg-[#2563EB] text-white shadow-sm font-semibold' 
                      : 'text-slate-300 hover:bg-[#1C3A62] hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Admin Portal Shortcut if user is Admin */}
            {isAdmin && (
              <div className="pt-2 mt-2 border-t border-[#1C3B64]">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold transition-all text-left
                    ${currentView === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-indigo-300 hover:bg-indigo-950/60 hover:text-white'
                    }
                  `}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#1C3B64] space-y-3">
          {/* Help box */}
          <div className="bg-[#0F223D] rounded-xl p-3 border border-[#1E3E6B]">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">{t.needHelp}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {t.needHelpDesc}
            </p>
          </div>

          {/* User Profile or Sign In prompt */}
          {isAuthenticated ? (
            <div 
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-3 pt-1 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className={`w-9 h-9 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-semibold text-xs shadow-inner ${
                isAdmin ? 'bg-indigo-600' : 'bg-blue-600'
              }`}>
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.full_name || 'Ankit Sharma'}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {isAdmin ? 'Security Admin' : t.userRole}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="w-full py-2 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-blue-500/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Merchant Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

