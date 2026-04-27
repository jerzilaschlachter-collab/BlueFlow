'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Analysis, AnalysisResult } from '@/types';
import FlameIcon from '@/components/FlameIcon';

interface ChartUploaderProps {
  disabled?: boolean;
  tradingStyle: string;
  onAnalysisComplete: (analysis: Analysis) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const ChartUploader: React.FC<ChartUploaderProps> = ({ disabled = false, tradingStyle, onAnalysisComplete, onLoadingChange }) => {
  const [assetInfo, setAssetInfo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const messages = [
    'Reading chart structure...',
    'Identifying key levels...',
    'Detecting patterns...',
    'Calculating confidence score...',
    'Building your analysis...',
    'Almost ready...',
  ];

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_W = 1280;
        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          else resolve(file);
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('Please upload a JPG or PNG image.');
      return;
    }
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError('Image must be under 10 MB.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleAnalyzeChart = async () => {
    if (!file) return;
    setLoading(true);
    setCurrentMessage(0);
    setError(null);
    onLoadingChange?.(true);

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 1800);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressed);
      formData.append('asset', assetInfo);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      let response: Response;
      try {
        response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
      } catch (fetchErr: unknown) {
        clearTimeout(timeout);
        const isAbort = fetchErr instanceof Error && fetchErr.name === 'AbortError';
        setError(isAbort ? 'Request timed out. Please try again.' : 'Network error. Please try again.');
        clearInterval(messageInterval);
        setLoading(false);
        onLoadingChange?.(false);
        return;
      }
      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          setError('Monthly limit reached. Upgrade to Pro for unlimited analyses.');
        } else {
          setError(data.error ?? 'Analysis failed.');
        }
        clearInterval(messageInterval);
        setLoading(false);
        onLoadingChange?.(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = data.analysis as any;
      const fullAnalysis = {
        id: data.analysisId,
        user_id: '',
        image_url: data.chartImageUrl,
        created_at: data.createdAt,
        trading_style: tradingStyle,
        raw_analysis: '',
        ...result,
        // Normalize bias to a lowercase string for the card views
        bias: (result.bias?.direction || result.bias || 'neutral').toString().toLowerCase(),
        // Normalize pattern to a string
        pattern: typeof result.pattern === 'object' ? (result.pattern?.name || '') : (result.pattern || ''),
        confidence_score: result.bias?.confidence_score ?? result.confidence_score ?? 0,
      } as unknown as Analysis;

      clearInterval(messageInterval);
      setLoading(false);
      onLoadingChange?.(false);
      onAnalysisComplete(fullAnalysis);
      // Navigate to the full-page analysis view
      router.push(`/dashboard/analysis/${data.analysisId}`);
    } catch (err) {
      clearInterval(messageInterval);
      setLoading(false);
      onLoadingChange?.(false);
      setError('Error analyzing chart. Please try again.');
      console.error(err);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isLoading = loading;

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--bf-surface)',
        borderRadius: '24px',
        border: '1px solid transparent',
        backgroundClip: 'padding-box',
        boxShadow: '0 8px 40px rgba(0,52,255,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        outline: '1px solid var(--bf-card-border)',
      }}
    >
      {/* Dark header strip */}
      <div
        className="flex items-start gap-3 px-6 py-5"
        style={{ background: 'linear-gradient(135deg, #060B1F 0%, #0A1A4A 60%, #0033CC 100%)' }}
      >
        <FlameIcon className="flex-shrink-0 text-white mt-0.5" size={28} />
        <div>
          <p className="text-white font-semibold text-base tracking-wide">Upload Your Chart</p>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            BlueFlow AI will handle the rest
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-0 space-y-3">
        {/* Asset input */}
        <div style={{ borderBottom: '1px solid var(--bf-input-border)' }}>
          <input
            type="text"
            placeholder="Asset & timeframe (optional) e.g. EURUSD 4H"
            value={assetInfo}
            onChange={(e) => setAssetInfo(e.target.value)}
            disabled={disabled || isLoading}
            className="w-full px-2 py-3 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed placeholder-[#94A3B8]"
            style={{ background: 'transparent', color: 'var(--bf-input-text)' }}
          />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isLoading}
        />

        {!preview ? (
          /* Drop zone */
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
            className="relative flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{
              borderRadius: '16px',
              border: `2px dashed ${isDragging ? '#0052FF' : '#C4D4FF'}`,
              background: isDragging
                ? 'var(--bf-drop-zone-active-bg)'
                : 'var(--bf-drop-zone-bg)',
              height: '220px',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : isLoading ? 'default' : 'pointer',
              boxShadow: isDragging ? 'inset 0 0 0 4px rgba(0,82,255,0.06)' : 'none',
            }}
          >
            <div className="text-center">
              <FlameIcon
                size={44}
                className="mx-auto mb-3 text-[#0052FF] transition-all duration-200"
                style={{
                  opacity: isDragging ? 1 : 0.5,
                  filter: isDragging ? 'drop-shadow(0 0 12px rgba(0,82,255,0.6))' : 'drop-shadow(0 0 4px rgba(0,82,255,0.2))',
                } as React.CSSProperties}
              />
              <p className="font-semibold text-[16px]" style={{ color: 'var(--bf-text-primary)' }}>Drop chart here</p>
              <p className="text-[#94A3B8] text-[13px] mt-1">or <span className="text-[#0052FF] font-medium">click to browse</span></p>
              <p className="text-[#C4CDD9] text-[11px] mt-2">JPG or PNG · up to 10 MB</p>
            </div>
          </div>
        ) : (
          /* Preview state */
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
              <img
                src={preview}
                alt="Chart preview"
                className="w-full max-h-72 object-contain"
              style={{ background: 'var(--bf-preview-bg)' }}
              />
            </div>
            <div className="text-sm text-[#64748B]">
              <p className="font-semibold" style={{ color: 'var(--bf-text-primary)' }}>{file?.name}</p>
              <p className="text-xs">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-6">
                <FlameIcon className="w-12 h-12 text-[#0052FF] animate-pulse" size={48} />
                <p className="text-sm text-[#0A0E27] font-medium text-center min-h-6">
                  {messages[currentMessage]}
                </p>
              </div>
            ) : (
              <button
                onClick={handleRemove}
                className="w-full py-2 px-4 rounded-xl transition-colors text-sm"
              style={{ border: '1px solid var(--bf-input-border)', color: 'var(--bf-text-muted)', background: 'var(--bf-surface)' }}
              >
                Remove & re-upload
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {disabled && !isLoading && !preview && (
          <p className="text-amber-500 text-sm text-center pb-2">
            Upload disabled — monthly limit reached.{' '}
            <a href="/pricing" className="text-[#00AAFF] hover:underline">Upgrade to Pro</a>
          </p>
        )}
      </div>

      {/* Analyze button — flush with card bottom */}
      {!disabled && (preview || !preview) && (
        <div className="mt-4">
          <button
            onClick={handleAnalyzeChart}
            disabled={!file || disabled || isLoading}
            className="w-full text-white font-bold text-[16px] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              height: '60px',
              background: 'linear-gradient(135deg, #0022BB 0%, #0052FF 50%, #00AAFF 100%)',
              borderRadius: '0 0 24px 24px',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0033CC 0%, #0066FF 50%, #22BBFF 100%)';
                e.currentTarget.style.boxShadow = '0 -6px 24px rgba(0,82,255,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0022BB 0%, #0052FF 50%, #00AAFF 100%)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '18px' }}>⚡</span> Analyze as {tradingStyle.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChartUploader;
