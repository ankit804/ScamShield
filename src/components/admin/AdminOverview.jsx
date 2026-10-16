import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, ScanSearch, Users, UserCheck } from 'lucide-react';

const metrics = [
  ['Registered users', 'total_users', Users], ['Active users', 'active_users', UserCheck],
  ['Total scans', 'total_scans', ScanSearch], ['High concern', 'high_concern_scans', AlertTriangle],
  ['Scans in 24 hours', 'recent_scans_24h', Clock3],
];

export default function AdminOverview({ onNavigate }) {
  const { token, apiBase } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${apiBase}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error((await response.json()).detail || 'Could not load platform statistics.');
      setStats(await response.json());
    } catch (err) { setError(err.message || 'Could not connect to the server.'); }
    finally { setLoading(false); }
  }, [apiBase, token]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return <section className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-slate-900">Platform overview</h1><p className="mt-1 text-sm text-slate-500">Live account and scan totals from the service database.</p></div><button onClick={fetchStats} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading && !stats ? <div className="rounded-xl bg-white p-10 text-center text-sm text-slate-500">Loading platform statistics…</div> : stats && <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(([label, key, Icon]) => <article key={key} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="h-4 w-4 text-indigo-600" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{stats[key] ?? 0}</p></article>)}</div>
      <div className="grid gap-4 sm:grid-cols-3">{[['Users','admin-users','Review registered accounts and access status.'],['Scans','admin-scans','Inspect recorded analysis metadata.'],['Audit log','admin-audit','Review administrator actions.']].map(([label, tab, desc]) => <button key={tab} onClick={() => onNavigate(tab)} className="rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-indigo-300 hover:shadow-sm"><strong className="text-slate-900">{label}</strong><p className="mt-1 text-sm text-slate-500">{desc}</p></button>)}</div>
      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-5 text-sm"><span className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" />Safe: {stats.safe_scans ?? 0}</span><span className="text-amber-700">Needs verification: {stats.review_scans ?? 0}</span><span className="text-red-700">High concern: {stats.high_concern_scans ?? 0}</span><span className="text-slate-500">Suspended users: {stats.suspended_users ?? 0}</span></div>
    </>}
  </section>;
}
