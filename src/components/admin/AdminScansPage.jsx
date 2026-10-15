import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ScanSearch, 
  FileImage, 
  MessageSquare, 
  Globe, 
  Eye, 
  Filter, 
  X, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Lock
} from 'lucide-react';

export default function AdminScansPage() {
  const { token, apiBase } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Inspection modal
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (riskFilter !== 'all') params.append('risk', riskFilter);

      const res = await fetch(`${apiBase}/admin/scans?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setScans(data);
      } else {
        throw new Error('Failed to fetch platform scan records');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [typeFilter, riskFilter]);

  const getIcon = (type) => {
    switch (type) {
      case 'screenshot': return FileImage;
      case 'url': return Globe;
      default: return MessageSquare;
    }
  };

  const getRiskBadge = (category) => {
    switch (category) {
      case 'high':
        return { label: 'High Concern', bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
      case 'review':
        return { label: 'Needs Verification', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      default:
        return { label: 'No Major Warning Signs', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Platform Scan Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect threat detections across the platform while strictly maintaining merchant privacy safeguards.
          </p>
        </div>

        <button
          onClick={fetchScans}
          className="self-start sm:self-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Reload Scans</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Privacy Safeguard Notice */}
      <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-200/80 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong className="font-semibold">Privacy Protection Safeguard Active:</strong> Raw customer screenshots, bank account numbers, and personal SMS bodies are masked to prevent unauthorized administrative surveillance. Only sanitized detection metadata and heuristic signatures are stored.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Scan Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="screenshot">Payment Screenshot</option>
              <option value="message">Suspicious Message</option>
              <option value="url">Suspicious URL</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Concern</option>
              <option value="review">Needs Verification</option>
              <option value="safe">No Major Warnings</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-medium">
          Showing <strong className="text-slate-700">{scans.length}</strong> recorded scans
        </span>
      </div>

      {/* Scans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading scan metadata...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-3">Sanitized Description</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Risk Assessment</th>
                  <th className="py-3 px-3 text-center">Evidence</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scans.length > 0 ? (
                  scans.map((s) => {
                    const Icon = getIcon(s.type);
                    const risk = getRiskBadge(s.risk_category);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-700">{s.type_label}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 max-w-xs truncate font-medium text-slate-900">
                          {s.submitted_item}
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          User #{s.user_id}
                        </td>

                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {s.dateFormatted || new Date(s.created_at).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${risk.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                            <span>{risk.label}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {s.evidence_found} / {s.total_indicators}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedScan(s)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 rounded-md text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No scan records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scan Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scan Audit #{selectedScan.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5 font-heading">
                  Detection Findings Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Submitted Item:</span>
                <p className="font-semibold text-slate-800 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {selectedScan.submitted_item}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold">Summary:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">
                  {selectedScan.summary}
                </p>
              </div>

              {selectedScan.findings && selectedScan.findings.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block">
                    Documented Threat Signatures ({selectedScan.findings.length}):
                  </span>
                  {selectedScan.findings.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{f.title}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full uppercase ${
                          f.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {f.severity}
                        </span>
                      </div>
                      {f.evidence && (
                        <p className="font-mono text-[11px] text-slate-600 italic">
                          {f.evidence}
                        </p>
                      )}
                      <p className="text-slate-600 text-[11px]">
                        {f.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Oversight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
