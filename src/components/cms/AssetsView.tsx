import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useCms } from '../../store/cmsStore';
import { ImageFormat, MediaAsset } from '../../types/cms';
import {
  buildResponsivePictureHtml,
  computeOptimizedSizeKb,
  computeSavingsPercent,
} from '../../utils/assetMetrics';
import { OptimizedPicture } from '../site/OptimizedPicture';

const RESPONSIVE_WIDTH_OPTIONS = [320, 480, 640, 768, 1024, 1200, 1440, 1920];

export function AssetsView() {
  const { content, dispatch } = useCms();
  const [selectedAssetId, setSelectedAssetId] = useState<string>(content.assets[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedAsset: MediaAsset =
    content.assets.find((a) => a.id === selectedAssetId) || content.assets[0];

  const totalOriginalKb = content.assets.reduce((acc, a) => acc + a.originalSizeKb, 0);
  const totalOptimizedKb = content.assets.reduce((acc, a) => acc + computeOptimizedSizeKb(a), 0);
  const totalSavingsPct = Math.round(((totalOriginalKb - totalOptimizedKb) / totalOriginalKb) * 100);

  const toggleBreakpointWidth = (asset: MediaAsset, width: number) => {
    const exists = asset.responsiveWidths.includes(width);
    const nextWidths = exists
      ? asset.responsiveWidths.filter((w) => w !== width)
      : [...asset.responsiveWidths, width].sort((a, b) => a - b);
    if (nextWidths.length === 0) return;
    dispatch({ type: 'UPDATE_ASSET', assetId: asset.id, patch: { responsiveWidths: nextWidths } });
  };

  const handleCopySnippet = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(buildResponsivePictureHtml(asset));
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 space-y-8">
      {/* Summary Header & Aggregate Metrics */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Digital Asset Manager & Delivery Optimizer
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Configure target codecs, compression quality, loading priority, and responsive srcset breakpoints across all device types.
          </p>
        </div>

        <div className="flex items-center gap-8 text-right">
          <div>
            <div className="text-xs text-slate-500">Source Library</div>
            <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
              {totalOriginalKb.toLocaleString()} KB
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Optimized Output</div>
            <div className="font-mono text-lg font-semibold text-blue-700 tabular-nums">
              {totalOptimizedKb.toLocaleString()} KB
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Net Reduction</div>
            <div className="font-mono text-lg font-semibold text-emerald-700 tabular-nums">
              -{totalSavingsPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Asset Grid (Left) + Optimization Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {content.assets.map((asset) => {
            const isSelected = asset.id === selectedAsset.id;
            const optimizedKb = computeOptimizedSizeKb(asset);
            const savings = computeSavingsPercent(asset);

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`rounded-lg border bg-white overflow-hidden cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-600 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <OptimizedPicture
                  asset={asset}
                  fallbackTitle={asset.name}
                  aspectClass="aspect-[4/3]"
                  showCodecOverlay={false}
                />
                <div className="p-4 space-y-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-700">{asset.targetFormat}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {asset.width}x{asset.height}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{asset.loadingPriority}</span>
                  </div>
                  <div className="font-medium text-sm text-slate-900 truncate">{asset.name}</div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-500">
                      {asset.originalSizeKb} KB →{' '}
                      <strong className="text-slate-900">{optimizedKb} KB</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold">-{savings}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Asset Inspector */}
        {selectedAsset && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <div className="text-xs text-slate-500">Selected DAM Asset</div>
              <h2 className="font-display text-base font-semibold text-slate-900 mt-0.5 break-all">
                {selectedAsset.name}
              </h2>
              <div className="mt-1 text-xs text-slate-500">
                Referenced on: {selectedAsset.usedInPages.join(', ')}
              </div>
            </div>

            {/* Codec Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Target Delivery Codec
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                {(['AVIF', 'WebP', 'JPEG'] as ImageFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_ASSET',
                        assetId: selectedAsset.id,
                        patch: { targetFormat: fmt },
                      })
                    }
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      selectedAsset.targetFormat === fmt
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Compression Quality</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {selectedAsset.quality}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                step={1}
                value={selectedAsset.quality}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ASSET',
                    assetId: selectedAsset.id,
                    patch: { quality: Number(e.target.value) },
                  })
                }
                className="w-full accent-blue-700 cursor-pointer"
              />
            </div>

            {/* Loading Priority */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Browser Loading Priority
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md">
                {(['eager', 'lazy'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_ASSET',
                        assetId: selectedAsset.id,
                        patch: { loadingPriority: mode },
                      })
                    }
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      selectedAsset.loadingPriority === mode
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'eager' ? 'Eager (Above-the-Fold LCP)' : 'Lazy (Below Fold)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Breakpoint Widths */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Generated srcset Breakpoints
              </label>
              <div className="grid grid-cols-4 gap-2">
                {RESPONSIVE_WIDTH_OPTIONS.map((w) => {
                  const active = selectedAsset.responsiveWidths.includes(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleBreakpointWidth(selectedAsset, w)}
                      className={`py-1.5 px-2 text-xs font-mono tabular-nums rounded border transition-colors ${
                        active
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {w}w
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Accessible Alt Description (WCAG AA)
              </label>
              <textarea
                rows={2}
                value={selectedAsset.alt}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ASSET',
                    assetId: selectedAsset.id,
                    patch: { alt: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>

            {/* Generated HTML5 Picture Tag */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Generated HTML5 &lt;picture&gt; Markup
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySnippet(selectedAsset)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                >
                  {copiedId === selectedAsset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-md text-[11px] font-mono overflow-x-auto leading-relaxed">
                {buildResponsivePictureHtml(selectedAsset)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
