# Rokar POS — Marketing Site

Public marketing site for **Rokar POS** (offline-first billing & inventory app for retail shops in Pakistan).

Stack: **Vite + React + TypeScript + Three.js (@react-three/fiber/drei) + Framer Motion**. Fully static deploy.

## Local dev

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & preview

```bash
npm run build      # outputs static site to dist/
npm run preview    # serves dist/ locally for a final check
```

## Content you will want to update (single source of truth)

All site copy + links live in **`src/content.ts`**:

| Constant | What to change |
| --- | --- |
| `DOWNLOAD_URL` | The installer link. Currently points at the live GitHub latest: `…/pos-releases/releases/latest/download/RokarPOS-Setup-2.8.0.exe`. Swap to your own host when ready. |
| `LATEST_VERSION` | Bump when you ship a new release. |
| `FEATURES`, `STEPS`, `PRICING_INCLUDES`, `SYS_REQS`, `FAQ` | Section copy. |
| Footer contact (in `src/components/Footer.tsx`) | Phone / email / support hours (currently placeholders). |

## Assets

- `public/logo.png` — brand mark (800x793, copied from the app's `rokar-sidebar-icon.png`).
- `public/favicon.svg` — generated favicon (rounded-teal "R" + gold tally tick).
- `public/og-cover.svg` — social share image. **Note:** some platforms (X/Twitter) prefer a PNG/JPG; replace with a real PNG screenshot later if you care about rich previews. Keep filename `og-cover.png` if you do.

## Performance notes

- The Three.js scene is **lazy-loaded** (`React.lazy` + manual chunk) and only mounts on `min-width: 900px` with motion enabled; mobile / reduced-motion get a static SVG terminal. The 3D vendor chunk (~1 MB raw / ~290 KB gzip) never loads on phones.
- Google Fonts use `preconnect` + `display=swap`. Headings: **Fraunces**; body: **Manrope**; Urdu spans: **Noto Nastaliq Urdu**.

---

## Deploy

### A) Vercel (easiest)

1. Push this repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
2. Framework preset auto-detects **Vite** (`build`: `npm run build`, output: `dist`, install: `npm install`). Nothing else to configure.

### B) Netlify

1. Push to GitHub, import at app.netlify.com/drop or via the GitHub flow.
2. Build command `npm run build`, publish directory `dist`.

### C) Cloudflare Pages

```bash
npm i -g wrangler
wrangler pages deploy dist
```
or: Dashboard → Pages → "Upload assets" → select `dist/`.

### D) GitHub Pages

Either push `dist/` to a `gh-pages` branch, or add `vite build` with a `base`:

```bash
npm i -D gh-pages
# vite.config.ts: set base: '/REPO_NAME/' only for GH Pages subpath hosting
```

## Prerequisites

- Node 18+ (tested with Node 24).
- Windows note: on this machine use the portable toolchain and full `npx.cmd` path if `npx` is unsigned-blocked.