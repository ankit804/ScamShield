import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Smartphone, 
  CreditCard, 
  Link as LinkIcon, 
  UserX, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SafetyGuidePage() {
  const app = useApp() || {};
  const { t = {} } = app;
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Fallback default safety guide topics if context translations aren't loaded
  const defaultGuides = [
    {
      id: 'fake-esewa-receipts',
      icon: Smartphone,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: 'Fake eSewa / Khalti Payment Receipts',
      description: 'Learn how scammers fabricate payment success screenshots using app cloning tools.',
      points: [
        'Always verify funds directly inside your official wallet app balance—never trust a screenshot.',
        'Check transaction IDs against live statement history.',
        'Watch for font mismatches or alignment errors on receipt images.'
      ]
    },
    {
      id: 'phishing-links',
      icon: LinkIcon,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      title: 'Suspicious SMS & Phishing Links',
      description: 'Identify fraudulent SMS messages claiming urgent KYC verification or prize wins.',
      points: [
        'Never click on short links like bit.ly sent via unverified SMS.',
        'Official banks in Nepal will never request OTPs or PINs over SMS/links.',
        'Check the domain URL carefully (e.g., look for fake domains impersonating official portals).'
      ]
    },
    {
      id: 'advance-payment-fraud',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      title: 'Social Media Advance Payment Fraud',
      description: 'Common tactics used on Instagram/Facebook pages asking for payment before delivery.',
      points: [
        'Research page history and check user reviews before sending advance money.',
        'Avoid sellers who refuse Cash on Delivery (COD) or insist on immediate full wallet transfer.',
        'Verify if the seller provides a valid PAN/VAT registration or physical location.'
      ]
    },
    {
      id: 'impersonation-scams',
      icon: UserX,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      title: 'Friend & Relative Emergency Fraud',
      description: 'Hacked social media accounts asking for quick wallet transfers for emergencies.',
      points: [
        'Always place a direct phone call to the person before sending any money.',
        'Be suspicious of urgent, high-pressure requests claiming medical or travel emergencies.',
        'Verify the destination wallet holder name matches the person requesting funds.'
      ]
    },
    {
      id: 'lottery-job-scams',
      icon: ShieldAlert,
      color: 'bg-red-50 text-red-600 border-red-200',
      title: 'Part-Time Online Job & Lottery Scams',
      description: 'Promises of daily income for liking YouTube videos or paying "processing fees".',
      points: [
        'Legitimate employers will never ask you to pay money to get hired.',
        'Telegram task groups promising guaranteed returns on investment are almost always scams.',
        'Report fraudulent Telegram handles or Viber numbers immediately.'
      ]
    },
    {
      id: 'banking-otp-protection',
      icon: AlertTriangle,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      title: 'Mobile Banking OTP Safeguards',
      description: 'Essential practices to secure your bank app, MPIN, and authorization codes.',
      points: [
        'Your One-Time Password (OTP) is confidential—never share it over phone calls.',
        'Beware of callers claiming to be bank customer support requesting account activation.',
        'Enable biometric authentication (fingerprint/Face ID) inside banking applications.'
      ]
    }
  ];

  const guides = t.safetyGuides || defaultGuides;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in text-slate-900">
      {/* Header */}
      <div className="animate-slide-in-right">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.safetyGuideTitle || 'Safety Guide'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          {t.safetyGuideSubtitle || 'Learn how to spot and avoid common payment scams in Nepal.'}
        </p>
      </div>

      {/* Grid of Safety Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-in-bottom">
        {guides.map((guide) => {
          const Icon = guide.icon || ShieldAlert;
          return (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${guide.color || 'bg-slate-50 text-slate-700'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                <span>Read Protection Steps</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-slide-in-bottom relative">
            <button
              type="button"
              onClick={() => setSelectedGuide(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedGuide.color}`}>
                {React.createElement(selectedGuide.icon || ShieldAlert, { className: 'w-5 h-5' })}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedGuide.title}</h3>
                <p className="text-xs text-slate-500">Protection measures</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {selectedGuide.description}
            </p>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Steps to Stay Safe:</h4>
              <ul className="space-y-2">
                {selectedGuide.points?.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Got It, Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}