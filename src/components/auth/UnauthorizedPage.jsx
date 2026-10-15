import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="bg-white rounded-2xl border border-red-200/90 shadow-sm max-w-md w-full p-8 space-y-5">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50/60">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            You are signed in as a standard merchant user. The administrative oversight dashboard is restricted exclusively to authorized security administrators.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setCurrentView('overview')}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to User Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
