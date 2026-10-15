import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Bell, 
  Menu, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ShieldAlert,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Topbar({ onOpenSidebar }) {
  const { 
    currentView, 
    setCurrentView, 
    language, 
    setLanguage, 
    t, 
    searchQuery, 
    setSearchQuery,
    showToast 
  } = useApp();

  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const demoAlerts = [
    {
      id: 1,
      title: "New eSewa fake receipt pattern reported",
      time: "10 mins ago",
      type: "warning"
    },
    {
      id: 2,
      title: "Security guide updated: QR substitution tactics",
      time: "2 hours ago",
      type: "info"
    },
    {
      id: 3,
      title: "Suspicious Khalti SMS format flagged in New Road",
      time: "Yesterday",
      type: "warning"
    }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    showToast('Signed out successfully', 'info');
    setCurrentView('login');
  };

  const initials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'AS';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Mobile menu toggle + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#F7F9FC] border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right side: Admin Pill, Language, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 ml-2">
        {/* Admin Quick Switch if user is Admin */}
        {isAdmin && (
          <button
            onClick={() => setCurrentView('admin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </button>
        )}

        {/* Language selector toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          title="Switch Language / भाषा परिवर्तन गर्नुहोस्"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span className={language === 'en' ? 'text-blue-600' : 'text-slate-500'}>EN</span>
          <span className="text-slate-300">/</span>
          <span className={language === 'ne' ? 'text-blue-600 font-bold' : 'text-slate-500'}>नेपाली</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.notifications}</span>
                <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2">
                {demoAlerts.map(alert => (
                  <div key={alert.id} className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/50 transition-colors flex items-start gap-2.5 text-xs">
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-slate-800 leading-tight">{alert.title}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile or Guest Login */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full text-white font-semibold text-xs flex items-center justify-center shadow-xs ${
                isAdmin ? 'bg-indigo-600' : 'bg-blue-600'
              }`}>
                {initials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-none">
                  {user?.full_name || 'Merchant'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {isAdmin ? 'Security Admin' : t.userRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{user?.full_name}</p>
                    {isAdmin && (
                      <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => { setCurrentView('admin'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-indigo-700 font-bold flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                <button 
                  onClick={() => { setCurrentView('overview'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium"
                >
                  {t.overview}
                </button>
                <button 
                  onClick={() => { setCurrentView('history'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium"
                >
                  {t.scanHistory}
                </button>
                <button 
                  onClick={() => { setCurrentView('settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium"
                >
                  {t.settings}
                </button>
                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentView('login')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs hidden sm:flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

