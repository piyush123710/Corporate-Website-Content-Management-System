# studiowebsite.id — Corporate Website Content Management System

A full-stack Corporate Website Content Management System inspired by **Adobe Experience Manager (AEM)** authoring workflows. Built for authoring, optimizing, verifying, and publishing responsive corporate web experiences for **studiowebsite.id**.

## Features

- **AEM-Style Page & Component Authoring (`Authoring`)**
  - Three-pane visual studio with a corporate page tree (`/`, `/capabilities`, `/insights`, `/contact`), section layer controls (reorder, toggle visibility, duplicate, delete, add block), and a contextual property inspector.
  - Reusable **Global Header & Navigation** and **Global Footer** fragments that propagate updates across every page template.
  - Interactive **Responsive Breakpoint Preview** switching live layouts between **Desktop (1440px)**, **Tablet (768px)**, and **Mobile (375px)** viewports.
  - Centralized `useReducer` + Context state store (`src/store/cmsStore.tsx`) supporting **Undo / Redo** command history, draft-vs-published snapshot tracking, and `localStorage` + server persistence.

- **Page Templates & Cross-Browser Lab (`Templates`)**
  - Reusable corporate templates (`Corporate Landing`, `Capabilities Matrix`, `Executive Insights`, `Contact & Lead Funnel`) with one-click page instantiation.
  - Interactive **Cross-Browser CSS3 & HTML5 Compatibility Matrix** tracking `subgrid`, container queries, `<picture>` codec negotiation, fluid `clamp()` typography, and `backdrop-filter` fallbacks across Chrome, Safari (WebKit), Firefox, and Edge.

- **Digital Asset Manager & Delivery Optimizer (`Assets`)**
  - Configure target image codecs (`AVIF`, `WebP`, `JPEG`), compression quality (`50%–95%`), browser loading priority (`eager` vs. `lazy`), responsive `srcset` breakpoints (`320w`–`1920w`), and WCAG AA `alt` text.
  - Live payload savings calculations and copyable HTML5 `<picture>` markup generation.

- **Third-Party API Feeds & Lead Ledger (`Integrations`)**
  - Server-side REST integration (`/api/feeds/dynamic`) supporting multiple corporate endpoints (`insights`, `press`, `exchange`), cache state inspection, and 503 fallback recovery testing.
  - Real-time **Captured Corporate Inquiries** table backed by `/api/leads`.

- **Published Corporate Site (`Live Site`)**
  - Full-bleed preview of the published corporate website featuring an interactive **Readiness & Bandwidth Estimator** synchronized with the validated **Lead Capture Form**.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Backend:** Express (`server.ts`), Vite middleware
- **Tooling:** `tsx`, `vite`, TypeScript (`tsc --noEmit`)

## Project Structure

```text
├── server.ts                               # Express server, Vite middleware, and /api/* routes
├── index.html                              # HTML entry point and font imports
├── src/
│   ├── App.tsx                             # Studio top bar and workspace router
│   ├── main.tsx                            # React mount point
│   ├── index.css                           # Tailwind CSS v4 configuration & typography tokens
│   ├── types/cms.ts                        # Shared TypeScript interfaces
│   ├── data/
│   │   ├── assetUrls.ts                    # Bundled image asset exports
│   │   └── initialCmsState.ts              # Seeded corporate pages, templates, and assets
│   ├── store/cmsStore.tsx                  # Centralized state management with Undo/Redo & API sync
│   ├── utils/assetMetrics.ts               # Payload calculations, <picture> HTML generator, block factory
│   └── components/
│       ├── cms/
│       │   ├── AuthoringView.tsx           # 3-pane AEM-style visual authoring studio
│       │   ├── TemplatesView.tsx           # Template registry & cross-browser compatibility matrix
│       │   ├── AssetsView.tsx              # Digital Asset Manager & codec optimizer
│       │   └── IntegrationsView.tsx        # Dynamic API inspector & corporate lead ledger
│       └── site/
│           ├── CorporateSiteRenderer.tsx   # Reusable corporate site & custom engagement widgets
│           └── OptimizedPicture.tsx        # Resilient image container with fallback handling
```

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/cms/state` | Retrieve persisted CMS content state |
| `PUT` | `/api/cms/state` | Save published CMS content state |
| `GET` | `/api/feeds/dynamic?source=insights\|press\|exchange` | Fetch dynamic corporate feed JSON (`refresh=true`, `simulateError=true` supported) |
| `GET` | `/api/leads` | List submitted corporate inquiries |
| `POST` | `/api/leads` | Validate and store a corporate inquiry submission |

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (optional):**
   Copy `.env.example` to `.env` if setting custom environment variables.

3. **Run the development server (port 3000):**
   ```bash
   npm run dev
   ```

4. **Type-check and build for production:**
   ```bash
   npm run lint
   npm run build
   ```
