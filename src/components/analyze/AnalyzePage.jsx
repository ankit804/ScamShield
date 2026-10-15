import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ScreenshotUpload from './ScreenshotUpload';
import MessageInput from './MessageInput';
import UrlInput from './UrlInput';
import AnalysisStepper from './AnalysisStepper';
import { analyzeSubmission } from '../../utils/analysisEngine';
import { Image, MessageSquare, Link as LinkIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AnalyzePage() {
  const { t, language, setLanguage, addScanResult, showToast } = useApp();

  const [activeTab, setActiveTab] = useState(() => {
    const preferred = sessionStorage.getItem('preferred_tab');
    if (preferred) {
      sessionStorage.removeItem('preferred_tab');
      return preferred;
    }
    return 'screenshot';
  });

  const [screenshotData, setScreenshotData] = useState({
    fileName: 'esewa-fake-payment.png',
    fileSize: 450000,
    presetType: 'high-fraud',
    caption: 'Payment Successful NPR 2,500.00 Ref: 12356598'
  });
  const [messageText, setMessageText] = useState('Dispatch immediately or I will cancel the order! Payment sent via eSewa 9841234567, check and confirm.');
  const [urlValue, setUrlValue] = useState('https://bit.ly/esewa-urgent-kyc-verify');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const pendingName = sessionStorage.getItem('pending_upload_name');
    const pendingSize = sessionStorage.getItem('pending_upload_size');
    if (pendingName) {
      sessionStorage.removeItem('pending_upload_name');
      sessionStorage.removeItem('pending_upload_size');
      setScreenshotData({
        fileName: pendingName,
        fileSize: parseInt(pendingSize || '500000', 10),
        presetType: 'custom-upload',
        caption: `Uploaded image ${pendingName}`
      });
      setActiveTab('screenshot');
    }
  }, []);

  const handleStartAnalysis = async () => {
    setValidationError('');
    let payload = {};
    if (activeTab === 'screenshot') {
      if (!screenshotData.fileName) {
        setValidationError('Please upload or select a payment screenshot.');
        return;
      }
      payload = { type: 'screenshot', data: screenshotData };
    } else if (activeTab === 'message') {
      if (!messageText.trim()) {
        setValidationError('Please enter or paste suspicious payment message text.');
        return;
      }
      payload = { type: 'message', data: { text: messageText } };
    } else if (activeTab === 'url') {
      if (!urlValue.trim()) {
        setValidationError('Please enter a URL to check.');
        return;
      }
      payload = { type: 'url', data: { url: urlValue } };
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => { setAnalysisStep(2); }, 700);
    setTimeout(() => { setAnalysisStep(3); }, 1400);

    setTimeout(async () => {
      try {
        const result = await analyzeSubmission({ type: payload.type, data: payload.data, language });
        setIsAnalyzing(false);
        setAnalysisStep(0);
        addScanResult(result);
        showToast(language === 'ne' ? 'विश्लेषण सम्पन्न भयो' : 'Risk analysis completed successfully', 'success');
      } catch {
        setIsAnalyzing(false);
        setAnalysisStep(0);
        setValidationError('Analysis encountered an issue. Please try again.');
      }
    }, 2100);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="animate-slide-in-right">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {t.analyzeTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          {t.analyzeSubtitle}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6 animate-slide-in-bottom">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('screenshot')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'screenshot'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>{t.tabScreenshot}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'message'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.tabMessage}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>{t.tabUrl}</span>
          </button>
        </div>

        <div className="animate-fade-in">
          {activeTab === 'screenshot' && (
            <ScreenshotUpload
              onDataReady={(data) => setScreenshotData(data)}
              activeData={screenshotData}
              onClear={() => setScreenshotData({ fileName: '', fileSize: 0 })}
            />
          )}
          {activeTab === 'message' && (
            <MessageInput
              value={messageText}
              onChange={(val) => setMessageText(val)}
              onClear={() => setMessageText('')}
            />
          )}
          {activeTab === 'url' && (
            <UrlInput
              value={urlValue}
              onChange={(val) => setUrlValue(val)}
              onClear={() => setUrlValue('')}
            />
          )}
        </div>

        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-slide-in-bottom">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">
              {t.language}:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="en">English</option>
              <option value="ne">नेपाली (Nepali)</option>
            </select>
          </div>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleStartAnalysis}
            className={`px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
              isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.analyzingSubmission}</span>
              </>
            ) : (
              <>
                <span>{t.analyzeForRisk}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <AnalysisStepper currentStep={analysisStep} isAnalyzing={isAnalyzing} />
    </div>
  );
}