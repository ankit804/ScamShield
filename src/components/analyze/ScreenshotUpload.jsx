import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import ReceiptPreviewCard from './ReceiptPreviewCard';
import { sampleScenarios } from '../../data/sampleScenarios';
import { UploadCloud, Image, Sparkles } from 'lucide-react';

export default function ScreenshotUpload({ 
  onDataReady, 
  activeData, 
  onClear 
}) {
  const { t } = useApp();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [presetType, setPresetType] = useState("");

  useEffect(() => {
    if (!activeData?.fileName) return;
    setFileName(activeData.fileName);
    setPresetType(activeData.presetType || 'custom-upload');
    setPreviewData(activeData.previewData || null);
    setUploadedImage(activeData.fileData || null);
  }, [activeData]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert("Please choose a PNG or JPEG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller screenshot.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target.result !== 'string') return;
      setUploadedImage(e.target.result);
      setFileName(file.name);
      setPresetType("custom-upload");
      onDataReady({
        fileName: file.name,
        fileSize: file.size,
        fileData: e.target.result,
        presetType: "custom-upload",
        caption: `Payment Screenshot (${file.name})`
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (scenario) => {
    setUploadedImage(null);
    setPreviewData(scenario.previewData);
    setFileName(`${scenario.id}.png`);
    setPresetType(scenario.riskType);
    onDataReady({
      fileName: `${scenario.id}.png`,
      fileSize: 450000,
      presetType: scenario.riskType,
      caption: scenario.textRepresentation,
      previewData: scenario.previewData
    });
  };

  const handleRemove = () => {
    setUploadedImage(null);
    setFileName("");
    setPreviewData(null);
    setPresetType("");
    onClear();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Area: Upload Zone & Presets */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        <div>
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60'
              }
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files && processFile(e.target.files[0])}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden" 
            />

            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Drag and drop your screenshot here
            </p>
            <span className="text-xs text-slate-400 my-1">{t.or}</span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Image className="w-3.5 h-3.5" />
              <span>{t.chooseFile}</span>
            </button>

            <span className="text-[11px] text-slate-400 mt-4">
              {t.supportedFormats}
            </span>
          </div>
        </div>

        {/* 1-Click Interactive Sample Scenarios for Testing */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Quick Demo Scenario:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sampleScenarios.screenshots.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectPreset(s)}
                className={`
                  text-left p-2 rounded-lg border text-[11px] transition-all
                  ${presetType === s.riskType && !uploadedImage
                    ? 'border-blue-500 bg-white shadow-xs font-semibold text-blue-700'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                  }
                `}
              >
                <div className="font-semibold truncate">{s.title.split('(')[0]}</div>
                <div className="text-[10px] text-slate-400 truncate">{s.previewData.amount}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area: Preview Card */}
      <div className="lg:col-span-5">
        <ReceiptPreviewCard
          previewData={previewData}
          uploadedImage={uploadedImage}
          fileName={fileName}
          onRemove={handleRemove}
          onReplace={() => fileInputRef.current?.click()}
        />
      </div>
    </div>
  );
}
