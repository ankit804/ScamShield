import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Menu, LogOut, LayoutDashboard, ShieldCheck, FileText } from 'lucide-react';

const pageTitles = { overview: 'Home Screen', analyze: 'Security Scanner', results: 'Scan Results', history: 'Reports', guide: 'Safety Center', settings: 'Settings' };

export default function Topbar({ onOpenSidebar }) {
  const { currentView, setCurrentView, language, setLanguage, searchQuery, setSearchQuery, showToast, history } = useApp();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const initials = user?.full_name?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'SS';
  const notifications = history.slice(0, 3).map((item, index) => ({
    id: item.id || index,
    title: item.submittedItem || item.submitted_item || item.typeLabel || 'Recent scan completed',
    time: item.dateFormatted || (item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'),
    risk: item.riskCategory || item.risk_category || 'safe'
  }));
  if (!notifications.length) notifications.push({ id: 'welcome', title: 'Your Scam Shield protection is ready', time: 'Start with a message or link scan', risk: 'safe' });

  const handleLogout = () => { logout(); setShowUserMenu(false); showToast('Signed out successfully', 'info'); setCurrentView('login'); };
  return <header className="app-topbar">
    <button className="app-icon-button app-mobile-menu" type="button" aria-label="Open navigation menu" onClick={onOpenSidebar}><Menu /></button>
    <h1 className="app-topbar-title">{pageTitles[currentView] || 'Scam Shield'}</h1>
    <label className="app-search"><Search aria-hidden="true" /><input aria-label="Search Scam Shield" type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search..." /></label>
    <div className="app-topbar-actions">
      <button type="button" className="language-toggle app-icon-button" aria-label="Switch language" onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}><span className="text-[10px] font-bold">{language === 'en' ? 'EN' : 'ने'}</span></button>
      {isAdmin && <button type="button" onClick={() => setCurrentView('admin')} className="app-admin-shortcut app-icon-button" aria-label="Open admin console"><ShieldCheck className="h-4 w-4" /></button>}
      <div className="app-user-wrap">
        <button type="button" className="app-icon-button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}><Bell className="h-4 w-4" /><span className="app-notification-dot" /></button>
        {showNotifications && <div className="app-popover" role="dialog" aria-label="Recent activity"><p className="app-popover-title">Recent activity</p>{notifications.map(item => <div className="app-popover-item" key={item.id}><strong className="block text-slate-100">{item.title}</strong><span>{item.time}</span></div>)}<button type="button" onClick={() => { setCurrentView('history'); setShowNotifications(false); }} className="app-popover-action"><FileText className="h-3.5 w-3.5" />View reports</button></div>}
      </div>
      <div className="app-user-wrap">
        <button type="button" className="app-avatar app-avatar-large" aria-label="User profile menu" aria-expanded={showUserMenu} onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>{initials}</button>
        {showUserMenu && <div className="app-popover app-user-menu" role="menu"><p className="app-popover-title">{user?.full_name || 'Guest'}</p>{isAdmin && <button type="button" role="menuitem" onClick={() => { setCurrentView('admin'); setShowUserMenu(false); }}>Admin console</button>}<button type="button" role="menuitem" onClick={() => { setCurrentView('overview'); setShowUserMenu(false); }}><LayoutDashboard className="h-3.5 w-3.5" />Dashboard</button><button type="button" role="menuitem" onClick={() => { setCurrentView('settings'); setShowUserMenu(false); }}>Settings</button>{isAuthenticated ? <button type="button" role="menuitem" onClick={handleLogout}><LogOut className="h-3.5 w-3.5" />Sign out</button> : <button type="button" role="menuitem" onClick={() => { setCurrentView('login'); setShowUserMenu(false); }}>Sign in</button>}</div>}
      </div>
    </div>
  </header>;
}
