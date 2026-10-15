import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import UnauthorizedPage from '../auth/UnauthorizedPage';
import LoginPage from '../auth/LoginPage';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  ScanSearch, 
  FileText, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function AdminLayout({ activeTab, onSelectTab, children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { setCurrentView, showToast } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  const navItems = [
    { id: 'admin-overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-scans', label: 'Scan Oversight', icon: ScanSearch },
    { id: 'admin-audit', label: 'Audit Logs', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    showToast('Signed out of administrative console', 'info');
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans -m-4 sm:-m-6 lg:-m-8">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F1E36] text-white flex flex-col justify-between
        transition-transform duration-300 ease-in-out border-r border-[#1B2F52]
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#1A335C]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-950">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight font-heading">
                  ScamShield Admin
                </span>
                <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase leading-none mt-0.5">
                  Security Console
                </span>
              </div>
            </div>

            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Navigation */}
          <nav className="p-3 space-y-1.5 mt-2">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Platform Controls
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-[#1A335C] hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#1A335C] space-y-3">
          {/* Switch to User View */}
          <button
            onClick={() => setCurrentView('overview')}
            className="w-full py-2 px-3 rounded-lg bg-[#142847] hover:bg-[#1A335C] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-[#1E3E6B]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch to Merchant View</span>
          </button>

          {/* Admin Account Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white truncate block">
                  {user?.full_name || 'Admin'}
                </span>
                <span className="text-[10px] text-indigo-300 truncate block">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                Admin Console
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">|</span>
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                {navItems.find(n => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real DB Connected</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
