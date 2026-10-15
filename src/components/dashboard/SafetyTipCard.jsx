import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function SafetyTipCard() {
  const { setCurrentView, t } = useApp();

  return (
    <div 
      onClick={() => setCurrentView('guide')}
      className="bg-blue-50/70 hover:bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200/80 cursor-pointer transition-all flex items-start gap-3.5 group shadow-xs"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            {t.safetyTip}
          </span>
          <span className="text-xs text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>{t.safetyGuide}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
          {t.safetyTipContent}
        </p>
      </div>
    </div>
  );
}
