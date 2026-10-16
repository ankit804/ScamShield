import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Trash2, RefreshCw } from 'lucide-react';

export default function ReceiptPreviewCard({ 
  previewData, 
  uploadedImage, 
  fileName, 
  onRemove, 
  onReplace 
}) {
  const { t } = useApp();

  return (
    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t.preview}
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
            {uploadedImage ? "User File" : previewData ? "Sample Demo Voucher" : "No image selected"}
          </span>
        </div>

        {/* The Receipt Mockup / Image view */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs text-center max-w-xs mx-auto">
          {uploadedImage ? (
            <div className="space-y-2">
              <img 
                src={uploadedImage} 
                alt="Uploaded Payment Receipt" 
                className="max-h-48 mx-auto rounded-lg object-contain border border-slate-100"
              />
              <p className="text-[11px] font-semibold text-slate-700 truncate">{fileName}</p>
            </div>
          ) : previewData ? (
            <div className="space-y-2.5">
              {/* Brand Logo inside voucher */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{previewData?.app || "eSewa"}</span>
              </div>

              {/* Status Icon */}
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50/60">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  {previewData?.status || "Payment Successful"}
                </p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {previewData?.amount || "NPR 2,500.00"}
                </p>
              </div>

              {/* Voucher Details */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Reference No:</span>
                  <span className="font-mono font-semibold text-slate-800">{previewData?.refNo || "12356598"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-slate-800 font-medium">{previewData?.date || "2081-10-12 14:32"}</span>
                </div>
                {previewData?.recipient && (
                  <div className="flex justify-between truncate">
                    <span>Recipient:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[140px]">{previewData.recipient}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-sm text-slate-500">Choose a screenshot or a sample scenario to preview it.</div>
          )}
        </div>
      </div>

      {/* Action buttons matching mockup */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.remove}</span>
        </button>

        <button
          type="button"
          onClick={onReplace}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.replace}</span>
        </button>
      </div>
    </div>
  );
}
