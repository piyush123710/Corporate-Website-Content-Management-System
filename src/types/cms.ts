export type WorkspaceTab = 'authoring' | 'templates' | 'assets' | 'integrations' | 'live_site';

export type BreakpointMode = 'desktop' | 'tablet' | 'mobile';

export type PageTemplateId =
  | 'corporate-landing'
  | 'capabilities-matrix'
  | 'executive-insights'
  | 'contact-funnel';

export type SectionType =
  | 'hero'
  | 'capabilities_bento'
  | 'proof_metrics'
  | 'dynamic_api_feed'
  | 'engagement_estimator'
  | 'lead_capture';

export type ApiFeedSource = 'insights' | 'press' | 'exchange';

export type ImageFormat = 'AVIF' | 'WebP' | 'JPEG';

export interface NavLinkItem {
  id: string;
  label: string;
  targetSlug: string;
}

export interface GlobalHeaderConfig {
  brandWordmark: string;
  ctaLabel: string;
  ctaTargetSlug: string;
  navLinks: NavLinkItem[];
}

export interface FooterColumn {
  id: string;
  heading: string;
  links: { id: string; label: string; href: string }[];
}

export interface GlobalFooterConfig {
  companyName: string;
  headquartersNote: string;
  copyrightText: string;
  columns: FooterColumn[];
}

export interface CapabilityItem {
  id: string;
  number: string;
  title: string;
  description: string;
  outcomeMetric: string;
  spanWide?: boolean;
  assetId?: string;
}

export interface ProofMetricItem {
  id: string;
  value: string;
  label: string;
  context: string;
}

export interface SectionBlock {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  surfaceTone: 'light' | 'muted' | 'navy';
  // Hero props
  kicker?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaTarget?: string;
  assetId?: string;
  // Capabilities props
  sectionTitle?: string;
  sectionIntro?: string;
  capabilities?: CapabilityItem[];
  // Proof metrics props
  metrics?: ProofMetricItem[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  // Dynamic API Feed props
  feedSource?: ApiFeedSource;
  feedLimit?: number;
  // Engagement Estimator props
  estimatorTitle?: string;
  estimatorSubtitle?: string;
  defaultMonthlyVisits?: number;
  defaultLegacyWeightKb?: number;
  // Lead Capture props
  formTitle?: string;
  formSubtitle?: string;
  submitLabel?: string;
  confirmationMessage?: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  templateId: PageTemplateId;
  status: 'published' | 'draft';
  lastModified: string;
  metaDescription: string;
  sections: SectionBlock[];
}

export interface MediaAsset {
  id: string;
  name: string;
  alt: string;
  url: string;
  originalSizeKb: number;
  width: number;
  height: number;
  targetFormat: ImageFormat;
  quality: number;
  loadingPriority: 'eager' | 'lazy';
  responsiveWidths: number[];
  usedInPages: string[];
}

export interface PageTemplateDefinition {
  id: PageTemplateId;
  name: string;
  category: string;
  description: string;
  defaultSections: SectionType[];
  gridSystem: string;
}

export interface BrowserCompatibilityRule {
  id: string;
  feature: string;
  cssProperty: string;
  chrome: 'Supported' | 'Fallback Active';
  safari: 'Supported' | 'Fallback Active';
  firefox: 'Supported' | 'Fallback Active';
  edge: 'Supported' | 'Fallback Active';
  fallbackStrategy: string;
  verified: boolean;
}

export interface DynamicFeedItem {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  source: string;
  summary: string;
  metricTag: string;
}

export interface DynamicFeedResponse {
  source: ApiFeedSource;
  endpoint: string;
  fetchedAt: string;
  latencyMs: number;
  cacheState: 'HIT' | 'FRESH';
  items: DynamicFeedItem[];
}

export interface CorporateLeadRecord {
  id: string;
  fullName: string;
  workEmail: string;
  company: string;
  projectScope: string;
  estimatedMonthlyVisits?: string;
  submittedAt: string;
}

export interface CmsContentModel {
  globalHeader: GlobalHeaderConfig;
  globalFooter: GlobalFooterConfig;
  pages: CmsPage[];
  assets: MediaAsset[];
  compatibilityRules: BrowserCompatibilityRule[];
}
