import React from 'react';
import { useApp } from '../../context/AppContext';
import { sampleScenarios } from '../../data/sampleScenarios';
import { MessageSquare, Sparkles, XCircle } from 'lucide-react';

export default function MessageInput({ 
  value, 
  onChange, 
  onClear 
}) {
  const { t, language } = useApp();

  const handleSelectSample = (scenario) => {
    onChange(scenario.text);
  };

  const englishPlaceholder = 'Paste payment message, SMS alert, or chat conversation here...\n\nExample: "Dispatch immediately or I will cancel the order! Payment sent via eSewa 9841234567, check and confirm. InDrive rider is already outside waiting. Send receipt to this alternate number 9801234567 if not working."';

  const nepaliPlaceholder = 'यहाँ भुक्तानी सम्बन्धी शंकास्पद सन्देश, एसएमएस वा च्याट टाँस्नुहोस्...\n\nउदाहरण: "नमस्ते, मैले इसेवा मार्फत रु २,५०० पठाएको छु। स्क्रिनसट हेर्नुहोस् र तुरुन्तै सामान पठाइदिनुहोस्। राइडर आइसकेको छ, ढिलो भए अर्डर रद्द गर्छु।"';

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          rows={7}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={language === 'ne' ? nepaliPlaceholder : englishPlaceholder}
          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono leading-relaxed"
        />

        {/* Action icons inside/near bottom of text area */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 mt-1">
          <div className="flex items-center gap-2">
            <span>Character count: <strong className="text-slate-600">{value.length}</strong></span>
          </div>

          {value.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Clear text</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Load Realistic Merchant Fraud Scenario:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {sampleScenarios.messages.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectSample(m)}
              className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-[11px] transition-all"
            >
              <div className="font-semibold text-slate-800 truncate">{m.title}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{m.text}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
