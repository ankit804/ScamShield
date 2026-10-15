import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { safetyGuides } from '../../data/safetyGuides';
import GuideModal from './GuideModal';
import { 
  ArrowRight, 
  Image, 
  QrCode, 
  UserX, 
  MessageSquareWarning, 
  ShoppingBag, 
  ShieldCheck 
} from 'lucide-react';

export default function SafetyGuidePage() {
  const { language, t } = useApp();
  const [selectedGuide, setSelectedGuide] = useState(null);

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

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
          {t.safetyGuideTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.safetyGuideSubtitle}
        </p>
      </div>

      {/* Grid of 6 Guide Cards matching reference mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {safetyGuides.map((guide) => {
          const Icon = getIcon(guide.icon);
          const title = guide.title[language] || guide.title.en;
          const shortDesc = guide.shortDesc[language] || guide.shortDesc.en;

          return (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Illustration Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                  {guide.badge}
                </span>

                <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors font-heading">
                  {title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {shortDesc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                  <span>{t.readMore}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedGuide && (
        <GuideModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
        />
      )}
    </div>
  );
}
