import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function Toast({ toast, mobile = false }) {
  if (!toast) return null;
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'warning' ? AlertTriangle : Info;
  return <div role="status" className={`app-toast ${mobile ? 'app-toast-mobile' : ''}`}><Icon className="h-4 w-4 shrink-0" /><span>{toast.message}</span></div>;
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentView, toast } = useApp();
  const isAuthPage = currentView === 'login' || currentView === 'register';

  if (isAuthPage) return <div className="app-shell app-auth min-h-screen"><main className="app-auth-main">{children}</main><Toast toast={toast} /></div>;

  return <div className="app-shell min-h-screen">
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="app-workspace">
      <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
      <main className="app-main app-content animate-slide-in-bottom">{children}</main>
    </div>
    <MobileNav />
    <Toast toast={toast} mobile />
  </div>;
}
