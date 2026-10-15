import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  Menu, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function Topbar({ onOpenSidebar }) {
  const { 
    currentView, 
    setCurrentView, 
    language, 
    setLanguage, 
    t, 
    searchQuery, 
    setSearchQuery 
  } = useApp();

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

      {/* Right side: Language Switcher, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 ml-2">
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

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              AS
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-none">Ankit Sharma</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{t.userRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Ankit Sharma</p>
                <p className="text-[11px] text-slate-500">ankit.seller@example.np</p>
              </div>
              <button 
                onClick={() => { setCurrentView('settings'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium"
              >
                {t.settings}
              </button>
              <button 
                onClick={() => { setCurrentView('guide'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium"
              >
                {t.safetyGuide}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
