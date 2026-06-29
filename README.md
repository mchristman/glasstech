# Glasstech Website

Modern static rebuild of [glasstech.com](https://www.glasstech.com), migrated from legacy ASP.NET WebForms to **Astro 7** + **Tailwind CSS 4**.

## Quick Start

```bash
# Requires Node.js 22.15+
npm install
npm run dev      # http://localhost:4321
npm run build    # output → dist/
npm run preview  # preview production build
npm test         # build + Worker runtime smoke tests
```

If `astro build` fails with `node:module` missing the `registerHooks` export, check `node -v`. The current Astro/Vite dependency set requires Node 22.15+ because `module.registerHooks()` was added in Node 22.15.0.

## Project Structure

```
glasstech-website/
├── src/
│   ├── components/     # Header, Footer, MarketCard, ContactForm, etc.
│   ├── data/           # Navigation, URL map, scraped page content
│   ├── layouts/        # BaseLayout
│   ├── pages/          # 54 static routes (auto-generated + custom)
│   └── styles/         # Tailwind theme with Glasstech brand colors
├── public/
│   ├── downloads/      # Product literature PDFs (synced from legacy site)
│   ├── images/         # Brand assets from live site
│   └── robots.txt
├── scripts/
│   ├── scrape.mjs           # Re-scrape content from legacy site
│   ├── download-pdfs.mjs    # Sync PDFs from legacy /downloads/
│   ├── generate-pages.mjs   # Regenerate Astro page files
│   └── generate-redirects.mjs
├── redirects.web.config     # IIS 301 redirect map (61 rules)
└── dist/                    # Production build output
```

## Pages (54 total)

| Section | Routes |
|---------|--------|
| Home | `/` |
| About | `/about` + 5 subpages |
| Products | `/products` + Solar (7), Automotive (13), Architectural (5), Aftermarket (7) |
| Support | `/support` + 3 subpages |
| News & Events | `/news-events` + 3 subpages |
| Inspection | `/inspection` + 4 subpages |
| Contact | `/contact` |
| Privacy | `/privacy-policy` |
| 404 | `/404` |

## Cloudflare deployment

The site deploys automatically to Cloudflare Workers on every push to `main` via [`.github/workflows/deploy-cloudflare.yml`](.github/workflows/deploy-cloudflare.yml). You can also trigger a deploy manually from the GitHub Actions tab (**Deploy to Cloudflare** → **Run workflow**).

### Required GitHub secrets

Add these in the repository settings under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with permission to deploy Workers. This is the only GitHub Actions secret referenced by the deploy workflow. |

### Create a Cloudflare API token

1. Open [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token**.
2. Use the **Edit Cloudflare Workers** template, or create a custom token with at least:
   - **Account → Workers Scripts → Edit**
   - **Account → Account Settings → Read**
3. Copy the token into the `CLOUDFLARE_API_TOKEN` GitHub secret.

After the first successful deploy, map your custom domain in the Cloudflare dashboard (Workers & Pages → `glasstech` → **Settings → Domains & Routes**).

### Worker runtime configuration

The Astro Cloudflare adapter serves the static site and API routes from the Worker defined in [`wrangler.jsonc`](wrangler.jsonc). Keep these runtime bindings configured for the deployed Worker:

| Binding | Required | Purpose |
|---------|----------|---------|
| `RESEND_API_KEY` | Yes | Resend API key used by form API routes to send email. Set with `npx wrangler secret put RESEND_API_KEY` or the Cloudflare dashboard. |
| `FROM_EMAIL` | No | Sender address passed to Resend. If omitted, [`src/lib/sendEmail.ts`](src/lib/sendEmail.ts) uses `Glasstech Website <onboarding@resend.dev>`. |

For local Worker testing, copy `.dev.vars.example` to `.dev.vars` and fill the same bindings. The `.dev.vars*` files are ignored by Git except for the example file.

### Forms and email delivery

The contact and tooling questionnaire forms submit with `fetch()` to Worker API routes instead of opening a mail client:

| Form | Page | API route | Required fields |
|------|------|-----------|-----------------|
| Contact | `/contact` | `POST /api/contact` | `name`, `company`, `country`, `email`, `phone` |
| Tooling questionnaire | `/products/aftermarket/tooling/questionnaire` | `POST /api/tooling-questionnaire` | `contact`, `partName`, `modelName`, `customer`, `phone`, `email`, `location`, `furnaceNumber` |

Both routes return JSON, reject missing required fields with `400`, return `500` when `RESEND_API_KEY` is not configured, and return `502` if Resend rejects the send request. Successful submissions return `{ "ok": true }` and the client-side form swaps to a thank-you state.

Current recipient addresses are defined in the API route files:

- `src/pages/api/contact.ts`
- `src/pages/api/tooling-questionnaire.ts`

The automated tests boot the built Worker with `wrangler dev` and verify key pages and form routes in the same runtime Cloudflare uses in production. Keep the `nodejs_compat` compatibility flag in `wrangler.jsonc`; the regression tests assert it because Astro's server runtime expects Node-compatible globals.

### GitHub Pages

If GitHub Pages is still enabled on this repo, it may run Jekyll builds that fail on Astro output. Disable Pages under **Settings → Pages** if you no longer need it.

## Deployment to IIS

### 1. Build the site

```bash
npm run build
```

This produces a static site in `dist/`.

### 2. Copy files to IIS

Copy the entire contents of `dist/` to the IIS site root (e.g. `C:\inetpub\wwwroot\glasstech`).

Also copy from the legacy server if needed:
- Any additional assets not included in this build

Product literature PDFs live in `public/downloads/` and are synced from the legacy site with `node scripts/download-pdfs.mjs`.

### 3. Configure IIS redirects

Copy `redirects.web.config` to the IIS site root. This file contains 301 permanent redirects for all legacy `.aspx` URLs:

```
default.aspx          → /
Aboutus.aspx          → /about
321Automotive.aspx    → /products/automotive/db-4
Contactus.aspx        → /contact
... (61 rules total)
```

**Prerequisites:**
- Install [IIS URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)
- Ensure `web.config` (this file) is deployed alongside the static files

### 4. IIS site configuration

- **Default document:** `index.html`
- **Static content:** Enable serving of `.html`, `.css`, `.js`, `.svg`, `.webp`, `.pdf`
- **Error pages:** 404 is handled via `404.html` in the build output
- **HTTPS:** Recommended; configure SSL certificate as usual

## Re-scraping Content

If the legacy site content changes before final cutover:

```bash
node scripts/scrape.mjs
node scripts/generate-pages.mjs
node scripts/generate-redirects.mjs
npm run build
```

## Brand Colors (Tailwind theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#4a5b73` | Headers, links |
| `chrome` | `#323d4e` | Dark text, footer |
| `body` | `#545557` | Body text |
| `accent` | `#b3282e` | CTAs, buttons only |

## Tech Stack

- [Astro 7](https://astro.build/) — static site generator
- [Tailwind CSS 4](https://tailwindcss.com/) — utility-first styling
- [Inter](https://fonts.google.com/specimen/Inter) — typography
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — auto-generated sitemap

## License

Proprietary — © Glasstech, Inc.
