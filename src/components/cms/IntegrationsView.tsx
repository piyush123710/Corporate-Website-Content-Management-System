import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useCms } from '../../store/cmsStore';
import { ApiFeedSource } from '../../types/cms';

const FEED_SOURCES: { id: ApiFeedSource; label: string; route: string; description: string }[] = [
  {
    id: 'insights',
    label: 'Corporate Market Insights',
    route: '/api/feeds/dynamic?source=insights',
    description: 'Engineering telemetry and enterprise web rollout briefs.',
  },
  {
    id: 'press',
    label: 'Press & Announcements',
    route: '/api/feeds/dynamic?source=press',
    description: 'Jakarta corporate newsroom and quarterly release disclosures.',
  },
  {
    id: 'exchange',
    label: 'APAC Digital Index',
    route: '/api/feeds/dynamic?source=exchange',
    description: 'Regional enterprise digital transformation benchmarks.',
  },
];

export function IntegrationsView() {
  const { state, content, dispatch, fetchDynamicFeed, fetchLeads } = useCms();
  const [selectedSource, setSelectedSource] = useState<ApiFeedSource>('insights');
  const [boundConfirmation, setBoundConfirmation] = useState(false);

  const activePayload = state.feedData[selectedSource];

  const handleBindToHomePage = () => {
    const homePage = content.pages.find((p) => p.slug === '/') || content.pages[0];
    const feedSection = homePage?.sections.find((s) => s.type === 'dynamic_api_feed');
    if (homePage && feedSection) {
      dispatch({
        type: 'UPDATE_SECTION',
        pageId: homePage.id,
        sectionId: feedSection.id,
        patch: { feedSource: selectedSource },
      });
      setBoundConfirmation(true);
      setTimeout(() => setBoundConfirmation(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Third-Party API Feeds & Lead Integrations
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
          Inspect live JSON payloads rendered inside corporate templates, test upstream error recovery, and audit inquiries submitted through the live site.
        </p>
      </div>

      {/* Part 1: Dynamic API Connector Inspector */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-500">Configured API Endpoints</h2>
          {FEED_SOURCES.map((src) => {
            const active = selectedSource === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => {
                  setSelectedSource(src.id);
                  if (!state.feedData[src.id]) {
                    fetchDynamicFeed(src.id);
                  }
                }}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  active
                    ? 'bg-white border-blue-600 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-display text-sm font-semibold text-slate-900">{src.label}</div>
                <div className="font-mono text-[11px] text-slate-500 mt-1">{src.route}</div>
                <p className="text-xs text-slate-600 mt-2">{src.description}</p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              {activePayload ? (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-semibold text-slate-900">HTTP 200 OK</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activePayload.latencyMs} ms</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Cache {activePayload.cacheState}</span>
                </div>
              ) : (
                <span>Endpoint Inspector</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchDynamicFeed(selectedSource, { refresh: true })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fetch Fresh</span>
              </button>
              <button
                type="button"
                onClick={() => fetchDynamicFeed(selectedSource, { simulateError: true })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-amber-50 text-amber-800"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test 503 Fallback</span>
              </button>
              <button
                type="button"
                onClick={handleBindToHomePage}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md"
              >
                {boundConfirmation ? 'Bound to Home Page' : 'Bind to Home Feed'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {state.feedLoading && (
              <div className="py-12 text-center text-xs text-slate-500">
                Fetching JSON payload from {selectedSource} endpoint...
              </div>
            )}

            {!state.feedLoading && state.feedError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
                <div className="text-xs text-red-800">{state.feedError}</div>
                <button
                  type="button"
                  onClick={() => fetchDynamicFeed(selectedSource, { refresh: true })}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 rounded-md whitespace-nowrap"
                >
                  Recover & Retry
                </button>
              </div>
            )}

            {!state.feedLoading && !state.feedError && activePayload && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 font-mono">
                  Upstream: {activePayload.endpoint}
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-md text-[11px] font-mono overflow-x-auto max-h-[340px] leading-relaxed">
                  {JSON.stringify(activePayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Part 2: Captured Corporate Leads Ledger */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Captured Corporate Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time submissions persisted via POST /api/leads from the corporate website funnel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchLeads()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-6">Contact</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Project Scope & Synced Estimate</th>
                <th className="py-3 px-4">Monthly Traffic</th>
                <th className="py-3 px-6 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {state.leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No inquiries submitted yet. Test the Lead Capture component on the Live Site tab.
                  </td>
                </tr>
              ) : (
                state.leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{lead.fullName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{lead.workEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{lead.company}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md">{lead.projectScope}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                      {lead.estimatedMonthlyVisits || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {lead.submittedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
