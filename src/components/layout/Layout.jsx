import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const app = useApp() || {};
  const { currentView, toast } = app;

  // Check if current page is Auth (Login / Register)
  const isAuthPage = currentView === 'login' || currentView === 'register';

  // If on Login/Register page, render full screen auth page WITHOUT Sidebar and Topbar
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center p-4 font-sans text-slate-900 animate-fade-in">
        <main className="w-full max-w-md mx-auto">
          {children}
        </main>
        
        {/* Toast Notification if needed */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#111827] text-white rounded-xl shadow-2xl text-xs sm:text-sm border border-slate-800 animate-slide-in-bottom">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Regular Application Layout with Sidebar and Topbar
  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans text-slate-900 animate-fade-in">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 animate-slide-in-bottom">
          {children}
        </main>
      </div>

      <MobileNav />

      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#111827] text-white rounded-xl shadow-2xl text-xs sm:text-sm border border-slate-800 animate-slide-in-bottom">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}