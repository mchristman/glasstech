# Glasstech Website

Modern static rebuild of [glasstech.com](https://www.glasstech.com), migrated from legacy ASP.NET WebForms to **Astro 5** + **Tailwind CSS 4**.

## Quick Start

```bash
# Requires Node.js 22.12+
npm install
npm run dev      # http://localhost:4321
npm run build    # output → dist/
npm run preview  # preview production build
```

## Project Structure

```
glasstech-website/
├── src/
│   ├── components/     # Header, Footer, MarketCard, ContactForm, etc.
│   ├── data/           # Navigation, URL map, scraped page content
│   ├── layouts/        # BaseLayout
│   ├── pages/          # 56 static routes (auto-generated + custom)
│   └── styles/         # Tailwind theme with Glasstech brand colors
├── public/
│   ├── images/         # Brand assets from live site
│   └── robots.txt
├── scripts/
│   ├── scrape.mjs           # Re-scrape content from legacy site
│   ├── generate-pages.mjs   # Regenerate Astro page files
│   └── generate-redirects.mjs
├── redirects.web.config     # IIS 301 redirect map (61 rules)
└── dist/                    # Production build output
```

## Pages (56 total)

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

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `PUBLIC_CONTACT_FORM_ENDPOINT` | URL for contact form POST handler |

The contact form UI is built but requires IT to configure an endpoint (e.g. Formspree, Azure Function, or custom API). Without this, the form displays a configuration message on submit.

## Deployment to IIS

### 1. Build the site

```bash
npm run build
```

This produces a static site in `dist/`.

### 2. Copy files to IIS

Copy the entire contents of `dist/` to the IIS site root (e.g. `C:\inetpub\wwwroot\glasstech`).

Also copy from the legacy server:
- `/downloads/` folder (PDFs and product literature referenced by product pages)
- Any additional assets not included in this build

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

### 5. Contact form

Set up a form handler endpoint and configure:

```bash
# In .env before build, or as IIS environment variable
PUBLIC_CONTACT_FORM_ENDPOINT=https://your-form-handler.example.com/submit
```

Rebuild after setting the variable since Astro inlines `PUBLIC_*` vars at build time.

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

- [Astro 5](https://astro.build/) — static site generator
- [Tailwind CSS 4](https://tailwindcss.com/) — utility-first styling
- [Inter](https://fonts.google.com/specimen/Inter) — typography
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — auto-generated sitemap

## License

Proprietary — © Glasstech, Inc.
