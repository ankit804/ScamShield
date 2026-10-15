import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RiskSummaryBanner({ result }) {
  const { t } = useApp();

  const isHigh = result.riskCategory === 'high';
  const isReview = result.riskCategory === 'review';

  const config = isHigh ? {
    bg: 'bg-red-50/60 border-red-200/90 text-red-950',
    iconBg: 'bg-red-100 text-red-600 ring-4 ring-red-50',
    title: t.highConcern,
    icon: AlertTriangle,
    badgeBg: 'bg-red-100 text-red-800 border-red-200'
  } : isReview ? {
    bg: 'bg-amber-50/60 border-amber-200/90 text-amber-950',
    iconBg: 'bg-amber-100 text-amber-600 ring-4 ring-amber-50',
    title: t.needsVerification,
    icon: AlertCircle,
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200'
  } : {
    bg: 'bg-emerald-50/60 border-emerald-200/90 text-emerald-950',
    iconBg: 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50',
    title: t.noMajorWarnings,
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-5 border ${config.bg} shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200`}>
      <div className="flex items-start sm:items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-heading leading-tight">
            {config.title}
          </h2>
          <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Evidence Found Badge */}
      <div className="shrink-0 sm:text-right border-t sm:border-t-0 sm:border-l border-current/10 pt-3 sm:pt-0 sm:pl-6">
        <span className="text-[11px] font-medium opacity-80 block uppercase tracking-wider">
          {t.evidenceFound}
        </span>
        <div className="flex items-baseline sm:justify-end gap-1.5 mt-0.5">
          <span className="text-2xl font-extrabold font-heading">
            {result.evidenceFound} / {result.totalIndicators}
          </span>
          <span className="text-xs font-semibold opacity-75">
            {t.indicators}
          </span>
        </div>
      </div>
    </div>
  );
}
