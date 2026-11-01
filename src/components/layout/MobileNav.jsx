import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, ScanLine, ShieldCheck, UserRound } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Home', icon: Home },
  { id: 'analyze', mode: 'screenshot', label: 'Scanner', icon: ScanLine },
  { id: 'guide', label: 'Shield', icon: ShieldCheck },
  { id: 'settings', label: 'Profile', icon: UserRound },
];

export default function MobileNav() {
  const { currentView, setCurrentView, setAnalyzeMode } = useApp();
  const navigate = (tab) => {
    if (tab.mode) setAnalyzeMode(tab.mode);
    setCurrentView(tab.id);
  };
  return <nav className="app-mobile-nav" aria-label="Mobile navigation">
    {tabs.map(({ id, mode, label, icon: Icon }) => {
      const active = mode ? currentView === 'analyze' || currentView === 'results' : currentView === id;
      return <button type="button" key={id} className="app-mobile-tab" aria-label={label} aria-current={active ? 'page' : undefined} onClick={() => navigate({ id, mode })}><Icon aria-hidden="true" /><span>{label}</span></button>;
    })}
  </nav>;
}
