import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function WarningSignCard({ finding }) {
  const isHigh = finding.severity === 'high';
  const isMed = finding.severity === 'medium';

  const severityBadge = isHigh ? {
    label: "High",
    bg: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    iconBg: "bg-red-50 text-red-600"
  } : isMed ? {
    label: "Medium",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-600"
  } : {
    label: "Low",
    bg: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    iconBg: "bg-slate-50 text-slate-600"
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
      {/* Title & Severity Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${severityBadge.iconBg} flex items-center justify-center shrink-0`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug font-heading">
            {finding.title}
          </h4>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severityBadge.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${severityBadge.dot}`} />
          <span>{severityBadge.label}</span>
        </span>
      </div>

      {/* Extracted Evidence */}
      {finding.evidence && (
        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/60 font-mono text-xs text-slate-800 leading-relaxed italic">
          {finding.evidence}
        </div>
      )}

      {/* Explanation */}
      <p className="text-xs text-slate-600 leading-relaxed">
        {finding.explanation}
      </p>

      {/* Recommended Action */}
      {finding.recommended && (
        <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-blue-900 font-medium">
          <span className="font-bold text-blue-700 shrink-0">Recommended:</span>
          <span>{finding.recommended}</span>
        </div>
      )}
    </div>
  );
}
