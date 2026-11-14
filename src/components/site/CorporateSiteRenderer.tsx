import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Menu, RefreshCw, X } from 'lucide-react';
import { useCms } from '../../store/cmsStore';
import { BreakpointMode, CmsContentModel, CmsPage, SectionBlock } from '../../types/cms';
import { OptimizedPicture } from './OptimizedPicture';

interface CorporateSiteRendererProps {
  model: CmsContentModel;
  page: CmsPage;
  breakpoint: BreakpointMode;
  authoringMode?: boolean;
  onNavigateSlug?: (slug: string) => void;
  onExitLivePreview?: () => void;
}

export function CorporateSiteRenderer({
  model,
  page,
  breakpoint,
  authoringMode = false,
  onNavigateSlug,
  onExitLivePreview,
}: CorporateSiteRendererProps) {
  const { state, dispatch, fetchDynamicFeed, submitLead } = useCms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  const selectHeader = () => {
    if (!authoringMode) return;
    dispatch({ type: 'SET_INSPECTOR_TARGET', target: { kind: 'global-header' } });
  };

  const selectFooter = () => {
    if (!authoringMode) return;
    dispatch({ type: 'SET_INSPECTOR_TARGET', target: { kind: 'global-footer' } });
  };

  const selectSection = (sectionId: string) => {
    if (!authoringMode) return;
    dispatch({
      type: 'SET_INSPECTOR_TARGET',
      target: { kind: 'section', pageId: page.id, sectionId },
    });
  };

  const isSelectedHeader = authoringMode && state.inspectorTarget.kind === 'global-header';
  const isSelectedFooter = authoringMode && state.inspectorTarget.kind === 'global-footer';

  const handleLinkClick = (slug: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSlug) {
      onNavigateSlug(slug);
    } else {
      dispatch({ type: 'SET_ACTIVE_PAGE_BY_SLUG', slug });
    }
  };

  const visibleSections = page.sections.filter((s) => s.visible);

  return (
    <div className="bg-white text-slate-900 min-h-full flex flex-col">
      {/* Reusable Global Header — 3-Zone Top Bar Contract */}
      <div
        onClick={selectHeader}
        className={`relative border-b border-slate-200 bg-white transition-shadow ${
          authoringMode ? 'cursor-pointer hover:ring-1 hover:ring-blue-400' : ''
        } ${isSelectedHeader ? 'ring-2 ring-blue-600 z-10' : ''}`}
      >
        {authoringMode && (
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-1 flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span>Global Header Fragment</span>
            <span className="font-mono text-slate-500">Reusable Component</span>
          </div>
        )}
        <header
          className={`mx-auto max-w-[1200px] flex items-center justify-between gap-8 ${
            isMobile ? 'px-4 py-3.5' : 'px-8 py-4'
          }`}
        >
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (authoringMode) selectHeader();
              handleLinkClick('/');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {model.globalHeader.brandWordmark}
          </button>

          {/* Zone 2: 4-5 concise single-line nav links (desktop/tablet) */}
          {!isMobile && (
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              {model.globalHeader.navLinks.map((link) => {
                const active = page.slug === link.targetSlug;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLinkClick(link.targetSlug);
                    }}
                    className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                      active
                        ? 'text-slate-900 border-b-2 border-blue-700'
                        : 'hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zone 3: 1 primary action (or mobile menu toggle + primary CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            {isMobile ? (
              <button
                type="button"
                aria-label="Toggle site navigation"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen((prev) => !prev);
                }}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onExitLivePreview) {
                    onExitLivePreview();
                  } else {
                    handleLinkClick(model.globalHeader.ctaTargetSlug);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {onExitLivePreview ? 'Return to CMS Studio' : model.globalHeader.ctaLabel}
              </button>
            )}
          </div>
        </header>

        {/* Mobile drawer when breakpoint is mobile */}
        {isMobile && mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {model.globalHeader.navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick(link.targetSlug);
                }}
                className="block w-full text-left py-2.5 text-sm font-medium text-slate-800 border-b border-slate-100"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onExitLivePreview) {
                  onExitLivePreview();
                } else {
                  handleLinkClick(model.globalHeader.ctaTargetSlug);
                }
              }}
              className="mt-2 w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md"
            >
              {onExitLivePreview ? 'Return to CMS Studio' : model.globalHeader.ctaLabel}
            </button>
          </div>
        )}
      </div>

      {/* Main Authored Sections */}
      <main className="flex-1">
        {visibleSections.length === 0 ? (
          <div className="mx-auto max-w-[1200px] px-8 py-24 text-center">
            <p className="text-base font-medium text-slate-900">All sections on this page are hidden.</p>
            <p className="text-sm text-slate-500 mt-1">
              Enable a section visibility toggle or add a new component from the left authoring rail.
            </p>
          </div>
        ) : (
          visibleSections.map((section) => {
            const isSelected =
              authoringMode &&
              state.inspectorTarget.kind === 'section' &&
              state.inspectorTarget.sectionId === section.id;

            const surfaceClass =
              section.surfaceTone === 'navy'
                ? 'bg-slate-900 text-white border-y border-slate-800'
                : section.surfaceTone === 'muted'
                ? 'bg-slate-50 text-slate-900 border-y border-slate-200'
                : 'bg-white text-slate-900';

            return (
              <section
                key={section.id}
                onClick={() => selectSection(section.id)}
                className={`relative transition-shadow ${surfaceClass} ${
                  authoringMode ? 'cursor-pointer hover:ring-1 hover:ring-blue-400' : ''
                } ${isSelected ? 'ring-2 ring-blue-600 z-10' : ''}`}
              >
                {authoringMode && (
                  <div
                    className={`px-4 py-1 border-b text-[11px] font-medium flex items-center justify-between ${
                      section.surfaceTone === 'navy'
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-100/90 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>Component: {section.label}</span>
                    <span className="font-mono text-[11px] opacity-75">{section.type}</span>
                  </div>
                )}

                <SectionContent
                  section={section}
                  model={model}
                  isMobile={isMobile}
                  isTablet={isTablet}
                  isDesktop={isDesktop}
                  authoringMode={authoringMode}
                  onNavigateSlug={handleLinkClick}
                  fetchDynamicFeed={fetchDynamicFeed}
                  feedData={state.feedData}
                  feedLoading={state.feedLoading}
                  feedError={state.feedError}
                  estimatorLinkedNotes={state.estimatorLinkedNotes}
                  estimatorTrafficLabel={state.estimatorTrafficLabel}
                  onAttachEstimate={(notes, trafficLabel) =>
                    dispatch({ type: 'SET_ESTIMATOR_LINK', notes, trafficLabel })
                  }
                  onSubmitLead={submitLead}
                />
              </section>
            );
          })
        )}
      </main>

      {/* Reusable Global Footer */}
      <div
        onClick={selectFooter}
        className={`relative bg-slate-950 text-slate-300 border-t border-slate-800 transition-shadow ${
          authoringMode ? 'cursor-pointer hover:ring-1 hover:ring-blue-400' : ''
        } ${isSelectedFooter ? 'ring-2 ring-blue-600 z-10' : ''}`}
      >
        {authoringMode && (
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-1 flex items-center justify-between text-[11px] font-medium text-slate-300">
            <span>Global Footer Fragment</span>
            <span className="font-mono text-slate-400">Reusable Component</span>
          </div>
        )}
        <footer className={`mx-auto max-w-[1200px] ${isMobile ? 'px-4 py-10' : 'px-8 py-14'}`}>
          <div
            className={`grid gap-10 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-12'
            }`}
          >
            <div className={isMobile ? '' : 'col-span-5'}>
              <div className="font-display text-lg font-bold text-white tracking-tight">
                {model.globalFooter.companyName}
              </div>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-sm">
                {model.globalFooter.headquartersNote}
              </p>
            </div>

            <div
              className={`grid gap-8 ${
                isMobile ? 'grid-cols-2' : 'col-span-7 grid-cols-2 sm:grid-cols-2'
              }`}
            >
              {model.globalFooter.columns.map((col) => (
                <div key={col.id}>
                  <h4 className="text-xs font-semibold tracking-wide text-slate-400 mb-3">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    {col.links.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLinkClick(l.href);
                          }}
                          className="text-slate-300 hover:text-white transition-colors text-left"
                        >
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <span>{model.globalFooter.copyrightText}</span>
            <span>HTML5 · CSS3 Grid · Responsive Breakpoints Verified</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface SectionContentProps {
  section: SectionBlock;
  model: CmsContentModel;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  authoringMode: boolean;
  onNavigateSlug: (slug: string) => void;
  fetchDynamicFeed: (
    source: 'insights' | 'press' | 'exchange',
    options?: { refresh?: boolean; simulateError?: boolean }
  ) => Promise<void>;
  feedData: ReturnType<typeof useCms>['state']['feedData'];
  feedLoading: boolean;
  feedError: string | null;
  estimatorLinkedNotes: string;
  estimatorTrafficLabel: string;
  onAttachEstimate: (notes: string, trafficLabel: string) => void;
  onSubmitLead: ReturnType<typeof useCms>['submitLead'];
}

function SectionContent({
  section,
  model,
  isMobile,
  isTablet,
  authoringMode,
  onNavigateSlug,
  fetchDynamicFeed,
  feedData,
  feedLoading,
  feedError,
  estimatorLinkedNotes,
  estimatorTrafficLabel,
  onAttachEstimate,
  onSubmitLead,
}: SectionContentProps) {
  const containerPad = isMobile ? 'px-4 py-10' : isTablet ? 'px-6 py-14' : 'px-8 py-18';
  const isDarkSurface = section.surfaceTone === 'navy';

  if (section.type === 'hero') {
    const heroAsset = model.assets.find((a) => a.id === section.assetId) || model.assets[0];
    return (
      <div className={`mx-auto max-w-[1200px] ${containerPad}`}>
        <div
          className={`grid items-stretch gap-10 ${
            isMobile || isTablet ? 'grid-cols-1' : 'grid-cols-12'
          }`}
        >
          <div className={`${isMobile || isTablet ? '' : 'col-span-6'} flex flex-col justify-center`}>
            {section.kicker && (
              <p
                className={`text-xs font-medium tracking-wide mb-4 ${
                  isDarkSurface ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {section.kicker}
              </p>
            )}
            <h1
              className="font-display font-bold tracking-tight text-balance leading-[1.08]"
              style={{ fontSize: isMobile ? '2rem' : 'clamp(2.25rem, 3.6vw, 3.35rem)' }}
            >
              {section.headline}
            </h1>
            {section.subheadline && (
              <p
                className={`mt-5 text-base leading-relaxed max-w-xl ${
                  isDarkSurface ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {section.subheadline}
              </p>
            )}
            {section.primaryCtaLabel && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateSlug(section.primaryCtaTarget || '/contact');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{section.primaryCtaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className={`${isMobile || isTablet ? '' : 'col-span-6'} flex`}>
            <OptimizedPicture
              asset={heroAsset}
              fallbackTitle={section.headline}
              aspectClass="aspect-[16/10]"
              className="w-full h-full rounded-lg border border-slate-200"
              showCodecOverlay={authoringMode}
            />
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'capabilities_bento') {
    const items = section.capabilities || [];
    return (
      <div className={`mx-auto max-w-[1200px] ${containerPad}`}>
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
            {section.sectionTitle}
          </h2>
          {section.sectionIntro && (
            <p className={`mt-3 text-base leading-relaxed ${isDarkSurface ? 'text-slate-300' : 'text-slate-600'}`}>
              {section.sectionIntro}
            </p>
          )}
        </div>

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {items.map((item) => {
            const cardAsset = item.assetId ? model.assets.find((a) => a.id === item.assetId) : undefined;
            const spanClass = !isMobile && item.spanWide ? 'col-span-2' : 'col-span-1';
            return (
              <article
                key={item.id}
                className={`${spanClass} rounded-lg border p-6 flex flex-col justify-between ${
                  isDarkSurface
                    ? 'bg-slate-800/60 border-slate-700'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-sm font-semibold text-blue-700 tabular-nums">
                      {item.number}
                    </span>
                    <h3 className="font-display text-lg font-semibold tracking-tight">{item.title}</h3>
                  </div>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      isDarkSurface ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {cardAsset && !isMobile && (
                  <div className="mt-5">
                    <OptimizedPicture
                      asset={cardAsset}
                      fallbackTitle={item.title}
                      aspectClass="aspect-[16/9]"
                      className="rounded-md border border-slate-200"
                      showCodecOverlay={authoringMode}
                    />
                  </div>
                )}

                <div
                  className={`mt-5 pt-4 border-t text-xs font-medium ${
                    isDarkSurface ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-700'
                  }`}
                >
                  {item.outcomeMetric}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  if (section.type === 'proof_metrics') {
    const metrics = section.metrics || [];
    return (
      <div className={`mx-auto max-w-[1200px] ${containerPad}`}>
        {section.sectionTitle && (
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance mb-8">
            {section.sectionTitle}
          </h2>
        )}
        <div
          className={`grid gap-6 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'grid-cols-4'
          }`}
        >
          {metrics.map((m) => (
            <div
              key={m.id}
              className={`border-t pt-5 ${isDarkSurface ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                {m.value}
              </div>
              <div className="mt-2 text-sm font-semibold">{m.label}</div>
              <div className={`mt-1 text-xs leading-relaxed ${isDarkSurface ? 'text-slate-400' : 'text-slate-500'}`}>
                {m.context}
              </div>
            </div>
          ))}
        </div>

        {section.testimonialQuote && (
          <div
            className={`mt-10 pt-8 border-t ${
              isDarkSurface ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <blockquote className="text-base sm:text-lg leading-relaxed max-w-3xl">
              “{section.testimonialQuote}”
            </blockquote>
            <div className={`mt-3 text-xs ${isDarkSurface ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={`font-semibold ${isDarkSurface ? 'text-white' : 'text-slate-900'}`}>
                {section.testimonialAuthor}
              </span>
              <span aria-hidden="true"> · </span>
              <span>{section.testimonialRole}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'dynamic_api_feed') {
    const source = section.feedSource || 'insights';
    const payload = feedData[source];

    return (
      <DynamicFeedSectionView
        section={section}
        source={source}
        payload={payload}
        loading={feedLoading && !payload}
        error={feedError}
        isMobile={isMobile}
        isDarkSurface={isDarkSurface}
        containerPad={containerPad}
        onRefresh={() => fetchDynamicFeed(source, { refresh: true })}
        onLoadSource={(src) => fetchDynamicFeed(src)}
      />
    );
  }

  if (section.type === 'engagement_estimator') {
    return (
      <EngagementEstimatorWidget
        section={section}
        isMobile={isMobile}
        containerPad={containerPad}
        onAttachEstimate={onAttachEstimate}
        onNavigateToContact={() => onNavigateSlug('/contact')}
      />
    );
  }

  if (section.type === 'lead_capture') {
    return (
      <LeadCaptureWidget
        section={section}
        isMobile={isMobile}
        containerPad={containerPad}
        prefilledScope={estimatorLinkedNotes}
        prefilledTraffic={estimatorTrafficLabel}
        onSubmitLead={onSubmitLead}
      />
    );
  }

  return null;
}

function DynamicFeedSectionView({
  section,
  source,
  payload,
  loading,
  error,
  isMobile,
  isDarkSurface,
  containerPad,
  onRefresh,
  onLoadSource,
}: {
  section: SectionBlock;
  source: 'insights' | 'press' | 'exchange';
  payload: ReturnType<typeof useCms>['state']['feedData']['insights'];
  loading: boolean;
  error: string | null;
  isMobile: boolean;
  isDarkSurface: boolean;
  containerPad: string;
  onRefresh: () => void;
  onLoadSource: (src: 'insights' | 'press' | 'exchange') => void;
}) {
  useEffect(() => {
    if (!payload && !loading && !error) {
      onLoadSource(source);
    }
  }, [source, payload, loading, error, onLoadSource]);

  const limit = section.feedLimit || 3;
  const items = payload?.items.slice(0, limit) || [];

  return (
    <div className={`mx-auto max-w-[1200px] ${containerPad}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {section.sectionTitle}
          </h2>
          {section.sectionIntro && (
            <p className={`mt-2 text-sm max-w-2xl ${isDarkSurface ? 'text-slate-300' : 'text-slate-600'}`}>
              {section.sectionIntro}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-md whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Feed</span>
        </button>
      </div>

      {loading && (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-5 bg-white animate-pulse">
              <div className="h-3 w-32 bg-slate-200 rounded mb-3" />
              <div className="h-5 w-full bg-slate-200 rounded mb-2" />
              <div className="h-4 w-4/5 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 flex items-center justify-between gap-4">
          <div className="text-sm text-red-800">{error}</div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md whitespace-nowrap shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5">
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.publishedAt}</span>
                </div>
                <h3 className="mt-2.5 font-display text-base font-semibold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{item.summary}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{item.source}</span>
                <span className="font-mono font-medium text-blue-700 tabular-nums">{item.metricTag}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EngagementEstimatorWidget({
  section,
  isMobile,
  containerPad,
  onAttachEstimate,
  onNavigateToContact,
}: {
  section: SectionBlock;
  isMobile: boolean;
  containerPad: string;
  onAttachEstimate: (notes: string, trafficLabel: string) => void;
  onNavigateToContact: () => void;
}) {
  const [monthlyVisits, setMonthlyVisits] = useState(section.defaultMonthlyVisits || 180000);
  const [legacyWeightKb, setLegacyWeightKb] = useState(section.defaultLegacyWeightKb || 3400);
  const [codec, setCodec] = useState<'AVIF' | 'WebP'>('AVIF');
  const [attached, setAttached] = useState(false);

  const reductionFactor = codec === 'AVIF' ? 0.72 : 0.62;
  const optimizedWeightKb = Math.round(legacyWeightKb * (1 - reductionFactor));
  const savedKbPerView = legacyWeightKb - optimizedWeightKb;
  const monthlySavedGb = Math.round((monthlyVisits * savedKbPerView) / (1024 * 1024));
  const projectedLcpSeconds = (0.65 + optimizedWeightKb / 2400).toFixed(2);
  const baselineLcpSeconds = (1.35 + legacyWeightKb / 1600).toFixed(2);

  const handleAttach = (e: React.MouseEvent) => {
    e.stopPropagation();
    const notes = `Responsive ${codec} Pipeline (${legacyWeightKb} KB -> ${optimizedWeightKb} KB, saving ${monthlySavedGb.toLocaleString()} GB/mo)`;
    const trafficLabel = `${monthlyVisits.toLocaleString()} / mo`;
    onAttachEstimate(notes, trafficLabel);
    setAttached(true);
    setTimeout(() => setAttached(false), 2500);
  };

  return (
    <div className={`mx-auto max-w-[1200px] ${containerPad}`}>
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-start'}`}>
          <div className={isMobile ? '' : 'col-span-6 space-y-6'}>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                {section.estimatorTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {section.estimatorSubtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Monthly Corporate Visits</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {monthlyVisits.toLocaleString()} visits
                  </span>
                </div>
                <input
                  type="range"
                  min={25000}
                  max={1000000}
                  step={25000}
                  value={monthlyVisits}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setMonthlyVisits(Number(e.target.value))}
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Current Unoptimized Page Weight</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {(legacyWeightKb / 1000).toFixed(1)} MB ({legacyWeightKb} KB)
                  </span>
                </div>
                <input
                  type="range"
                  min={1200}
                  max={6000}
                  step={100}
                  value={legacyWeightKb}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setLegacyWeightKb(Number(e.target.value))}
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-slate-700 mb-1.5">Target Delivery Format</div>
                <div className="inline-flex p-1 bg-slate-100 rounded-md gap-1">
                  {(['AVIF', 'WebP'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCodec(fmt);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        codec === fmt
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {fmt} + Srcset
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`${isMobile ? '' : 'col-span-6'} bg-slate-50 border border-slate-200 rounded-lg p-6`}>
            <div className="text-xs font-semibold text-slate-500 mb-4">
              Projected Optimization Impact
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="border-t border-slate-200 pt-3">
                <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                  {optimizedWeightKb.toLocaleString()} KB
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Target Payload (down from {legacyWeightKb.toLocaleString()} KB)
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="font-mono text-2xl font-semibold text-blue-700 tabular-nums">
                  {monthlySavedGb.toLocaleString()} GB
                </div>
                <div className="text-xs text-slate-600 mt-1">Monthly CDN Egress Saved</div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                  {projectedLcpSeconds}s
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Projected Mobile LCP (vs {baselineLcpSeconds}s)
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="font-mono text-2xl font-semibold text-emerald-700 tabular-nums">
                  -{Math.round(reductionFactor * 100)}%
                </div>
                <div className="text-xs text-slate-600 mt-1">Asset Transfer Footprint</div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAttach}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                {attached ? 'Estimate Synced to Inquiry Form' : 'Attach Estimate to Briefing'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttach(e);
                  onNavigateToContact();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Open Contact Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadCaptureWidget({
  section,
  isMobile,
  containerPad,
  prefilledScope,
  prefilledTraffic,
  onSubmitLead,
}: {
  section: SectionBlock;
  isMobile: boolean;
  containerPad: string;
  prefilledScope: string;
  prefilledTraffic: string;
  onSubmitLead: ReturnType<typeof useCms>['submitLead'];
}) {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectScope, setProjectScope] = useState(
    prefilledScope || 'AEM Template Standardization & Corporate Redesign'
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefilledScope) {
      setProjectScope(prefilledScope);
    }
  }, [prefilledScope]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg(null);
    setSubmitting(true);
    const result = await onSubmitLead({
      fullName,
      workEmail,
      company,
      projectScope,
      estimatedMonthlyVisits: prefilledTraffic || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setErrorMsg(result.error || 'Unable to submit form.');
      return;
    }
    setSubmitted(true);
    setFullName('');
    setWorkEmail('');
    setCompany('');
  };

  return (
    <div className={`mx-auto max-w-[1200px] ${containerPad}`}>
      <div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        <div className={isMobile ? '' : 'col-span-5'}>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {section.formTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{section.formSubtitle}</p>
          {prefilledTraffic && (
            <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-600">
              <span className="font-medium text-slate-900">Synced Traffic Profile:</span>{' '}
              <span className="font-mono tabular-nums">{prefilledTraffic}</span>
            </div>
          )}
        </div>

        <div className={isMobile ? '' : 'col-span-7'}>
          {submitted ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-emerald-950">Inquiry Confirmed</h3>
                  <p className="mt-1 text-sm text-emerald-900">{section.confirmationMessage}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubmitted(false);
                    }}
                    className="mt-4 px-3 py-1.5 text-xs font-medium bg-white border border-emerald-300 text-emerald-900 rounded-md hover:bg-emerald-100"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg border border-slate-200 bg-white p-6 space-y-4"
            >
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adi Prasetyo"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="adi@enterprise.co.id"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="PT Nusantara Digital Tbk"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Project Scope
                </label>
                <textarea
                  rows={2}
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {errorMsg && (
                <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  {submitting ? 'Submitting...' : section.submitLabel || 'Submit Inquiry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
