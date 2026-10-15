import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useApp();

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs sm:text-sm border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
