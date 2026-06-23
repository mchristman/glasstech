#!/usr/bin/env node
/**
 * Generate Astro page files from url-map and scraped content
 */
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = join(__dirname, '../src/pages');

const urlMap = {
  'Aboutus.aspx': '/about',
  'CorporateOverview.aspx': '/about/corporate-overview',
  'InvestorRelations.aspx': '/about/investor-relations',
  'MarketsServed.aspx': '/about/markets-served',
  'Quality.aspx': '/about/quality',
  'JobOpportunities.aspx': '/about/job-opportunities',
  'Products.aspx': '/products',
  '31Solar.aspx': '/products/solar',
  '311Solar.aspx': '/products/solar/crb-s',
  '312Solar.aspx': '/products/solar/epb-s',
  '313Solar.aspx': '/products/solar/db-4-s',
  '314Solar.aspx': '/products/solar/erh-s',
  '315Solar.aspx': '/products/solar/fch-s',
  '316Solar.aspx': '/products/solar/prototype-production',
  '32Automotive.aspx': '/products/automotive',
  '321Automotive.aspx': '/products/automotive/db-4',
  '322Automotive.aspx': '/products/automotive/db-4-quick-change',
  '323Automotive.aspx': '/products/automotive/dbx-t',
  '324Automotive.aspx': '/products/automotive/epb-l-xl',
  '325Automotive.aspx': '/products/automotive/epb-t-xt',
  '326Automotive.aspx': '/products/automotive/crb',
  '326XAutomotive.aspx': '/products/automotive/crb-x',
  '327Automotive.aspx': '/products/automotive/qs',
  '328Automotive.aspx': '/products/automotive/epb-l-t',
  '329Automotive.aspx': '/products/automotive/erh',
  '32LTAutomotive.aspx': '/products/automotive/epb-lt',
  '32XLTAutomotive.aspx': '/products/automotive/epb-xlt',
  '33Architectural.aspx': '/products/architectural',
  '331Architectural.aspx': '/products/architectural/abts',
  '332Architectural.aspx': '/products/architectural/fch2',
  '333Architectural.aspx': '/products/architectural/erh2',
  '334Architectural.aspx': '/products/architectural/trcb',
  '34Aftermarket.aspx': '/products/aftermarket',
  '341Aftermarket.aspx': '/products/aftermarket/retrofits',
  '342Aftermarket.aspx': '/products/aftermarket/replacement-parts',
  '343Aftermarket.aspx': '/products/aftermarket/service',
  '344Aftermarket.aspx': '/products/aftermarket/tooling',
  '345Aftermarket.aspx': '/products/aftermarket/shape-modeler',
  '346Aftermarket.aspx': '/products/aftermarket/prototype-production',
  'Support.aspx': '/support',
  '41support.aspx': '/support/technical-support',
  '42support.aspx': '/support/training',
  '43support.aspx': '/support/download-literature',
  'newsevents.aspx': '/news-events',
  '51NewsEvents.aspx': '/news-events/news',
  '52NewsEvents.aspx': '/news-events/events',
  '53NewsEvents.aspx': '/news-events/trade-shows',
  'Software.aspx': '/inspection',
  '71AGIR.aspx': '/inspection/agi-g-r',
  '71AGIT.aspx': '/inspection/agi-t',
  '72Software.aspx': '/inspection/software',
  '73Software.aspx': '/inspection/shape-modeler',
  'PrivacyPolicy.aspx': '/privacy-policy',
};

const PAGE_TEMPLATE = (path) => `---
import ContentPage from '../../components/ContentPage.astro';
import { getPage } from '../../data/pages';

const page = getPage('${path}');
if (!page) return Astro.redirect('/404');
---

<ContentPage page={page} />
`;

function pathToFile(cleanPath) {
  const parts = cleanPath.split('/').filter(Boolean);
  const filename = parts.pop() + '.astro';
  const dir = join(PAGES_DIR, ...parts);
  return { dir, filename, full: join(dir, filename) };
}

// Clean generated pages (keep index.astro and contact.astro)
const skip = new Set(['index.astro', 'contact.astro', '404.astro']);

let count = 0;
for (const [legacy, cleanPath] of Object.entries(urlMap)) {
  const { dir, filename, full } = pathToFile(cleanPath);
  mkdirSync(dir, { recursive: true });

  const depth = cleanPath.split('/').filter(Boolean).length;
  const importDepth = '../'.repeat(depth);
  const content = `---
import ContentPage from '${importDepth}components/ContentPage.astro';
import { getPage } from '${importDepth}data/pages';

const page = getPage('${cleanPath}');
if (!page) return Astro.redirect('/404');
---

<ContentPage page={page} />
`;

  writeFileSync(full, content);
  count++;
  console.log(`  ${legacy} → ${cleanPath}`);
}

console.log(`\nGenerated ${count} pages.`);
