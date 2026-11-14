import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// In-memory store for third-party API feed simulation, CMS state persistence, and corporate leads
let persistedCmsState: unknown = null;

interface LeadSubmission {
  id: string;
  fullName: string;
  workEmail: string;
  company: string;
  projectScope: string;
  estimatedMonthlyVisits?: string;
  submittedAt: string;
}

const corporateLeads: LeadSubmission[] = [
  {
    id: 'lead-seed-1',
    fullName: 'Rina Kusuma',
    workEmail: 'rina.kusuma@mandiri-digital.co.id',
    company: 'Mandiri Digital Ventures',
    projectScope: 'AEM Template Standardization & Responsive Asset Pipeline',
    estimatedMonthlyVisits: '420,000 / mo',
    submittedAt: '2026-11-13 15:22 WIB',
  },
  {
    id: 'lead-seed-2',
    fullName: 'Daniel Tan',
    workEmail: 'dtan@pacificgrid.sg',
    company: 'Pacific Grid Holdings',
    projectScope: 'Multi-Region Corporate Portal & Investor API Integration',
    estimatedMonthlyVisits: '195,000 / mo',
    submittedAt: '2026-11-14 08:45 WIB',
  },
];

const FEED_DATASETS: Record<
  string,
  {
    endpoint: string;
    items: Array<{
      id: string;
      title: string;
      category: string;
      publishedAt: string;
      source: string;
      summary: string;
      metricTag: string;
    }>;
  }
> = {
  insights: {
    endpoint: 'https://api.studiowebsite.id/v2/corporate-insights',
    items: [
      {
        id: 'ins-1',
        title: 'AVIF & Responsive Srcset Rollout Across 14 Corporate Subsidiaries',
        category: 'Performance Engineering',
        publishedAt: 'Nov 12, 2026',
        source: 'AEM Edge Telemetry',
        summary:
          'Replacing monolithic desktop hero JPEGs with negotiated AVIF/WebP breakpoints lowered median mobile transfer size from 3.4 MB to 780 KB.',
        metricTag: '-77% Mobile Payload',
      },
      {
        id: 'ins-2',
        title: 'Unified Header & Navigation Governance in Multi-Brand Portals',
        category: 'Content Architecture',
        publishedAt: 'Nov 08, 2026',
        source: 'Platform Advisory',
        summary:
          'Decoupling global chrome fragments from campaign landing templates eliminated layout drift across 48 localized enterprise pages.',
        metricTag: '48 Pages Governed',
      },
      {
        id: 'ins-3',
        title: 'Eliminating WebKit Subgrid & Backdrop Regressions Before Publish',
        category: 'Cross-Browser QA',
        publishedAt: 'Nov 03, 2026',
        source: 'Compatibility Matrix',
        summary:
          'Automated @supports fallback checks caught Safari flex-gap alignment discrepancies prior to Q4 investor disclosure publishing.',
        metricTag: '4 Engines Verified',
      },
      {
        id: 'ins-4',
        title: 'Deterministic Client State for Interactive Enterprise Calculators',
        category: 'Engagement Systems',
        publishedAt: 'Oct 28, 2026',
        source: 'Frontend Guild',
        summary:
          'Centralized reducer state synchronized estimator outputs directly with validated inquiry forms, lifting qualified lead completions.',
        metricTag: '+42% Lead Completion',
      },
    ],
  },
  press: {
    endpoint: 'https://newsroom.studiowebsite.id/api/press-releases',
    items: [
      {
        id: 'prs-1',
        title: 'studiowebsite.id Launches Zero-Downtime Corporate Template Registry',
        category: 'Press Release',
        publishedAt: 'Nov 14, 2026',
        source: 'Jakarta Newsroom',
        summary:
          'Enterprise content teams can now preview desktop, tablet, and mobile layouts simultaneously before committing atomic page releases.',
        metricTag: 'Release 2026.4',
      },
      {
        id: 'prs-2',
        title: 'Regional Banking Consortium Selects studiowebsite.id for Web Modernization',
        category: 'Client Milestone',
        publishedAt: 'Nov 06, 2026',
        source: 'Corporate Desk',
        summary:
          'Multi-year engagement standardizes investor relations, ESG disclosures, and branch locators under strict WCAG AA contrast standards.',
        metricTag: '12 Country Portals',
      },
      {
        id: 'prs-3',
        title: 'Sub-Second Edge Caching Benchmark Published for Southeast Asia',
        category: 'Benchmark Report',
        publishedAt: 'Oct 29, 2026',
        source: 'Network Ops',
        summary:
          'Independent synthetic probes recorded 880ms median Largest Contentful Paint across Jakarta, Surabaya, and Singapore mobile carriers.',
        metricTag: '880ms Median LCP',
      },
      {
        id: 'prs-4',
        title: 'Open Schema Connectors Released for Third-Party ERP & ESG Feeds',
        category: 'Partner Ecosystem',
        publishedAt: 'Oct 19, 2026',
        source: 'Integration Lab',
        summary:
          'Native JSON transformers validate and cache external corporate filings prior to rendering inside CMS content sections.',
        metricTag: '99.98% Uptime SLA',
      },
    ],
  },
  exchange: {
    endpoint: 'https://feeds.studiowebsite.id/api/apac-digital-index',
    items: [
      {
        id: 'exc-1',
        title: 'IDX Enterprise Digital Transformation Index — Q4 Pulse',
        category: 'Market Feed',
        publishedAt: 'Nov 14, 2026',
        source: 'APAC Digital Feed',
        summary:
          '79% of surveyed Indonesian enterprise issuers prioritized Core Web Vitals remediation and headless/AEM CMS consolidation for FY2027.',
        metricTag: '79% Priority Index',
      },
      {
        id: 'exc-2',
        title: 'Southeast Asia Mobile Traffic Share Reaches 71.4% on Corporate Domains',
        category: 'Traffic Telemetry',
        publishedAt: 'Nov 10, 2026',
        source: 'Regional Edge Telemetry',
        summary:
          'Responsive container queries and adaptive 375px layout governance are now decisive factors in institutional investor bounce rates.',
        metricTag: '71.4% Mobile Share',
      },
      {
        id: 'exc-3',
        title: 'Enterprise Accessibility Compliance Audit Benchmark (WCAG 2.2 AA)',
        category: 'Governance',
        publishedAt: 'Nov 01, 2026',
        source: 'Compliance Monitor',
        summary:
          'Structured semantic HTML5 landmarks and 4.5:1 contrast validation reduced manual QA remediation cycles by 54%.',
        metricTag: '-54% QA Cycles',
      },
    ],
  },
};

