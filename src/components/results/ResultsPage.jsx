import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import RiskSummaryBanner from './RiskSummaryBanner';
import WarningSignCard from './WarningSignCard';
import RecommendedStepsCard from './RecommendedStepsCard';

export default function ResultsPage() {
  const { currentResult, setCurrentView, t } = useApp();
  const result = currentResult;
  if (!result) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-slate-400" /><h1 className="mt-3 text-lg font-bold text-slate-900">No analysis to display</h1><p className="mt-1 text-sm text-slate-500">Submit a message, URL, or screenshot to see its results.</p><button onClick={() => setCurrentView('analyze')} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Start an analysis</button></div>;
  const findings = result.findings || [];
  const id = result.id || '—';
  const submitted = result.submittedItem || result.submitted_item || '';

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><button onClick={() => setCurrentView('analyze')} className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />{t.analyzeAnotherItem || 'New analysis'}</button><h1 className="text-2xl font-extrabold text-slate-900">Analysis results</h1><p className="mt-1 text-xs text-slate-500">{submitted} <span className="mx-1">·</span> Ref: {id}</p></div><span className="text-xs text-slate-500">{result.dateFormatted || result.created_at && new Date(result.created_at).toLocaleString()}</span></div>
    <RiskSummaryBanner result={result} />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="space-y-4 lg:col-span-7"><div><h2 className="text-lg font-bold text-slate-900">Warning signs</h2><p className="text-sm text-slate-500">{findings.length} observation{findings.length === 1 ? '' : 's'} from this heuristic review.</p></div>{findings.length ? findings.map((finding, index) => <WarningSignCard key={finding.id || index} finding={finding} />) : <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No specific warning pattern was found. This does not confirm the payment or prove the content is safe.</div>}</section>
      <div className="lg:col-span-5"><RecommendedStepsCard result={result} /></div>
    </div>
    <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">{result.disclaimer || t.disclaimer || 'This analysis identifies potential warning signs only. Verify transactions in your own official banking or wallet application.'}</p>
  </div>;
}
