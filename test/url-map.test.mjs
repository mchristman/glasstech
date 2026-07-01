import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const urlMapSource = readFileSync(path.join(rootDir, 'src/data/url-map.ts'), 'utf-8');

function parseUrlMap(source) {
  return Object.fromEntries(
    [...source.matchAll(/'([^']+\.aspx)'\s*:\s*'([^']+)'/g)].map((match) => [match[1], match[2]]),
  );
}

const urlMap = parseUrlMap(urlMapSource);

test('legacy product/content ids map to their canonical scraped routes', () => {
  const expectedRoutes = {
    '322Automotive.aspx': '/products/automotive/qs',
    '323Automotive.aspx': '/products/automotive/sdb-l',
    '325Automotive.aspx': '/products/automotive/sdb-t',
    '326XAutomotive.aspx': '/products/automotive/epb-xl',
    '327Automotive.aspx': '/products/automotive/db-4-quick-change',
    '329Automotive.aspx': '/products/automotive/dbx-t',
    '41support.aspx': '/support/service-bulletins',
    '42support.aspx': '/support/spare-parts-list',
    '43support.aspx': '/support/download-literature',
    '51NewsEvents.aspx': '/news-events/calendar',
    '52NewsEvents.aspx': '/news-events/newsletter',
    '53NewsEvents.aspx': '/news-events/press-releases',
    '72Software.aspx': '/inspection/shape-modeler',
    '73Software.aspx': '/inspection/testimonials',
  };

  for (const [legacyPage, cleanPath] of Object.entries(expectedRoutes)) {
    assert.equal(urlMap[legacyPage], cleanPath, `${legacyPage} should render ${cleanPath}`);
  }
});
