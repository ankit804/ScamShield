import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user, isAuthenticated, token, apiBase } = useAuth();

  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchUserStats = async () => {
      try {
        const res = await fetch(`${apiBase}/users/me/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserStats(data);
        }
      } catch (err) {
        // Fall back to local state
      }
    };

    fetchUserStats();
  }, [isAuthenticated, token, apiBase]);

  // If user has real DB stats, use them; otherwise use illustrative demo baseline
  const totalCount = userStats ? userStats.total_scans : history.length + 122;
  const flaggedCount = userStats ? userStats.high_concern_count : history.filter(h => h.riskCategory === 'high').length + 20;
  const reviewCount = userStats ? userStats.review_count : history.filter(h => h.riskCategory === 'review').length + 6;

  const greeting = user?.full_name 
    ? `Welcome back, ${user.full_name.split(' ')[0]} 👋` 
    : t.greeting;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
            {greeting}
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
          subtext={userStats ? "Your account scans" : "Illustrative demo data"}
          icon={CheckCircle}
          color="blue"
        />
        <MetricCard
          title={t.flaggedCases}
          value={flaggedCount}
          subtext={userStats ? "High concern in your history" : "Requires extreme caution"}
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title={t.casesRequiringReview}
          value={reviewCount}
          subtext={userStats ? "Pending verification" : "Unverified transfer claims"}
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
