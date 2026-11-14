import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { INITIAL_CMS_CONTENT } from '../data/initialCmsState';
import {
  ApiFeedSource,
  BreakpointMode,
  BrowserCompatibilityRule,
  CmsContentModel,
  CmsPage,
  CorporateLeadRecord,
  DynamicFeedResponse,
  GlobalFooterConfig,
  GlobalHeaderConfig,
  MediaAsset,
  PageTemplateId,
  SectionBlock,
  SectionType,
  WorkspaceTab,
} from '../types/cms';
import { createSectionBlock } from '../utils/assetMetrics';

const STORAGE_KEY = 'studiowebsite_cms_state_v1';

export type InspectorTarget =
  | { kind: 'section'; pageId: string; sectionId: string }
  | { kind: 'global-header' }
  | { kind: 'global-footer' }
  | { kind: 'page-meta'; pageId: string };

interface HistoryState {
  past: CmsContentModel[];
  present: CmsContentModel;
  future: CmsContentModel[];
  publishedSnapshot: CmsContentModel;
  lastPublishedAt: string;
}

interface CmsRuntimeState {
  activeTab: WorkspaceTab;
  activePageId: string;
  breakpoint: BreakpointMode;
  inspectorTarget: InspectorTarget;
  estimatorLinkedNotes: string;
  estimatorTrafficLabel: string;
  history: HistoryState;
  feedData: Record<ApiFeedSource, DynamicFeedResponse | null>;
  feedLoading: boolean;
  feedError: string | null;
  leads: CorporateLeadRecord[];
  leadsLoading: boolean;
}

type CmsAction =
  | { type: 'SET_TAB'; tab: WorkspaceTab }
  | { type: 'SET_ACTIVE_PAGE'; pageId: string }
  | { type: 'SET_ACTIVE_PAGE_BY_SLUG'; slug: string }
  | { type: 'SET_BREAKPOINT'; breakpoint: BreakpointMode }
  | { type: 'SET_INSPECTOR_TARGET'; target: InspectorTarget }
  | { type: 'SET_ESTIMATOR_LINK'; notes: string; trafficLabel: string }
  | { type: 'HYDRATE_CONTENT'; content: CmsContentModel }
  | { type: 'UPDATE_HEADER'; header: GlobalHeaderConfig }
  | { type: 'UPDATE_FOOTER'; footer: GlobalFooterConfig }
  | { type: 'UPDATE_PAGE_META'; pageId: string; patch: Partial<Pick<CmsPage, 'title' | 'slug' | 'metaDescription' | 'status'>> }
  | { type: 'UPDATE_SECTION'; pageId: string; sectionId: string; patch: Partial<SectionBlock> }
  | { type: 'MOVE_SECTION'; pageId: string; sectionId: string; direction: 'up' | 'down' }
  | { type: 'ADD_SECTION'; pageId: string; sectionType: SectionType }
  | { type: 'DUPLICATE_SECTION'; pageId: string; sectionId: string }
  | { type: 'DELETE_SECTION'; pageId: string; sectionId: string }
  | { type: 'CREATE_PAGE_FROM_TEMPLATE'; title: string; slug: string; templateId: PageTemplateId; sectionTypes: SectionType[] }
  | { type: 'UPDATE_ASSET'; assetId: string; patch: Partial<MediaAsset> }
  | { type: 'TOGGLE_COMPAT_RULE'; ruleId: string }
  | { type: 'PUBLISH_CHANGES'; timestamp: string }
  | { type: 'DISCARD_DRAFT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_FEED_LOADING'; loading: boolean }
  | { type: 'SET_FEED_SUCCESS'; source: ApiFeedSource; payload: DynamicFeedResponse }
  | { type: 'SET_FEED_ERROR'; error: string }
  | { type: 'SET_LEADS'; leads: CorporateLeadRecord[]; loading: boolean }
  | { type: 'PREPEND_LEAD'; lead: CorporateLeadRecord };

function cloneContent(model: CmsContentModel): CmsContentModel {
  return JSON.parse(JSON.stringify(model));
}

function pushContentEdit(history: HistoryState, nextPresent: CmsContentModel): HistoryState {
  return {
    ...history,
    past: [...history.past.slice(-24), history.present],
    present: nextPresent,
    future: [],
  };
}

function loadInitialContent(): CmsContentModel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CmsContentModel;
      if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seeded content
  }
  return cloneContent(INITIAL_CMS_CONTENT);
}

