import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PhoneCall, MessageSquareText, Globe2, FileText, Settings, Shield, HelpCircle, X, ShieldCheck, LogIn } from 'lucide-react';

const navItems = [
  { view: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'analyze', mode: 'screenshot', label: 'Call Scanner', icon: PhoneCall },
  { view: 'analyze', mode: 'message', label: 'SMS & Link Checker', icon: MessageSquareText },
  { view: 'analyze', mode: 'url', label: 'Website Checker', icon: Globe2 },
  { view: 'history', label: 'Reports', icon: FileText },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { currentView, setCurrentView, analyzeMode, setAnalyzeMode } = useApp();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const initials = user?.full_name?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'SS';
  const navigate = (item) => {
    if (item.mode) setAnalyzeMode(item.mode);
    setCurrentView(item.view);
    onClose?.();
  };

  return <>
    {isOpen && <button className="app-sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <button className="app-brand" onClick={() => navigate({ view: 'overview' })} aria-label="Scam Shield dashboard">
        <span className="app-brand-mark"><Shield className="h-5 w-5" /></span>
        <span><span className="app-brand-name">Scam Shield</span><span className="app-brand-caption">Merchant protection</span></span>
      </button>
      <nav className="app-nav">
        {navItems.map(({ view, mode, label, icon: Icon }) => {
          const active = mode ? mode === analyzeMode && (currentView === 'analyze' || currentView === 'results') : currentView === view;
          return <button type="button" key={label} aria-current={active ? 'page' : undefined} onClick={() => navigate({ view, mode })} className="app-nav-button"><Icon aria-hidden="true" /><span>{label}</span></button>;
        })}
        {isAdmin && <button type="button" aria-current={currentView.startsWith('admin') ? 'page' : undefined} onClick={() => navigate({ view: 'admin' })} className="app-nav-button"><ShieldCheck aria-hidden="true" /><span>Admin Console</span></button>}
      </nav>
      <div className="app-sidebar-bottom">
        <div className="app-side-help"><div className="app-side-help-title"><HelpCircle className="h-4 w-4" />Need help?</div><p>Use your bank or wallet’s own transaction history to confirm every payment.</p></div>
        {isAuthenticated ? <button type="button" onClick={() => navigate({ view: 'settings' })} className="app-profile"><span className="app-avatar">{initials}</span><span><strong>{user?.full_name || 'Merchant'}</strong><small>{isAdmin ? 'Security admin' : 'Protected account'}</small></span></button> : <button type="button" className="app-nav-button" onClick={() => navigate({ view: 'login' })}><LogIn className="h-4 w-4" /><span>Merchant sign in</span></button>}
      </div>
      <button type="button" onClick={onClose} aria-label="Close navigation" className="app-sidebar-close"><X className="h-5 w-5" /></button>
    </aside>
  </>;
}
