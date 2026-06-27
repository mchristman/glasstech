import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerConfig = JSON.parse(
  readFileSync(path.join(rootDir, 'wrangler.jsonc'), 'utf-8').replace(/\/\/.*$/gm, ''),
);

test('wrangler config enables nodejs_compat', () => {
  assert.ok(
    wranglerConfig.compatibility_flags?.includes('nodejs_compat'),
    'compatibility_flags must include "nodejs_compat", or Astro\'s SSR runtime throws ' +
      '"process is not defined" in the Workers runtime (astro dev and the deployed Worker).',
  );
});

test('wrangler routes legacy redirects through the Worker before static assets', () => {
  assert.ok(
    wranglerConfig.assets?.run_worker_first?.includes('/*.aspx'),
    'legacy .aspx redirects must reach Astro middleware instead of being 404ed by Workers Static Assets.',
  );
  assert.ok(
    wranglerConfig.assets?.run_worker_first?.includes('/EPB-L_English.pdf'),
    'the moved EPB PDF redirect must reach Astro middleware instead of being 404ed by Workers Static Assets.',
  );
});
