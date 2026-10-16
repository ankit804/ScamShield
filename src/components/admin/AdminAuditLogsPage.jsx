import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react';

const actionStyle = (action) => action?.includes('SUSPENDED') ? 'bg-red-50 text-red-700' : action?.includes('ACTIVATED') ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700';

export default function AdminAuditLogsPage() {
  const { token, apiBase } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchLogs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${apiBase}/admin/audit-logs`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error((await response.json()).detail || 'Could not load audit history.');
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message || 'Could not connect to the server.'); }
    finally { setLoading(false); }
  }, [apiBase, token]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return <section className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-slate-900">Administrative audit trail</h1><p className="mt-1 text-sm text-slate-500">Recorded administrator logins and account moderation actions.</p></div><button onClick={fetchLogs} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {loading ? <div className="p-12 text-center text-slate-500"><Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" /><p className="mt-2 text-sm">Loading audit history…</p></div> : logs.length === 0 ? <div className="p-12 text-center"><ClipboardList className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-700">No audit events recorded</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Administrator</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">IP address</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map((log) => <tr key={log.id} className="align-top"><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${actionStyle(log.action)}`}>{(log.action || 'UNKNOWN').replaceAll('_', ' ')}</span></td><td className="px-4 py-3 text-slate-700">{log.admin_email}</td><td className="px-4 py-3 text-slate-600">{log.target_type}{log.target_id ? ` #${log.target_id}` : ''}</td><td className="max-w-sm px-4 py-3 text-xs text-slate-500">{log.details || '—'}</td><td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td><td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ip_address || '—'}</td></tr>)}</tbody></table></div>}
    </div>
  </section>;
}
