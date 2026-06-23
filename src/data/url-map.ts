/**
 * Legacy .aspx URL → clean slug mapping for redirects and internal links
 */
export const urlMap: Record<string, string> = {
  'default.aspx': '/',
  'Default.aspx': '/',
  'Aboutus.aspx': '/about',
  'AboutUs.aspx': '/about',
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
  '324Automotive.aspx': '/products/automotive/crb',
  '326Automotive.aspx': '/products/automotive/epb-l-xl',
  '326XAutomotive.aspx': '/products/automotive/crb-x',
  '327Automotive.aspx': '/products/automotive/qs',
  '328Automotive.aspx': '/products/automotive/epb-t-xt',
  '329Automotive.aspx': '/products/automotive/erh',
  '32LTAutomotive.aspx': '/products/automotive/epb-l-t',
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
  'support.aspx': '/support',
  '41support.aspx': '/support/technical-support',
  '42support.aspx': '/support',
  '43support.aspx': '/support',
  'newsevents.aspx': '/news-events',
  'NewsEvents.aspx': '/news-events',
  'Newsevents.aspx': '/news-events',
  '51NewsEvents.aspx': '/news-events/news',
  '52NewsEvents.aspx': '/news-events/events',
  '53NewsEvents.aspx': '/news-events/trade-shows',
  'Software.aspx': '/inspection',
  '71AGIR.aspx': '/inspection/agi-g-r',
  '71AGIT.aspx': '/inspection/agi-t',
  '72Software.aspx': '/inspection/software',
  '73Software.aspx': '/inspection/shape-modeler',
  'Contactus.aspx': '/contact',
  'ContactUs.aspx': '/contact',
  'PrivacyPolicy.aspx': '/privacy-policy',
};

export function legacyToClean(legacyUrl: string): string {
  const filename = legacyUrl.split('/').pop()?.split('?')[0] ?? legacyUrl;
  return urlMap[filename] ?? urlMap[filename.toLowerCase()] ?? '/';
}

export function cleanUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}
