import React from 'react';
import { useApp } from '../../context/AppContext';

export default function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  color = "blue",
  badgeText
}) {
  const { t } = useApp();

  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      dot: "bg-blue-500"
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      dot: "bg-red-500"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      dot: "bg-amber-500"
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-100",
      dot: "bg-teal-500"
    }
  }[color] || {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    dot: "bg-blue-500"
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs sm:text-sm font-medium text-slate-600 leading-snug">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg ${colorStyles.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${colorStyles.text}`} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
            {value}
          </span>
          {badgeText && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorStyles.bg} ${colorStyles.text}`}>
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${colorStyles.dot}`} />
          <span>{subtext || t.demoData}</span>
        </p>
      </div>
    </div>
  );
}
