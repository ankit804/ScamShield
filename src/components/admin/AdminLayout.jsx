import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Users, ScanSearch, ClipboardList, Shield, LogOut, Menu, X } from 'lucide-react';

const tabs = [
  { id: 'admin-overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'admin-users', label: 'Users', icon: Users },
  { id: 'admin-scans', label: 'Scans', icon: ScanSearch },
  { id: 'admin-audit', label: 'Audit log', icon: ClipboardList },
];

export default function AdminLayout({ activeTab, onSelectTab, children }) {
  const { user, logout } = useAuth();
  const { setCurrentView } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (tab) => { onSelectTab(tab); setMobileOpen(false); };

  return (
    <div className="min-h-screen bg-[#F4F6F9] lg:flex">
      {mobileOpen && <button aria-label="Close admin menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#142D4E] text-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <button onClick={() => navigate('admin-overview')} className="flex items-center gap-3 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600"><Shield className="h-5 w-5" /></span>
            <span><strong className="block">ScamShield</strong><small className="text-indigo-200">Admin console</small></span>
          </button>
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Admin navigation">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} aria-current={activeTab === id ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${activeTab === id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}><Icon className="h-4 w-4" />{label}</button>)}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold">{user?.full_name || 'Administrator'}</p>
          <p className="mb-3 truncate text-xs text-slate-300">{user?.email}</p>
          <button onClick={() => { logout(); setCurrentView('login'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"><LogOut className="h-4 w-4" />Sign out</button>
          <button onClick={() => setCurrentView('overview')} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-slate-400 hover:bg-white/10 hover:text-white">Return to ScamShield</button>
        </div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} aria-label="Open admin menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <span className="text-sm font-semibold text-slate-700">Platform administration</span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Admin</span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
