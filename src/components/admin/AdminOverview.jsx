import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  ScanSearch, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  RefreshCw 
} from 'lucide-react';

export default function AdminOverview({ onNavigate }) {
  const { token, apiBase } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        throw new Error('Failed to load administrator statistics');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading platform database metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Platform Security & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time aggregate data across all registered merchants and scan operations.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="self-start sm:self-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 5 Compact Real Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-heading">
              {stats?.total_users ?? 0}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats?.active_users ?? 0} Active / {stats?.suspended_users ?? 0} Suspended
            </div>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Platform Scans</span>
            <ScanSearch className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-heading">
              {stats?.total_scans ?? 0}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              All detection runs
            </div>
          </div>
        </div>

        {/* High Concern */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">High Concern</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-red-600 font-heading">
              {stats?.high_concern_scans ?? 0}
            </span>
            <div className="text-[10px] text-red-500 font-medium mt-0.5">
              Fraud indicators present
            </div>
          </div>
        </div>

        {/* Review Needed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Needs Verification</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-amber-600 font-heading">
              {stats?.review_scans ?? 0}
            </span>
            <div className="text-[10px] text-amber-600 font-medium mt-0.5">
              Manual review recommended
            </div>
          </div>
        </div>

        {/* 24h Activity */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">24h Activity</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-heading">
              {stats?.recent_scans_24h ?? 0}
            </span>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              Recent submissions
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('admin-users')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            User Accounts Moderation
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Inspect all registered merchants, filter accounts, and suspend or reactivate access.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <span>Open User Management</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('admin-scans')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ScanSearch className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Platform Scan Oversight
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Review detection findings, examine flagged risk categories, and oversee false positives safely.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
            <span>Inspect Scans</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('admin-audit')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
            Administrative Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Trace sensitive administrative changes, user suspensions, and security authentications.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-700">
            <span>View Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
