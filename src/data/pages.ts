import { urlMap } from './url-map';

export interface PageData {
  legacyPage: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  content: string;
  pdfs: { href: string; label: string }[];
  breadcrumbs: { label: string; href: string }[];
}

const scrapedModules = import.meta.glob<ScrapedPage>('./scraped/*.json', { eager: true });

interface ScrapedPage {
  page: string;
  title: string;
  description: string;
  h1: string;
  content: string;
  pdfs: { href: string; label: string }[];
}

function fixContentPaths(html: string): string {
  return html
    .replace(/src="images\//g, 'src="/images/')
    .replace(/src="downloads\//g, 'src="/downloads/')
    .replace(/href="downloads\//g, 'href="/downloads/')
    .replace(/href="(\d+\w+\.aspx)"/gi, (_, p) => {
      const mapped = urlMap[p] ?? urlMap[p.charAt(0).toUpperCase() + p.slice(1)];
      return mapped ? `href="${mapped}"` : `href="/${p}"`;
    })
    .replace(/href="(Aboutus|Contactus|Products|Support|Software|newsevents|PrivacyPolicy)\.aspx"/gi, (_, p) => {
      const key = p.charAt(0).toUpperCase() + p.slice(1).replace('us', 'us') + '.aspx';
      const variants = [key, p + '.aspx', p.charAt(0).toUpperCase() + p.slice(1) + '.aspx'];
      for (const v of variants) {
        if (urlMap[v]) return `href="${urlMap[v]}"`;
      }
      return `href="/${p.toLowerCase()}"`;
    });
}

// Friendly breadcrumb labels for slugs that don't title-case cleanly
// (e.g. trademarked product short names).
const breadcrumbLabelOverrides: Record<string, string> = {
  '/inspection/agi-g-r': 'AGI-G/R™',
  '/inspection/agi-t': 'AGI-T™',
};

function buildBreadcrumbs(path: string): { label: string; href: string }[] {
  const crumbs = [{ label: 'Home', href: '/' }];
  const parts = path.split('/').filter(Boolean);
  let current = '';
  for (const part of parts) {
    current += `/${part}`;
    const label =
      breadcrumbLabelOverrides[current] ??
      part
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    crumbs.push({ label, href: current });
  }
  return crumbs;
}

const pages: Map<string, PageData> = new Map();

for (const [, scraped] of Object.entries(scrapedModules)) {
  const legacyPage = scraped.page;
  const path = urlMap[legacyPage];
  if (!path || path === '/') continue;

  pages.set(path, {
    legacyPage,
    path,
    title: scraped.title || scraped.h1 || 'Glasstech, Inc.',
    description: scraped.description,
    h1: scraped.h1,
    content: fixContentPaths(scraped.content),
    pdfs: scraped.pdfs.map((p) => ({
      href: p.href.startsWith('/') ? p.href : `/${p.href}`,
      label: p.label || 'Download PDF',
    })),
    breadcrumbs: buildBreadcrumbs(path),
  });
}

export function getPage(path: string): PageData | undefined {
  return pages.get(path);
}

export function getAllPages(): PageData[] {
  return Array.from(pages.values());
}

export function getPagesByPrefix(prefix: string): PageData[] {
  return getAllPages().filter((p) => p.path.startsWith(prefix));
}

export { pages };
