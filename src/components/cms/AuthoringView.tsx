import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Monitor,
  Plus,
  Redo2,
  RotateCcw,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useCms } from '../../store/cmsStore';
import { ApiFeedSource, BreakpointMode, SectionType } from '../../types/cms';
import { CorporateSiteRenderer } from '../site/CorporateSiteRenderer';

const COMPONENT_PALETTE: { type: SectionType; label: string; summary: string }[] = [
  { type: 'hero', label: 'Hero Banner', summary: '16:9 focal image + headline + primary CTA' },
  { type: 'capabilities_bento', label: 'Capabilities Grid', summary: 'Numbered asymmetric capability cards' },
  { type: 'proof_metrics', label: 'Proof Metrics Strip', summary: '4-column KPI strip + client quote' },
  { type: 'dynamic_api_feed', label: 'Dynamic API Feed', summary: 'Live REST JSON corporate articles' },
  { type: 'engagement_estimator', label: 'Readiness Estimator', summary: 'Interactive bandwidth & LCP calculator' },
  { type: 'lead_capture', label: 'Lead Capture Form', summary: 'Validated corporate inquiry form' },
];

export function AuthoringView() {
  const { state, content, activePage, canUndo, canRedo, hasUnpublishedChanges, dispatch } = useCms();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const target = state.inspectorTarget;
  const selectedSection =
    target.kind === 'section'
      ? activePage.sections.find((s) => s.id === target.sectionId)
      : undefined;

  const viewportWidthClass =
    state.breakpoint === 'mobile'
      ? 'w-[375px]'
      : state.breakpoint === 'tablet'
      ? 'w-[768px]'
      : 'w-full max-w-[1280px]';

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] min-h-[680px]">
      {/* Contextual Authoring Sub-Toolbar (below top bar) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{activePage.title}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-500">{activePage.slug}</span>
          <span aria-hidden="true">·</span>
          <span
            className={`font-medium ${
              hasUnpublishedChanges || activePage.status === 'draft'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {hasUnpublishedChanges || activePage.status === 'draft' ? 'Draft Modified' : 'Published'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center border border-slate-200 rounded-md bg-white">
            <button
              type="button"
              disabled={!canUndo}
              onClick={() => dispatch({ type: 'UNDO' })}
              title="Undo edit"
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-35 border-r border-slate-200"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={() => dispatch({ type: 'REDO' })}
              title="Redo edit"
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-35"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Responsive Breakpoint Segmented Control */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
            {(
              [
                { id: 'desktop', label: 'Desktop 1440', Icon: Monitor },
                { id: 'tablet', label: 'Tablet 768', Icon: Tablet },
                { id: 'mobile', label: 'Mobile 375', Icon: Smartphone },
              ] as { id: BreakpointMode; label: string; Icon: typeof Monitor }[]
            ).map(({ id, label, Icon }) => {
              const active = state.breakpoint === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_BREAKPOINT', breakpoint: id })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {hasUnpublishedChanges && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'DISCARD_DRAFT' })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-md bg-white whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Pane AEM Authoring Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[264px_1fr_320px] min-h-0 overflow-hidden">
        {/* Left Rail: Site Pages, Global Fragments, Section Layers */}
        <aside className="bg-white border-r border-slate-200 overflow-y-auto p-4 space-y-6">
          {/* Site Pages */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-semibold text-slate-500">Corporate Pages</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_TAB', tab: 'templates' })}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                New Page
              </button>
            </div>
            <div className="space-y-1">
              {content.pages.map((page) => {
                const isActive = page.id === activePage.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', pageId: page.id })}
                    className={`w-full text-left px-3 py-2 rounded-md border text-xs transition-colors flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-200 text-slate-900 font-semibold'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{page.title}</span>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0">{page.slug}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reusable Global Fragments */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-xs font-semibold text-slate-500 mb-2.5">Global Fragments</h2>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'SET_INSPECTOR_TARGET', target: { kind: 'global-header' } })
                }
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 transition-colors ${
                  state.inspectorTarget.kind === 'global-header'
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Header & Navigation</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'SET_INSPECTOR_TARGET', target: { kind: 'global-footer' } })
                }
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 transition-colors ${
                  state.inspectorTarget.kind === 'global-footer'
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Global Footer</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_INSPECTOR_TARGET',
                    target: { kind: 'page-meta', pageId: activePage.id },
                  })
                }
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 transition-colors ${
                  state.inspectorTarget.kind === 'page-meta'
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Page Properties & SEO</span>
              </button>
            </div>
          </div>

          {/* Section Layers */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-semibold text-slate-500">Page Sections</h2>
              <button
                type="button"
                onClick={() => setShowAddMenu((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Block</span>
              </button>
            </div>

            {showAddMenu && (
              <div className="mb-3 p-2 rounded-md border border-slate-200 bg-slate-50 space-y-1">
                {COMPONENT_PALETTE.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: 'ADD_SECTION',
                        pageId: activePage.id,
                        sectionType: item.type,
                      });
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-900">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.summary}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              {activePage.sections.map((section, idx) => {
                const isSelected =
                  state.inspectorTarget.kind === 'section' &&
                  state.inspectorTarget.sectionId === section.id;

                return (
                  <div
                    key={section.id}
                    className={`rounded-md border p-2 transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'SET_INSPECTOR_TARGET',
                            target: { kind: 'section', pageId: activePage.id, sectionId: section.id },
                          })
                        }
                        className="text-left text-xs font-medium text-slate-900 truncate flex-1"
                      >
                        {section.label}
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          title={section.visible ? 'Hide section' : 'Show section'}
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_SECTION',
                              pageId: activePage.id,
                              sectionId: section.id,
                              patch: { visible: !section.visible },
                            })
                          }
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          title="Move up"
                          disabled={idx === 0}
                          onClick={() =>
                            dispatch({
                              type: 'MOVE_SECTION',
                              pageId: activePage.id,
                              sectionId: section.id,
                              direction: 'up',
                            })
                          }
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          disabled={idx === activePage.sections.length - 1}
                          onClick={() =>
                            dispatch({
                              type: 'MOVE_SECTION',
                              pageId: activePage.id,
                              sectionId: section.id,
                              direction: 'down',
                            })
                          }
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Canvas: Responsive Corporate Preview */}
        <div className="bg-slate-100 overflow-auto p-6 flex justify-center items-start">
          <div
            className={`${viewportWidthClass} bg-white border border-slate-300 shadow-sm rounded-lg overflow-hidden transition-all duration-200 shrink-0`}
          >
            <CorporateSiteRenderer
              model={content}
              page={activePage}
              breakpoint={state.breakpoint}
              authoringMode={true}
            />
          </div>
        </div>

        {/* Right Inspector: Component / Fragment Properties */}
        <aside className="bg-white border-l border-slate-200 overflow-y-auto p-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-200 mb-5">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Component Inspector</h2>
          </div>

          {state.inspectorTarget.kind === 'global-header' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Global header edits propagate across every page in studiowebsite.id.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Brand Wordmark</label>
                <input
                  type="text"
                  value={content.globalHeader.brandWordmark}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_HEADER',
                      header: { ...content.globalHeader, brandWordmark: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Primary Action Label</label>
                <input
                  type="text"
                  value={content.globalHeader.ctaLabel}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_HEADER',
                      header: { ...content.globalHeader, ctaLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Navigation Links</span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_HEADER',
                        header: {
                          ...content.globalHeader,
                          navLinks: [
                            ...content.globalHeader.navLinks,
                            {
                              id: `nav-${Date.now()}`,
                              label: 'Solutions',
                              targetSlug: '/capabilities',
                            },
                          ],
                        },
                      })
                    }
                    className="text-xs font-medium text-blue-700 hover:underline"
                  >
                    Add Link
                  </button>
                </div>

                <div className="space-y-2.5">
                  {content.globalHeader.navLinks.map((link, idx) => (
                    <div key={link.id} className="p-2.5 border border-slate-200 rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...content.globalHeader.navLinks];
                            updated[idx] = { ...link, label: e.target.value };
                            dispatch({
                              type: 'UPDATE_HEADER',
                              header: { ...content.globalHeader, navLinks: updated },
                            });
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                        />
                        <button
                          type="button"
                          title="Remove link"
                          onClick={() => {
                            const updated = content.globalHeader.navLinks.filter((n) => n.id !== link.id);
                            dispatch({
                              type: 'UPDATE_HEADER',
                              header: { ...content.globalHeader, navLinks: updated },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <select
                        value={link.targetSlug}
                        onChange={(e) => {
                          const updated = [...content.globalHeader.navLinks];
                          updated[idx] = { ...link, targetSlug: e.target.value };
                          dispatch({
                            type: 'UPDATE_HEADER',
                            header: { ...content.globalHeader, navLinks: updated },
                          });
                        }}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                      >
                        {content.pages.map((p) => (
                          <option key={p.id} value={p.slug}>
                            {p.slug} ({p.title})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state.inspectorTarget.kind === 'global-footer' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Reusable corporate footer fragment shared across all templates.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Wordmark</label>
                <input
                  type="text"
                  value={content.globalFooter.companyName}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FOOTER',
                      footer: { ...content.globalFooter, companyName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Headquarters Descriptor</label>
                <textarea
                  rows={2}
                  value={content.globalFooter.headquartersNote}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FOOTER',
                      footer: { ...content.globalFooter, headquartersNote: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Copyright Notice</label>
                <input
                  type="text"
                  value={content.globalFooter.copyrightText}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FOOTER',
                      footer: { ...content.globalFooter, copyrightText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>
          )}

          {state.inspectorTarget.kind === 'page-meta' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PAGE_META',
                      pageId: activePage.id,
                      patch: { title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Route Slug</label>
                <input
                  type="text"
                  value={activePage.slug}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PAGE_META',
                      pageId: activePage.id,
                      patch: { slug: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={activePage.metaDescription}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PAGE_META',
                      pageId: activePage.id,
                      patch: { metaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>
          )}

          {state.inspectorTarget.kind === 'section' && selectedSection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{selectedSection.label}</div>
                  <div className="text-[11px] font-mono text-slate-500">{selectedSection.type}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Duplicate section"
                    onClick={() =>
                      dispatch({
                        type: 'DUPLICATE_SECTION',
                        pageId: activePage.id,
                        sectionId: selectedSection.id,
                      })
                    }
                    className="p-1.5 border border-slate-200 rounded text-slate-600 hover:text-slate-900"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete section"
                    onClick={() =>
                      dispatch({
                        type: 'DELETE_SECTION',
                        pageId: activePage.id,
                        sectionId: selectedSection.id,
                      })
                    }
                    className="p-1.5 border border-slate-200 rounded text-slate-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Surface Background</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                  {(['light', 'muted', 'navy'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { surfaceTone: tone },
                        })
                      }
                      className={`py-1 text-xs font-medium capitalize rounded ${
                        selectedSection.surfaceTone === tone
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSection.type === 'hero' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Kicker Text</label>
                    <input
                      type="text"
                      value={selectedSection.kicker || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { kicker: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Headline</label>
                    <textarea
                      rows={3}
                      value={selectedSection.headline || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { headline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Subheadline</label>
                    <textarea
                      rows={3}
                      value={selectedSection.subheadline || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { subheadline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Primary CTA Label</label>
                    <input
                      type="text"
                      value={selectedSection.primaryCtaLabel || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { primaryCtaLabel: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">DAM Media Asset</label>
                    <select
                      value={selectedSection.assetId || content.assets[0]?.id}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { assetId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    >
                      {content.assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.targetFormat})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(selectedSection.type === 'capabilities_bento' ||
                selectedSection.type === 'proof_metrics' ||
                selectedSection.type === 'dynamic_api_feed') && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Section Title</label>
                  <textarea
                    rows={2}
                    value={selectedSection.sectionTitle || ''}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_SECTION',
                        pageId: activePage.id,
                        sectionId: selectedSection.id,
                        patch: { sectionTitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              )}

              {selectedSection.type === 'capabilities_bento' && selectedSection.capabilities && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700">Capability Cards</div>
                  {selectedSection.capabilities.map((cap, idx) => (
                    <div key={cap.id} className="p-2.5 border border-slate-200 rounded-md space-y-2">
                      <input
                        type="text"
                        value={cap.title}
                        onChange={(e) => {
                          const updated = [...(selectedSection.capabilities || [])];
                          updated[idx] = { ...cap, title: e.target.value };
                          dispatch({
                            type: 'UPDATE_SECTION',
                            pageId: activePage.id,
                            sectionId: selectedSection.id,
                            patch: { capabilities: updated },
                          });
                        }}
                        className="w-full px-2 py-1 text-xs font-medium border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={cap.outcomeMetric}
                        onChange={(e) => {
                          const updated = [...(selectedSection.capabilities || [])];
                          updated[idx] = { ...cap, outcomeMetric: e.target.value };
                          dispatch({
                            type: 'UPDATE_SECTION',
                            pageId: activePage.id,
                            sectionId: selectedSection.id,
                            patch: { capabilities: updated },
                          });
                        }}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedSection.type === 'dynamic_api_feed' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Connected API Feed Endpoint
                    </label>
                    <select
                      value={selectedSection.feedSource || 'insights'}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { feedSource: e.target.value as ApiFeedSource },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    >
                      <option value="insights">Corporate Insights (/api/feeds/dynamic?source=insights)</option>
                      <option value="press">Press Releases (/api/feeds/dynamic?source=press)</option>
                      <option value="exchange">APAC Digital Index (/api/feeds/dynamic?source=exchange)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Visible Item Limit ({selectedSection.feedLimit || 3})
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      value={selectedSection.feedLimit || 3}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { feedLimit: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-700"
                    />
                  </div>
                </>
              )}

              {selectedSection.type === 'engagement_estimator' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Estimator Title</label>
                    <textarea
                      rows={2}
                      value={selectedSection.estimatorTitle || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { estimatorTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Subtitle</label>
                    <textarea
                      rows={2}
                      value={selectedSection.estimatorSubtitle || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { estimatorSubtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                </>
              )}

              {selectedSection.type === 'lead_capture' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Form Title</label>
                    <input
                      type="text"
                      value={selectedSection.formTitle || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { formTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Submit Button Label</label>
                    <input
                      type="text"
                      value={selectedSection.submitLabel || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_SECTION',
                          pageId: activePage.id,
                          sectionId: selectedSection.id,
                          patch: { submitLabel: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