const initialContent = loadInitialContent();

const initialState: CmsRuntimeState = {
  activeTab: 'authoring',
  activePageId: initialContent.pages[0]?.id || 'page-home',
  breakpoint: 'desktop',
  inspectorTarget: {
    kind: 'section',
    pageId: initialContent.pages[0]?.id || 'page-home',
    sectionId: initialContent.pages[0]?.sections[0]?.id || 'sec-home-hero',
  },
  estimatorLinkedNotes: '',
  estimatorTrafficLabel: '',
  history: {
    past: [],
    present: initialContent,
    future: [],
    publishedSnapshot: cloneContent(initialContent),
    lastPublishedAt: '2026-11-14 09:40 WIB',
  },
  feedData: {
    insights: null,
    press: null,
    exchange: null,
  },
  feedLoading: false,
  feedError: null,
  leads: [],
  leadsLoading: false,
};

function cmsReducer(state: CmsRuntimeState, action: CmsAction): CmsRuntimeState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'SET_ACTIVE_PAGE': {
      const page = state.history.present.pages.find((p) => p.id === action.pageId);
      const firstSectionId = page?.sections[0]?.id;
      return {
        ...state,
        activePageId: action.pageId,
        inspectorTarget: firstSectionId
          ? { kind: 'section', pageId: action.pageId, sectionId: firstSectionId }
          : { kind: 'page-meta', pageId: action.pageId },
      };
    }

    case 'SET_ACTIVE_PAGE_BY_SLUG': {
      const page = state.history.present.pages.find((p) => p.slug === action.slug);
      if (!page) return state;
      const firstSectionId = page.sections[0]?.id;
      return {
        ...state,
        activePageId: page.id,
        inspectorTarget: firstSectionId
          ? { kind: 'section', pageId: page.id, sectionId: firstSectionId }
          : { kind: 'page-meta', pageId: page.id },
      };
    }

    case 'SET_BREAKPOINT':
      return { ...state, breakpoint: action.breakpoint };

    case 'SET_INSPECTOR_TARGET':
      return { ...state, inspectorTarget: action.target };

    case 'SET_ESTIMATOR_LINK':
      return {
        ...state,
        estimatorLinkedNotes: action.notes,
        estimatorTrafficLabel: action.trafficLabel,
      };

    case 'HYDRATE_CONTENT':
      return {
        ...state,
        history: {
          past: [],
          present: cloneContent(action.content),
          future: [],
          publishedSnapshot: cloneContent(action.content),
          lastPublishedAt: state.history.lastPublishedAt,
        },
      };

    case 'UPDATE_HEADER': {
      const next = cloneContent(state.history.present);
      next.globalHeader = action.header;
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'UPDATE_FOOTER': {
      const next = cloneContent(state.history.present);
      next.globalFooter = action.footer;
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'UPDATE_PAGE_META': {
      const next = cloneContent(state.history.present);
      next.pages = next.pages.map((p) =>
        p.id === action.pageId
          ? {
              ...p,
              ...action.patch,
              lastModified: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            }
          : p
      );
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'UPDATE_SECTION': {
      const next = cloneContent(state.history.present);
      next.pages = next.pages.map((p) => {
        if (p.id !== action.pageId) return p;
        return {
          ...p,
          status: 'draft',
          lastModified: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          sections: p.sections.map((s) => (s.id === action.sectionId ? { ...s, ...action.patch } : s)),
        };
      });
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'MOVE_SECTION': {
      const next = cloneContent(state.history.present);
      next.pages = next.pages.map((p) => {
        if (p.id !== action.pageId) return p;
        const idx = p.sections.findIndex((s) => s.id === action.sectionId);
        if (idx === -1) return p;
        const swapIdx = action.direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= p.sections.length) return p;
        const updated = [...p.sections];
        const [moved] = updated.splice(idx, 1);
        updated.splice(swapIdx, 0, moved);
        return { ...p, status: 'draft', sections: updated };
      });
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'ADD_SECTION': {
      const next = cloneContent(state.history.present);
      const newBlock = createSectionBlock(action.sectionType);
      next.pages = next.pages.map((p) =>
        p.id === action.pageId ? { ...p, status: 'draft', sections: [...p.sections, newBlock] } : p
      );
      return {
        ...state,
        inspectorTarget: { kind: 'section', pageId: action.pageId, sectionId: newBlock.id },
        history: pushContentEdit(state.history, next),
      };
    }

    case 'DUPLICATE_SECTION': {
      const next = cloneContent(state.history.present);
      let duplicatedId = '';
      next.pages = next.pages.map((p) => {
        if (p.id !== action.pageId) return p;
        const idx = p.sections.findIndex((s) => s.id === action.sectionId);
        if (idx === -1) return p;
        const copy: SectionBlock = JSON.parse(JSON.stringify(p.sections[idx]));
        copy.id = `${copy.id}-copy-${Date.now().toString(36)}`;
        copy.label = `${copy.label} (Copy)`;
        duplicatedId = copy.id;
        const updated = [...p.sections];
        updated.splice(idx + 1, 0, copy);
        return { ...p, status: 'draft', sections: updated };
      });
      return {
        ...state,
        inspectorTarget: duplicatedId
          ? { kind: 'section', pageId: action.pageId, sectionId: duplicatedId }
          : state.inspectorTarget,
        history: pushContentEdit(state.history, next),
      };
    }

    case 'DELETE_SECTION': {
      const next = cloneContent(state.history.present);
      let fallbackTarget: InspectorTarget = { kind: 'page-meta', pageId: action.pageId };
      next.pages = next.pages.map((p) => {
        if (p.id !== action.pageId) return p;
        const remaining = p.sections.filter((s) => s.id !== action.sectionId);
        if (remaining.length > 0) {
          fallbackTarget = { kind: 'section', pageId: action.pageId, sectionId: remaining[0].id };
        }
        return { ...p, status: 'draft', sections: remaining };
      });
      return {
        ...state,
        inspectorTarget: fallbackTarget,
        history: pushContentEdit(state.history, next),
      };
    }

    case 'CREATE_PAGE_FROM_TEMPLATE': {
      const next = cloneContent(state.history.present);
      const pageId = `page-${Date.now().toString(36)}`;
      const cleanSlug = action.slug.startsWith('/') ? action.slug : `/${action.slug}`;
      const newPage: CmsPage = {
        id: pageId,
        slug: cleanSlug,
        title: action.title,
        templateId: action.templateId,
        status: 'draft',
        lastModified: 'Just now',
        metaDescription: `${action.title} — authored on studiowebsite.id`,
        sections: action.sectionTypes.map((st) => createSectionBlock(st)),
      };
      next.pages = [...next.pages, newPage];
      return {
        ...state,
        activeTab: 'authoring',
        activePageId: pageId,
        inspectorTarget: newPage.sections[0]
          ? { kind: 'section', pageId, sectionId: newPage.sections[0].id }
          : { kind: 'page-meta', pageId },
        history: pushContentEdit(state.history, next),
      };
    }

    case 'UPDATE_ASSET': {
      const next = cloneContent(state.history.present);
      next.assets = next.assets.map((a) => (a.id === action.assetId ? { ...a, ...action.patch } : a));
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'TOGGLE_COMPAT_RULE': {
      const next = cloneContent(state.history.present);
      next.compatibilityRules = next.compatibilityRules.map((r: BrowserCompatibilityRule) =>
        r.id === action.ruleId ? { ...r, verified: !r.verified } : r
      );
      return { ...state, history: pushContentEdit(state.history, next) };
    }

    case 'PUBLISH_CHANGES': {
      const published = cloneContent(state.history.present);
      published.pages = published.pages.map((p) => ({ ...p, status: 'published' }));
      return {
        ...state,
        history: {
          ...state.history,
          present: cloneContent(published),
          publishedSnapshot: published,
          lastPublishedAt: action.timestamp,
        },
      };
    }

    case 'DISCARD_DRAFT': {
      const reverted = cloneContent(state.history.publishedSnapshot);
      return {
        ...state,
        history: {
          ...state.history,
          past: [...state.history.past.slice(-24), state.history.present],
          present: reverted,
          future: [],
        },
      };
    }

    case 'UNDO': {
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        ...state,
        history: {
          ...state.history,
          past: newPast,
          present: previous,
          future: [state.history.present, ...state.history.future],
        },
      };
    }

    case 'REDO': {
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        ...state,
        history: {
          ...state.history,
          past: [...state.history.past, state.history.present],
          present: next,
          future: newFuture,
        },
      };
    }

    case 'SET_FEED_LOADING':
      return { ...state, feedLoading: action.loading, feedError: null };

    case 'SET_FEED_SUCCESS':
      return {
        ...state,
        feedLoading: false,
        feedError: null,
        feedData: { ...state.feedData, [action.source]: action.payload },
      };

    case 'SET_FEED_ERROR':
      return { ...state, feedLoading: false, feedError: action.error };

    case 'SET_LEADS':
      return { ...state, leads: action.leads, leadsLoading: action.loading };

    case 'PREPEND_LEAD':
      return { ...state, leads: [action.lead, ...state.leads] };

    default:
      return state;
  }
}

interface CmsContextValue {
  state: CmsRuntimeState;
  content: CmsContentModel;
  publishedContent: CmsContentModel;
  activePage: CmsPage;
  canUndo: boolean;
  canRedo: boolean;
  hasUnpublishedChanges: boolean;
  dispatch: React.Dispatch<CmsAction>;
  fetchDynamicFeed: (source: ApiFeedSource, options?: { refresh?: boolean; simulateError?: boolean }) => Promise<void>;
  fetchLeads: () => Promise<void>;
  publishSite: () => Promise<void>;
  submitLead: (payload: {
    fullName: string;
    workEmail: string;
    company: string;
    projectScope: string;
    estimatedMonthlyVisits?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cmsReducer, initialState);

  const content = state.history.present;
  const publishedContent = state.history.publishedSnapshot;

  const activePage = useMemo(() => {
    return content.pages.find((p) => p.id === state.activePageId) || content.pages[0];
  }, [content.pages, state.activePageId]);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  const hasUnpublishedChanges = useMemo(() => {
    return JSON.stringify(content) !== JSON.stringify(publishedContent);
  }, [content, publishedContent]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // Ignore storage quota issues
    }
  }, [content]);

  const fetchDynamicFeed = useCallback(
    async (source: ApiFeedSource, options?: { refresh?: boolean; simulateError?: boolean }) => {
      dispatch({ type: 'SET_FEED_LOADING', loading: true });
      try {
        const params = new URLSearchParams({ source });
        if (options?.refresh) params.set('refresh', 'true');
        if (options?.simulateError) params.set('simulateError', 'true');
        const res = await fetch(`/api/feeds/dynamic?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to retrieve third-party API feed.');
        }
        dispatch({ type: 'SET_FEED_SUCCESS', source, payload: data as DynamicFeedResponse });
      } catch (err) {
        dispatch({
          type: 'SET_FEED_ERROR',
          error: err instanceof Error ? err.message : 'Network error loading feed.',
        });
      }
    },
    []
  );

  const fetchLeads = useCallback(async () => {
    dispatch({ type: 'SET_LEADS', leads: state.leads, loading: true });
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) throw new Error('Failed to load leads');
      const data = await res.json();
      dispatch({ type: 'SET_LEADS', leads: data.leads || [], loading: false });
    } catch {
      dispatch({ type: 'SET_LEADS', leads: state.leads, loading: false });
    }
  }, []);

  const publishSite = useCallback(async () => {
    const timestamp =
      new Date().toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' WIB';
    dispatch({ type: 'PUBLISH_CHANGES', timestamp });
    try {
      await fetch('/api/cms/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: content }),
      });
    } catch {
      // Local publish snapshot already updated
    }
  }, [content]);

  const submitLead = useCallback(
    async (payload: {
      fullName: string;
      workEmail: string;
      company: string;
      projectScope: string;
      estimatedMonthlyVisits?: string;
    }) => {
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || 'Could not submit inquiry.' };
        }
        if (data.lead) {
          dispatch({ type: 'PREPEND_LEAD', lead: data.lead });
        }
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while submitting inquiry.' };
      }
    },
    []
  );

  useEffect(() => {
    fetchDynamicFeed('insights');
    fetchLeads();
  }, [fetchDynamicFeed, fetchLeads]);

  const value = useMemo<CmsContextValue>(
    () => ({
      state,
      content,
      publishedContent,
      activePage,
      canUndo,
      canRedo,
      hasUnpublishedChanges,
      dispatch,
      fetchDynamicFeed,
      fetchLeads,
      publishSite,
      submitLead,
    }),
    [
      state,
      content,
      publishedContent,
      activePage,
      canUndo,
      canRedo,
      hasUnpublishedChanges,
      fetchDynamicFeed,
      fetchLeads,
      publishSite,
      submitLead,
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return ctx;
}
