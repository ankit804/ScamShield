import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  AlertTriangle, 
  FileImage, 
  MessageSquare, 
  Globe, 
  Clock 
} from 'lucide-react';

export default function RecentActivityCard() {
  const { history, setCurrentResult, setCurrentView, t } = useApp();

  const recentItems = history.slice(0, 4);

  const getIcon = (type) => {
    switch (type) {
      case 'screenshot':
        return FileImage;
      case 'url':
        return Globe;
      default:
        return MessageSquare;
    }
  };

  const getRiskBadge = (category) => {
    switch (category) {
      case 'high':
        return {
          label: t.highConcern,
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500'
        };
      case 'review':
        return {
          label: t.needsVerification,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      default:
        return {
          label: t.noMajorWarnings,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
    }
  };

  const handleItemClick = (item) => {
    setCurrentResult(item);
    setCurrentView('results');
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
            {t.recentActivity}
          </h2>
          <button
            onClick={() => setCurrentView('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>{t.viewAllActivity}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Activity list */}
        <div className="divide-y divide-slate-100 mt-2">
          {recentItems.map((item) => {
            const Icon = getIcon(item.type);
            const risk = getRiskBadge(item.riskCategory);

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {item.submittedItem}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${risk.bg}`}>
                        <span className={`w-1 h-1 rounded-full ${risk.dot}`} />
                        {risk.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item.dateFormatted.split(',')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
