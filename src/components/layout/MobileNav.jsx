import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ScanSearch, 
  History, 
  BookOpen, 
  Settings 
} from 'lucide-react';

export default function MobileNav() {
  const { currentView, setCurrentView, t } = useApp();

  const navItems = [
    { id: 'overview', label: t.overview, icon: LayoutDashboard },
    { id: 'analyze', label: t.analyze, icon: ScanSearch },
    { id: 'history', label: t.scanHistory, icon: History },
    { id: 'guide', label: t.safetyGuide, icon: BookOpen },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'analyze' && currentView === 'results');

        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors flex-1
              ${isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'}
            `}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
