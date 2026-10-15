import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UploadCloud, 
  MessageSquare, 
  Link as LinkIcon, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

export default function QuickScanCard({ onSelectMode }) {
  const { setCurrentView, t } = useApp();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Navigate to analyze with file preloaded
      sessionStorage.setItem('pending_upload_name', file.name);
      sessionStorage.setItem('pending_upload_size', file.size);
      setCurrentView('analyze');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      sessionStorage.setItem('pending_upload_name', file.name);
      sessionStorage.setItem('pending_upload_size', file.size);
      setCurrentView('analyze');
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
          {t.quickScan}
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          {t.quickScanSubtitle}
        </p>

        {/* Drag and drop upload zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            mt-5 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60'
            }
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            {t.dragDropText}
          </p>
          <span className="text-[11px] text-slate-400 my-1">{t.or}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{t.chooseFile}</span>
          </button>
        </div>

        {/* Quick access modes */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('preferred_tab', 'message');
              setCurrentView('analyze');
            }}
            className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>{t.pasteMessage}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('preferred_tab', 'url');
              setCurrentView('analyze');
            }}
            className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
          >
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span>{t.checkUrl}</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
        <span className="text-[11px] text-slate-600 font-medium">
          {t.supportedFormats}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t.privacyNote}</span>
        </div>
      </div>
    </div>
  );
}
