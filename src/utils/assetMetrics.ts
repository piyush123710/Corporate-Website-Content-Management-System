import { ImageFormat, MediaAsset, SectionBlock, SectionType } from '../types/cms';

export function computeOptimizedSizeKb(asset: MediaAsset): number {
  const formatFactor: Record<ImageFormat, number> = {
    AVIF: 0.24,
    WebP: 0.34,
    JPEG: 0.62,
  };
  const qualityScale = 0.55 + (asset.quality / 100) * 0.65;
  const computed = Math.round(asset.originalSizeKb * formatFactor[asset.targetFormat] * qualityScale);
  return Math.max(24, computed);
}

export function computeSavingsPercent(asset: MediaAsset): number {
  const optimized = computeOptimizedSizeKb(asset);
  const pct = Math.round(((asset.originalSizeKb - optimized) / asset.originalSizeKb) * 100);
  return Math.max(0, Math.min(96, pct));
}

export function buildResponsivePictureHtml(asset: MediaAsset): string {
  const ext = asset.targetFormat.toLowerCase();
  const baseName = asset.name.replace(/\.[^.]+$/, '');
  const widths = [...asset.responsiveWidths].sort((a, b) => a - b);
  const srcset = widths.map((w) => `/dam/${baseName}-${w}w.${ext} ${w}w`).join(',\n      ');
  const fallbackSrc = `/dam/${baseName}-${widths[widths.length - 1] || 1200}w.jpg`;

  return `<picture>
  <source
    type="image/${ext}"
    srcset="${srcset}"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1440px"
  />
  <img
    src="${fallbackSrc}"
    alt="${asset.alt}"
    width="${asset.width}"
    height="${asset.height}"
    loading="${asset.loadingPriority}"
    decoding="${asset.loadingPriority === 'eager' ? 'sync' : 'async'}"
  />
</picture>`;
}

export function createSectionBlock(type: SectionType): SectionBlock {
  const id = `sec-${type}-${Date.now().toString(36)}`;
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        label: 'Hero Banner',
        visible: true,
        surfaceTone: 'light',
        kicker: 'Corporate Architecture · Modular Publishing',
        headline: 'Enterprise digital platforms authored once, delivered everywhere.',
        subheadline:
          'Standardize corporate web governance with reusable templates, optimized media pipelines, and real-time API feeds.',
        primaryCtaLabel: 'Explore Capabilities',
        primaryCtaTarget: '/capabilities',
        assetId: 'asset-hero-hq',
      };
    case 'capabilities_bento':
      return {
        id,
        type: 'capabilities_bento',
        label: 'Capabilities Grid',
        visible: true,
        surfaceTone: 'muted',
        sectionTitle: 'Structured components built for multi-brand governance.',
        sectionIntro:
          'Every component enforces responsive breakpoints, contrast ratios, and cross-browser parity.',
        capabilities: [
          {
            id: `cap-${Date.now()}-1`,
            number: '01.',
            title: 'Reusable Page Templates',
            description:
              'Consistent layout architecture across corporate landing pages, regional portals, and investor updates.',
            outcomeMetric: '65% faster campaign launch',
            spanWide: true,
            assetId: 'asset-team-blueprint',
          },
          {
            id: `cap-${Date.now()}-2`,
            number: '02.',
            title: 'Adaptive Media Delivery',
            description:
              'Automated AVIF/WebP formatting and responsive srcset sizing tailored to device viewports.',
            outcomeMetric: '74% smaller image payloads',
            spanWide: false,
            assetId: 'asset-cloud-infra',
          },
        ],
      };
    case 'proof_metrics':
      return {
        id,
        type: 'proof_metrics',
        label: 'Proof Metrics Strip',
        visible: true,
        surfaceTone: 'navy',
        sectionTitle: 'Verified production performance benchmarks.',
        metrics: [
          {
            id: `pm-${Date.now()}-1`,
            value: '0.9s',
            label: 'Median LCP',
            context: 'Global edge CDN caching',
          },
          {
            id: `pm-${Date.now()}-2`,
            value: '72%',
            label: 'Media Savings',
            context: 'AVIF & WebP negotiation',
          },
          {
            id: `pm-${Date.now()}-3`,
            value: '+38%',
            label: 'Lead Conversion',
            context: 'Interactive scoping flows',
          },
          {
            id: `pm-${Date.now()}-4`,
            value: '100%',
            label: 'WCAG AA Parity',
            context: 'Automated contrast checks',
          },
        ],
      };
    case 'dynamic_api_feed':
      return {
        id,
        type: 'dynamic_api_feed',
        label: 'Dynamic API Feed',
        visible: true,
        surfaceTone: 'light',
        sectionTitle: 'Live Corporate Feed',
        sectionIntro: 'Real-time JSON items fetched from /api/feeds/dynamic.',
        feedSource: 'insights',
        feedLimit: 3,
      };
    case 'engagement_estimator':
      return {
        id,
        type: 'engagement_estimator',
        label: 'Readiness Estimator',
        visible: true,
        surfaceTone: 'muted',
        estimatorTitle: 'Model bandwidth savings and LCP improvement.',
        estimatorSubtitle:
          'Interactive scoping widget synchronized with the centralized CMS state.',
        defaultMonthlyVisits: 150000,
        defaultLegacyWeightKb: 3200,
      };
    case 'lead_capture':
      return {
        id,
        type: 'lead_capture',
        label: 'Lead Capture Form',
        visible: true,
        surfaceTone: 'light',
        formTitle: 'Request a corporate platform briefing.',
        formSubtitle: 'Submitted inquiries appear immediately in the CMS Integrations ledger.',
        submitLabel: 'Submit Inquiry',
        confirmationMessage: 'Inquiry received and logged in the CMS lead ledger.',
      };
  }
}
