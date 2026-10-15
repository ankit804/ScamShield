import React from 'react';
import { useApp } from '../../context/AppContext';
import RiskSummaryBanner from './RiskSummaryBanner';
import WarningSignCard from './WarningSignCard';
import RecommendedStepsCard from './RecommendedStepsCard';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResultsPage() {
  const { currentResult, setCurrentView, t } = useApp();

  if (!currentResult) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No analysis result selected.</p>
        <button
          onClick={() => setCurrentView('analyze')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          {t.analyzeTitle}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setCurrentView('analyze')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analyze</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
            {t.analysisResults}
          </h1>
        </div>

        <div className="text-right text-xs text-slate-400 hidden sm:block">
          <span>Ref ID: </span>
          <span className="font-mono font-medium text-slate-600">{currentResult.id}</span>
        </div>
      </div>

      {/* Top Risk Summary Banner */}
      <RiskSummaryBanner result={currentResult} />

      {/* Two Columns: Detected Warning Signs & Recommended Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Detected Warning Signs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              {t.detectedWarningSigns}
            </h3>
            <span className="text-xs text-slate-500">
              {currentResult.findings?.length || 0} items documented
            </span>
          </div>

          {currentResult.findings && currentResult.findings.length > 0 ? (
            <div className="space-y-3">
              {currentResult.findings.map((finding) => (
                <WarningSignCard key={finding.id} finding={finding} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                No active threats or tampering flags detected
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The submission passed common formatting checks. Remember that verifying funds in your own banking ledger is always recommended.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Recommended Next Steps */}
        <div className="lg:col-span-5">
          <RecommendedStepsCard result={currentResult} />
        </div>
      </div>
    </div>
  );
}
