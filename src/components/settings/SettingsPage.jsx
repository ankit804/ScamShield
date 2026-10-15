import React, { useState } from 'react';
import { Globe, Bell, ShieldCheck, Trash2, Server, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsPage() {
  const app = useApp() || {};
  const { 
    language = 'en', 
    setLanguage = () => {}, 
    notificationsEnabled = true, 
    setNotificationsEnabled = () => {}, 
    dataRetention = '30-days', 
    setDataRetention = () => {}, 
    clearHistory = () => {}, 
    t = {}, 
    showToast = () => {} 
  } = app;

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000/api/v1');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    showToast(e.target.value === 'ne' ? 'भाषा परिवर्तन गरियो' : 'Language changed', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in text-slate-900">
      <div className="animate-slide-in-right">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.settingsTitle || 'Settings & Preferences'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.settingsSubtitle || 'Manage application preferences, language, and data retention.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 animate-slide-in-bottom">
        {/* Language Selection */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">{t.prefLanguage || 'Display Language'}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.prefLanguageDesc || 'Choose your primary application interface language.'}</p>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="en">English (Global)</option>
            <option value="ne">नेपाली (Nepal)</option>
          </select>
        </div>

        {/* Security Notifications */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">{t.notificationsToggle || 'Security Alerts'}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.notificationsToggleDesc || 'Receive instant warnings on high-risk scams.'}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notificationsEnabled} 
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        {/* Data Retention */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">{t.privacyAndData || 'Privacy & Retention'}</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{t.dataRetention || 'History Storage'}</span>
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="30-days">30 Days</option>
              <option value="60-days">60 Days</option>
              <option value="never">Never Store</option>
            </select>
          </div>
        </div>

        {/* Backend API Configuration */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Backend Endpoint</h3>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
            />
            <button
              type="button"
              onClick={() => showToast('Saved endpoint', 'success')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Save
            </button>
          </div>
        </div>

        {/* Clear History */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-slate-900">{t.clearScanHistory || 'Clear History'}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Permanently remove local scan records.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl transition-colors"
          >
            {t.btnClearHistory || 'Clear Data'}
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-900">Clear scan history?</h4>
              <p className="text-xs text-slate-500 mt-1">This will wipe all cached scans from your browser.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { clearHistory(); setShowClearConfirm(false); }}
                className="py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}