import React from 'react';
import { Check, X } from 'lucide-react';

export function calculatePasswordStrength(password = '') {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  if (checks.length) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.number) score += 1;
  if (checks.symbol) score += 1;

  let label = 'Very Weak';
  let color = 'bg-slate-200';
  let textColor = 'text-slate-400';

  if (score === 1) {
    label = 'Weak';
    color = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-600';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-blue-500';
    textColor = 'text-blue-600';
  } else if (score === 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  }

  return { score, label, color, textColor, checks };
}

export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const { score, label, color, textColor, checks } = calculatePasswordStrength(password);

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">Password strength:</span>
        <span className={`font-bold ${textColor}`}>{label}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        <div className={`rounded-full transition-colors ${score >= 1 ? color : 'bg-slate-200'}`} />
        <div className={`rounded-full transition-colors ${score >= 2 ? color : 'bg-slate-200'}`} />
        <div className={`rounded-full transition-colors ${score >= 3 ? color : 'bg-slate-200'}`} />
        <div className={`rounded-full transition-colors ${score >= 4 ? color : 'bg-slate-200'}`} />
      </div>

      {/* Requirement bullets */}
      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
        <div className="flex items-center gap-1">
          {checks.length ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>8+ characters</span>
        </div>
        <div className="flex items-center gap-1">
          {checks.uppercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Uppercase letter</span>
        </div>
        <div className="flex items-center gap-1">
          {checks.number ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Contains number</span>
        </div>
        <div className="flex items-center gap-1">
          {checks.symbol ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
}
