import React from 'react';
import { useApp } from '../../context/AppContext';
import { generateAuditReport } from '../../utils/reportGenerator';
import { 
  ScanSearch, 
  Copy, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function RecommendedStepsCard({ result }) {
  const { setCurrentView, t, language, showToast } = useApp();

  const handleCopyFindings = async () => {
    try {
      const textToCopy = `[ScamShield Nepal Risk Report]
Status: ${result.riskLabel}
Evidence: ${result.evidenceFound}/${result.totalIndicators} flags identified
Summary: ${result.summary}

Findings:
${result.findings.map(f => `• ${f.title}: ${f.explanation}`).join('\n')}

Next Steps:
${result.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Disclaimer: ${result.disclaimer}`;

      await navigator.clipboard.writeText(textToCopy);
      showToast(language === 'ne' ? 'निष्कर्ष क्लिपबोर्डमा कपी गरियो' : 'Findings copied to clipboard', 'success');
    } catch {
      showToast('Could not copy automatically. Please select text manually.', 'warning');
    }
  };

  const handleDownload = () => {
    generateAuditReport(result, language);
    showToast(language === 'ne' ? 'प्रतिवेदन डाउनलोड सुरु भयो' : 'Downloading audit report', 'success');
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
          {t.recommendedNextSteps}
        </h3>

        {/* Step-by-step checklist */}
        <div className="space-y-3 mt-4">
          {result.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                {index + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentView('analyze')}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <ScanSearch className="w-4 h-4" />
            <span>{t.analyzeAnotherItem}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyFindings}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.copyFindings}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.downloadReport}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Fintech Limitation Disclaimer Box */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {result.disclaimer || t.disclaimer}
        </p>
      </div>
    </div>
  );
}
