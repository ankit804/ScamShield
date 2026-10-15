import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sampleScenarios } from '../../data/sampleScenarios';
import { Link as LinkIcon, ShieldAlert, Sparkles, XCircle, AlertCircle } from 'lucide-react';

export default function UrlInput({ 
  value, 
  onChange, 
  onClear 
}) {
  const { t } = useApp();
  const [urlError, setUrlError] = useState('');

  const validateUrl = (str) => {
    if (!str) {
      setUrlError('');
      return true;
    }
    try {
      const parsed = new URL(str.startsWith('http') ? str : `https://${str}`);
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid web address (e.g. https://example.com)');
      return false;
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    validateUrl(val);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Enter Link or Website Address
        </label>
        <div className="relative">
          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="https://bit.ly/... or payment domain"
            className={`
              w-full bg-slate-50/70 border rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-mono
              ${urlError 
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }
            `}
          />
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {urlError && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{urlError}</span>
          </p>
        )}
      </div>

      {/* Safety Notice matching requirements */}
      <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200/80 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-semibold">Safe Sandboxed Inspection</p>
          <p className="text-amber-800 text-[11px] mt-0.5">
            Entering a URL in ScamShield does not visit or execute scripts from the website. Never click or visit unknown links sent by unverified customers.
          </p>
        </div>
      </div>

      {/* Preset URLs */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Sample URLs for Testing:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleScenarios.urls.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onChange(u.url)}
              className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-[11px] transition-all"
            >
              <div className="font-semibold text-slate-800 truncate">{u.title}</div>
              <div className="text-[10px] text-blue-600 font-mono truncate mt-0.5">{u.url}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