const feedCacheTimestamps: Record<string, number> = {};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'studiowebsite-cms', timestamp: new Date().toISOString() });
});

app.get('/api/cms/state', (_req, res) => {
  res.json({ state: persistedCmsState });
});

app.put('/api/cms/state', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ error: 'Invalid CMS state payload' });
    return;
  }
  persistedCmsState = req.body.state ?? req.body;
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.get('/api/feeds/dynamic', (req, res) => {
  const start = Date.now();
  const source = String(req.query.source || 'insights');
  const forceRefresh = req.query.refresh === 'true';
  const simulateError = req.query.simulateError === 'true';

  if (simulateError) {
    res.status(503).json({
      error: 'Upstream corporate feed endpoint temporarily unavailable (503).',
      endpoint: FEED_DATASETS[source]?.endpoint || FEED_DATASETS.insights.endpoint,
    });
    return;
  }

  const dataset = FEED_DATASETS[source] || FEED_DATASETS.insights;
  const now = Date.now();
  const lastFetched = feedCacheTimestamps[source] || 0;
  const isHit = !forceRefresh && now - lastFetched < 30000;
  feedCacheTimestamps[source] = now;

  const latencyMs = Math.max(12, Date.now() - start + (isHit ? 14 : 68));

  res.json({
    source,
    endpoint: dataset.endpoint,
    fetchedAt: new Date().toISOString(),
    latencyMs,
    cacheState: isHit ? 'HIT' : 'FRESH',
    items: dataset.items,
  });
});

app.get('/api/leads', (_req, res) => {
  res.json({ leads: corporateLeads });
});

app.post('/api/leads', (req, res) => {
  const { fullName, workEmail, company, projectScope, estimatedMonthlyVisits } = req.body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    res.status(400).json({ error: 'Please enter your full name.' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!workEmail || typeof workEmail !== 'string' || !emailRegex.test(workEmail.trim())) {
    res.status(400).json({ error: 'Please provide a valid corporate email address.' });
    return;
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    res.status(400).json({ error: 'Please enter your organization name.' });
    return;
  }

  const newLead: LeadSubmission = {
    id: `lead-${Date.now()}`,
    fullName: fullName.trim(),
    workEmail: workEmail.trim(),
    company: company.trim(),
    projectScope:
      typeof projectScope === 'string' && projectScope.trim()
        ? projectScope.trim()
        : 'Corporate Website Modernization',
    estimatedMonthlyVisits:
      typeof estimatedMonthlyVisits === 'string' ? estimatedMonthlyVisits : undefined,
    submittedAt: new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };

  corporateLeads.unshift(newLead);
  res.status(201).json({ lead: newLead });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`studiowebsite.id CMS server running on http://localhost:${PORT}`);
  });
}

startServer();
