import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Bell, 
  ShieldCheck, 
  Trash2, 
  Server, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    language, 
    setLanguage, 
    notificationsEnabled, 
    setNotificationsEnabled, 
    dataRetention, 
    setDataRetention, 
    clearHistory, 
    t, 
    showToast 
  } = useApp();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    showToast(e.target.value === 'ne' ? 'भाषा नेपालीमा परिवर्तन गरियो' : 'Language set to English', 'success');
  };

  const handleNotificationToggle = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    showToast(next ? 'Security alerts enabled' : 'Security alerts muted', 'info');
  };

  const handleRetentionChange = (e) => {
    setDataRetention(e.target.value);
    showToast('Retention policy updated', 'info');
  };

  const handleConfirmClear = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.settingsSubtitle}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100">
        {/* Language Preference */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                {t.prefLanguage}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.prefLanguageDesc}
            </p>
          </div>

          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="en">English (Global)</option>
            <option value="ne">नेपाली (Nepal)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                {t.notificationsToggle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.notificationsToggleDesc}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notificationsEnabled} 
              onChange={handleNotificationToggle}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Privacy & Data Retention */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                {t.privacyAndData}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t.privacyDesc}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-700">
              {t.dataRetention}
            </span>
            <select
              value={dataRetention}
              onChange={handleRetentionChange}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="30-days">30 days (Recommended)</option>
              <option value="60-days">60 days</option>
              <option value="90-days">90 days</option>
              <option value="never">Never store on device</option>
            </select>
          </div>
        </div>

        {/* FastAPI Backend Integration Setting */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  FastAPI Backend Endpoint
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure the microservice endpoint for future dedicated AI model deployment.
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              Client Engine Ready
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => showToast('Backend endpoint configuration saved', 'success')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Clear Scan History */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                {t.clearScanHistory}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.clearHistoryWarning}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
          >
            {t.btnClearHistory}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900 font-heading">
                Clear all scan history?
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will wipe all cached scam checks from this device. This action cannot be reversed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
