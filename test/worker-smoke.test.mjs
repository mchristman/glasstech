import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Guards against regressions like the "process is not defined" error that broke
// every page (see wrangler.jsonc's nodejs_compat flag) by actually booting the
// built Worker in the real Workers runtime (via `wrangler dev`) and requesting
// key routes, the same way Cloudflare would serve them in production.

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 18787;
const BASE_URL = `http://127.0.0.1:${PORT}`;

if (!existsSync(path.join(rootDir, 'dist', 'server'))) {
  throw new Error('dist/server not found — run "npm run build" before running tests.');
}

let wranglerProcess;

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(2000) });
      if (response.status > 0) return;
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error('Timed out waiting for wrangler dev to start.');
}

before(async () => {
  wranglerProcess = spawn(
    'npx',
    [
      'wrangler',
      'dev',
      '--port',
      String(PORT),
      '--local-protocol',
      'http',
      '--var',
      'RESEND_API_KEY:test-key',
      '--var',
      'FROM_EMAIL:Glasstech Website <onboarding@resend.dev>',
    ],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  await waitForServer();
});

after(async () => {
  if (!wranglerProcess) return;
  wranglerProcess.kill('SIGTERM');
  await new Promise((resolve) => wranglerProcess.once('exit', resolve));
});

test('homepage renders without a server error', async () => {
  const response = await fetch(`${BASE_URL}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.doesNotMatch(body, /process is not defined/i);
  assert.doesNotMatch(body, /Internal server error/i);
  assert.match(body, /Glasstech/i);
});

test('contact page renders without a server error', async () => {
  const response = await fetch(`${BASE_URL}/contact`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.doesNotMatch(body, /process is not defined/i);
  assert.match(body, /contact-form/);
});

test('tooling questionnaire page renders without a server error', async () => {
  const response = await fetch(`${BASE_URL}/products/aftermarket/tooling/questionnaire`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.doesNotMatch(body, /process is not defined/i);
  assert.match(body, /tooling-questionnaire-form/);
});

test('contact API route rejects an empty submission instead of crashing', async () => {
  const response = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE_URL },
    body: new URLSearchParams(),
  });

  assert.equal(response.status, 400);
});

test('tooling questionnaire API route rejects an empty submission instead of crashing', async () => {
  const response = await fetch(`${BASE_URL}/api/tooling-questionnaire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE_URL },
    body: new URLSearchParams(),
  });

  assert.equal(response.status, 400);
});
