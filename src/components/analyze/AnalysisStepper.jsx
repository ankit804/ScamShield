import React from 'react';
import { useApp } from '../../context/AppContext';
import { Check, Loader2 } from 'lucide-react';

export default function AnalysisStepper({ currentStep = 1, isAnalyzing = false }) {
  const { t } = useApp();
  const steps = [{ number: 1, label: t.step1Extracting }, { number: 2, label: t.step2Checking }, { number: 3, label: t.step3Preparing }];

  if (!isAnalyzing && currentStep === 0) return null;

  return (
    <div className="bg-white rounded-xl p-5 ... shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-4 animate-slide-in-right">
        {/* Loading spinner with animation */}
        {isAnalyzing ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-blue-600" />}
        <span className="text-xs sm:text-sm font-bold text-slate-800">{t.analyzingSubmission}</span>
      </div>

      <div className="relative flex items-center justify-between max-w-xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
        {/* Connecting progress line with transition animation */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 ...">
          <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: currentStep === 1 ? '15%' : currentStep === 2 ? '50%' : currentStep >= 3 ? '100%' : '0%' }} />
        </div>

        {steps.map((step) => {
          const isDone = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              {/* Step indicator with animation and condition pulse */}
              <div className={`w-8 h-8 rounded-full ... transition-all ${isDone ? 'bg-blue-600 text-white' : isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse' : 'bg-white text-slate-400'}`}>
                {isDone ? <Check className="w-4 h-4" /> : <span>{step.number}</span>}
              </div>
              <span className={`text-[11px] font-medium ... leading-tight transition-colors ${isCurrent ? 'text-blue-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}