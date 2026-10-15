import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  LogIn, 
  Settings, 
  Loader2, 
  RefreshCw,
  Clock,
  Terminal
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { token, apiBase } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/admin/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        throw new Error('Failed to fetch administrative audit logs');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'USER_SUSPENDED':
        return { label: 'User Suspended', bg: 'bg-red-50 text-red-700 border-red-200', icon: UserX };
      case 'USER_ACTIVATED':
        return { label: 'User Reactivated', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserCheck };
      case 'ADMIN_LOGIN':
        return { label: 'Admin Login', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: LogIn };
      case 'SYSTEM_INITIALIZATION':
        return { label: 'System Init', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Settings };
      default:
        return { label: action, bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: ShieldCheck };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Administrative Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cryptographically sealed server log tracking all privileged administrative actions and account moderation.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="self-start sm:self-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading security audit trail...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Operation Action</th>
                  <th className="py-3 px-3">Administrator</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-3">Operation Details</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const badge = getActionBadge(log.action);
                    const Icon = badge.icon;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            <Icon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Admin Email */}
                        <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {log.admin_email}
                        </td>

                        {/* Target */}
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {log.target_type} {log.target_id ? `(#${log.target_id})` : ''}
                        </td>

                        {/* Details */}
                        <td className="py-3 px-3 max-w-xs font-mono text-[11px] text-slate-600 truncate">
                          {log.details || '—'}
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No administrative audit logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
