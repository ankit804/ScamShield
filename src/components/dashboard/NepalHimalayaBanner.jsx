import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export default function NepalHimalayaBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 via-indigo-50/70 to-blue-100/50 border border-blue-200/60 p-5 flex items-center justify-between shadow-xs">
      {/* Decorative background mountain silhouettes (Himalayas) */}
      <svg 
        className="absolute bottom-0 right-0 w-80 h-32 opacity-25 pointer-events-none text-blue-900" 
        viewBox="0 0 400 150" 
        fill="currentColor"
      >
        {/* Mountain range */}
        <polygon points="0,150 70,75 140,150" />
        <polygon points="90,150 170,45 250,150" />
        <polygon points="200,150 280,25 360,150" />
        <polygon points="310,150 365,65 420,150" />
        {/* Pagoda / Stupa subtle outline */}
        <path d="M 280,25 L 278,15 L 282,15 Z M 274,35 L 286,35 L 284,45 L 276,45 Z" />
      </svg>

      <div className="relative z-10 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold mb-2">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Tailored for Nepal Merchant Safety</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 leading-snug font-heading">
          Empowering Nepali Businesses Against Payment Fraud
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Screening eSewa, Khalti, ConnectIPS vouchers and SMS alerts in real-time before fulfilling orders.
        </p>
      </div>

      {/* Illustrated Phone & Shield Graphic */}
      <div className="relative z-10 hidden sm:flex items-center justify-center shrink-0 w-28 h-28">
        <div className="w-20 h-28 bg-white rounded-xl shadow-md border-2 border-slate-200/80 p-1.5 flex flex-col items-center justify-center relative transform -rotate-3 hover:rotate-0 transition-transform">
          {/* Phone notch */}
          <div className="w-6 h-1 bg-slate-300 rounded-full mb-2" />
          
          {/* Shield Badge */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>

          {/* Fake mini app lines */}
          <div className="w-12 h-1.5 bg-blue-100 rounded-full mt-2.5" />
          <div className="w-8 h-1 bg-slate-100 rounded-full mt-1" />
        </div>
      </div>
    </div>
  );
}
