import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricCard from './MetricCard';
import QuickScanCard from './QuickScanCard';
import RecentActivityCard from './RecentActivityCard';
import SafetyTipCard from './SafetyTipCard';
import NepalHimalayaBanner from './NepalHimalayaBanner';
import { 
  ScanSearch, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

export default function DashboardPage() {
  const { setCurrentView, t, history } = useApp();

  const flaggedCount = history.filter(h => h.riskCategory === 'high').length + 20; // illustrative demo
  const reviewCount = history.filter(h => h.riskCategory === 'review').length + 6;
  const totalCount = history.length + 122;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
            {t.greeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentView('analyze')}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <ScanSearch className="w-4 h-4" />
              <span>{t.btnAnalyze}</span>
            </button>
            <button
              onClick={() => setCurrentView('guide')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>{t.btnViewGuide}</span>
            </button>
          </div>
        </div>

        {/* Nepal Himalaya Fintech Banner */}
        <div className="w-full md:w-auto md:min-w-[340px] lg:min-w-[400px]">
          <NepalHimalayaBanner />
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title={t.totalScans}
          value={totalCount}
          subtext="Illustrative demo data"
          icon={CheckCircle}
          color="blue"
        />
        <MetricCard
          title={t.flaggedCases}
          value={flaggedCount}
          subtext="Requires extreme caution"
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title={t.casesRequiringReview}
          value={reviewCount}
          subtext="Unverified transfer claims"
          icon={AlertCircle}
          color="amber"
        />
        <MetricCard
          title={t.recentActivity}
          value="12"
          subtext="Processed in last 24h"
          icon={Clock}
          color="teal"
        />
      </div>

      {/* Two-Column Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Quick Scan */}
        <QuickScanCard />

        {/* Right Column: Recent Activity & Safety Tip */}
        <div className="space-y-4">
          <RecentActivityCard />
          <SafetyTipCard />
        </div>
      </div>
    </div>
  );
}
