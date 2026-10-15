import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  Image,
  QrCode,
  UserX,
  MessageSquareWarning,
  ShoppingBag
} from 'lucide-react';

export default function GuideModal({ guide, onClose }) {
  const { language, t } = useApp();

  if (!guide) return null;

  const isNe = language === 'ne';
  const title = guide.title[language] || guide.title.en;
  const content = guide.fullContent[language] || guide.fullContent.en;
  const checklist = guide.checklist[language] || guide.checklist.en;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Image': return Image;
      case 'QrCode': return QrCode;
      case 'UserX': return UserX;
      case 'MessageSquareWarning': return MessageSquareWarning;
      case 'ShoppingBag': return ShoppingBag;
      default: return ShieldCheck;
    }
  };

  const Icon = getIcon(guide.icon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                {guide.badge}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 font-heading">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
          {content}
        </div>

        {/* Actionable Verification Checklist */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isNe ? "व्यापारी सुरक्षा चेकलिस्ट" : "Actionable Merchant Checklist"}</span>
          </h4>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Close button */}
        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
