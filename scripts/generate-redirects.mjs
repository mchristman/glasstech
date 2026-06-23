#!/usr/bin/env node
/**
 * Generate IIS redirects.web.config from url-map
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const urlMap = {
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
  'BRequest.aspx': '/contact',
  'PrivacyPolicy.aspx': '/privacy-policy',
};

const rules = Object.entries(urlMap)
  .map(([from, to]) => {
    const dest = to === '/' ? '/' : to.endsWith('/') ? to : `${to}/`;
    return `        <rule name="Redirect ${from}" stopProcessing="true">
          <match url="^${from.replace('.', '\\.')}$" ignoreCase="true" />
          <action type="Redirect" url="${dest}" redirectType="Permanent" />
        </rule>`;
  })
  .join('\n');

const removedPageRedirects = [
  { from: 'support/training', name: 'Removed support training page' },
  { from: 'support/download-literature', name: 'Removed support download-literature page' },
];

const pdfRedirects = [
  {
    from: 'EPB-L_English\\.pdf',
    to: '/downloads/Automotive3_2/EPB%203_2_6/EPB-L_English.pdf',
    name: 'Moved EPB-L English PDF',
  },
];

const removedRules = removedPageRedirects
  .map(
    ({ from, name }) => `        <rule name="${name}" stopProcessing="true">
          <match url="^${from}/?$" ignoreCase="true" />
          <action type="Redirect" url="/support/" redirectType="Permanent" />
        </rule>`,
  )
  .join('\n');

const pdfRules = pdfRedirects
  .map(
    ({ from, to, name }) => `        <rule name="${name}" stopProcessing="true">
          <match url="^${from}$" ignoreCase="true" />
          <action type="Redirect" url="${to}" redirectType="Permanent" />
        </rule>`,
  )
  .join('\n');

const config = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
${rules}
${removedRules}
${pdfRules}
        <!-- Catch-all for any remaining .aspx requests -->
        <rule name="Redirect legacy aspx fallback" stopProcessing="true">
          <match url="(.*)\\.aspx$" ignoreCase="true" />
          <action type="Redirect" url="/" redirectType="Permanent" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>
    <httpErrors errorMode="Custom" existingResponse="Replace">
      <remove statusCode="404" />
      <error statusCode="404" path="/404.html" responseMode="ExecuteURL" />
    </httpErrors>
  </system.webServer>
</configuration>
`;

writeFileSync(join(__dirname, '../redirects.web.config'), config);
console.log(`Generated redirects.web.config with ${Object.keys(urlMap).length} redirect rules.`);
