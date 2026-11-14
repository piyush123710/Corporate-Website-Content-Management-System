import React, { useState } from 'react';
import { CmsProvider, useCms } from './store/cmsStore';
import { WorkspaceTab } from './types/cms';
import { AuthoringView } from './components/cms/AuthoringView';
import { TemplatesView } from './components/cms/TemplatesView';
import { AssetsView } from './components/cms/AssetsView';
import { IntegrationsView } from './components/cms/IntegrationsView';
import { CorporateSiteRenderer } from './components/site/CorporateSiteRenderer';

const STUDIO_NAV: { id: WorkspaceTab; label: string }[] = [
  { id: 'authoring', label: 'Authoring' },
  { id: 'templates', label: 'Templates' },
  { id: 'assets', label: 'Assets' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'live_site', label: 'Live Site' },
];

function CmsWorkspace() {
  const {
    state,
    publishedContent,
    hasUnpublishedChanges,
    dispatch,
    publishSite,
  } = useCms();
  const [liveSlug, setLiveSlug] = useState('/');
  const [justPublished, setJustPublished] = useState(false);

  const handlePublish = async () => {
    await publishSite();
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 2200);
  };

  if (state.activeTab === 'live_site') {
    const targetPage =
      publishedContent.pages.find((p) => p.slug === liveSlug) || publishedContent.pages[0];

    return (
      <div className="min-h-screen bg-white">
        <CorporateSiteRenderer
          model={publishedContent}
          page={targetPage}
          breakpoint="desktop"
          authoringMode={false}
          onNavigateSlug={(slug) => setLiveSlug(slug)}
          onExitLivePreview={() => dispatch({ type: 'SET_TAB', tab: 'authoring' })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Studio Top Bar — Strict 3-Zone Contract */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="mx-auto max-w-[1440px] px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'authoring' })}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            studiowebsite.id
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="flex items-center gap-6 overflow-x-auto">
            {STUDIO_NAV.map((item) => {
              const active = state.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'live_site') {
                      setLiveSlug('/');
                    }
                    dispatch({ type: 'SET_TAB', tab: item.id });
                  }}
                  className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    active
                      ? 'text-slate-900 border-blue-700'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handlePublish}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                hasUnpublishedChanges
                  ? 'bg-blue-700 hover:bg-blue-800 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {justPublished
                ? 'Published Live'
                : hasUnpublishedChanges
                ? 'Publish Changes'
                : 'Published'}
            </button>
          </div>
        </div>
      </header>

      {/* Active Workspace Viewport */}
      <main className="flex-1 min-h-0">
        {state.activeTab === 'authoring' && <AuthoringView />}
        {state.activeTab === 'templates' && <TemplatesView />}
        {state.activeTab === 'assets' && <AssetsView />}
        {state.activeTab === 'integrations' && <IntegrationsView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <CmsWorkspace />
    </CmsProvider>
  );
}
