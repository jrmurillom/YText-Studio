import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { CompositeTextGroup, GraphicAssetElement } from '@/types';
import { OffscreenExporter, ExportResolution, ExportFormat } from '@/core/canvas/OffscreenExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgImage: HTMLImageElement | string | null;
  textGroup: CompositeTextGroup | null;
  graphicAssets?: GraphicAssetElement[];
  canvasPreviewUrl: string | null;
  videoTitle?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  bgImage,
  textGroup,
  graphicAssets = [],
  canvasPreviewUrl,
  videoTitle,
}) => {
  const [resolution, setResolution] = useState<ExportResolution>('720p');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const sanitizedTitle = (videoTitle || 'ytext-cover')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .slice(0, 30);

      await OffscreenExporter.download({
        bgImage,
        textGroup,
        graphicAssets,
        resolution,
        format,
        filenamePrefix: sanitizedTitle || 'ytext-cover',
      });

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error during export:', err);
      alert('An error occurred while generating the image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedSize = (): string => {
    if (resolution === '720p') {
      return format === 'png' ? '~400 – 700 KB' : '~180 – 300 KB';
    }
    return format === 'png' ? '~850 KB – 1.6 MB' : '~350 – 600 KB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-slate-900">
              Export Thumbnail
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Canvas Preview */}
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900 shadow-inner relative aspect-video flex items-center justify-center">
            {canvasPreviewUrl ? (
              <img
                src={canvasPreviewUrl}
                alt="Export preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-500 text-xs flex items-center gap-2">
                <ImageIcon className="w-5 h-5 opacity-40" />
                <span>No image in canvas</span>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white/90">
              {resolution === '720p' ? '1280 × 720' : '1920 × 1080'} • {format.toUpperCase()}
            </div>
          </div>

          {/* Resolution Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Resolution
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResolution('720p')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  resolution === '720p'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">1280 × 720 (HD)</span>
                  {resolution === '720p' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Standard YouTube HD
                </span>
              </button>

              <button
                type="button"
                onClick={() => setResolution('1080p')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  resolution === '1080p'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    1920 × 1080 (Full HD)
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </span>
                  {resolution === '1080p' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  1.5× Retina/4K Scaling
                </span>
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  format === 'png'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">PNG</span>
                  {format === 'png' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Lossless Quality
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  format === 'jpeg'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">JPEG</span>
                  {format === 'jpeg' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Smaller File
                </span>
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Estimated size: <strong className="text-slate-900">{getEstimatedSize()}</strong></span>
            <span className="text-[11px] text-slate-400 font-mono">16:9 HD</span>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-slate-200 px-5 flex items-center justify-between bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rasterizing High Resolution...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {resolution === '720p' ? '1280×720' : '1920×1080'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
