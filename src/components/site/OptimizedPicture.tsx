import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { MediaAsset } from '../../types/cms';
import { computeOptimizedSizeKb } from '../../utils/assetMetrics';

interface OptimizedPictureProps {
  asset?: MediaAsset;
  fallbackTitle?: string;
  className?: string;
  aspectClass?: string;
  showCodecOverlay?: boolean;
}

export function OptimizedPicture({
  asset,
  fallbackTitle = 'Corporate Media Asset',
  className = '',
  aspectClass = 'aspect-video',
  showCodecOverlay = false,
}: OptimizedPictureProps) {
  const [failed, setFailed] = useState(false);

  if (!asset || failed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 border border-slate-200 text-slate-500 ${aspectClass} ${className}`}
      >
        <ImageOff className="w-6 h-6 mb-2 text-slate-400" strokeWidth={1.5} />
        <span className="text-xs font-medium text-slate-600 px-4 text-center">{fallbackTitle}</span>
      </div>
    );
  }

  const optimizedKb = computeOptimizedSizeKb(asset);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${aspectClass} ${className}`}>
      <img
        src={asset.url}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        loading={asset.loadingPriority}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
      {showCodecOverlay && (
        <div className="absolute bottom-3 left-3 bg-slate-950/85 text-white px-2.5 py-1 text-[11px] font-mono tabular-nums tracking-tight rounded">
          {asset.targetFormat} · {optimizedKb} KB · {asset.loadingPriority}
        </div>
      )}
    </div>
  );
}
