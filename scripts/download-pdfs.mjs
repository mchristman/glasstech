#!/usr/bin/env node
/**
 * Download PDFs referenced in scraped content from the legacy glasstech.com site.
 * Saves to public/ preserving legacy URL paths (/downloads/... → public/downloads/...).
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SCRAPED = join(ROOT, 'src/data/scraped');
const BASE_URL = 'http://www.glasstech.com';

const PDF_RE = /(?:href|src)=["']([^"']*\.(?:pdf|PDF))["']/gi;

function collectFromText(text, set) {
  let m;
  while ((m = PDF_RE.exec(text)) !== null) {
    let path = m[1];
    if (path.startsWith('http')) {
      try {
        const u = new URL(path);
        if (u.hostname.includes('glasstech.com')) path = u.pathname;
        else continue;
      } catch {
        continue;
      }
    }
    if (!path.startsWith('/')) path = `/${path}`;
    set.add(path);
  }
}

function collectPdfPaths() {
  const paths = new Set();

  // From scraped JSON files
  for (const file of readdirSync(SCRAPED)) {
    if (!file.endsWith('.json')) continue;
    const raw = readFileSync(join(SCRAPED, file), 'utf8');
    collectFromText(raw, paths);
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data.pdfs)) {
        for (const p of data.pdfs) {
          if (p.href) {
            let href = p.href.startsWith('/') ? p.href : `/${p.href}`;
            paths.add(href);
          }
        }
      }
    } catch {
      /* ignore parse errors */
    }
  }

  // From src/pages and components
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(astro|ts|tsx|js|jsx)$/.test(entry.name)) {
        collectFromText(readFileSync(full, 'utf8'), paths);
      }
    }
  }
  walk(join(ROOT, 'src/pages'));
  walk(join(ROOT, 'src/components'));

  return [...paths].sort();
}

function isPdfBuffer(buf) {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46; // %PDF
}

async function downloadPdf(urlPath) {
  const localPath = join(PUBLIC, urlPath.replace(/^\//, ''));
  const url = `${BASE_URL}${encodeURI(urlPath).replace(/%20/g, '%20')}`;

  if (existsSync(localPath)) {
    const localSize = statSync(localPath).size;
    if (localSize > 1000 && isPdfBuffer(readFileSync(localPath).subarray(0, 4))) {
      return { path: urlPath, status: 'skipped', localPath, size: localSize };
    }
  }

  mkdirSync(dirname(localPath), { recursive: true });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'glasstech-website-pdf-sync/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { path: urlPath, status: 'failed', error: `HTTP ${res.status}`, url };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (!isPdfBuffer(buf)) {
      const preview = buf.subarray(0, 200).toString('utf8').replace(/\s+/g, ' ').slice(0, 120);
      return { path: urlPath, status: 'failed', error: `Not a PDF (${buf.length} bytes): ${preview}`, url };
    }
    if (buf.length < 500) {
      return { path: urlPath, status: 'failed', error: `Suspiciously small (${buf.length} bytes)`, url };
    }

    writeFileSync(localPath, buf);
    return { path: urlPath, status: 'downloaded', localPath, size: buf.length, url };
  } catch (err) {
    clearTimeout(timeout);
    return { path: urlPath, status: 'failed', error: err.message, url };
  }
}

async function main() {
  const paths = collectPdfPaths();
  console.log(`Found ${paths.length} unique PDF path(s) in project sources.`);

  const results = { downloaded: [], skipped: [], failed: [] };

  // Process in batches to avoid overwhelming the server
  const BATCH = 5;
  for (let i = 0; i < paths.length; i += BATCH) {
    const batch = paths.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(downloadPdf));
    for (const r of batchResults) {
      results[r.status === 'downloaded' ? 'downloaded' : r.status === 'skipped' ? 'skipped' : 'failed'].push(r);
      const icon = r.status === 'downloaded' ? '✓' : r.status === 'skipped' ? '·' : '✗';
      const detail = r.status === 'failed' ? r.error : `${r.size ?? ''} bytes`;
      console.log(`${icon} ${r.path} — ${r.status}${detail ? ` (${detail})` : ''}`);
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    total: paths.length,
    downloaded: results.downloaded.length,
    skipped: results.skipped.length,
    failed: results.failed.length,
    downloadedPaths: results.downloaded.map((r) => r.path),
    skippedPaths: results.skipped.map((r) => r.path),
    failedPaths: results.failed.map((r) => ({ path: r.path, error: r.error, url: r.url })),
  };

  writeFileSync(join(ROOT, 'scripts/pdf-download-report.json'), JSON.stringify(report, null, 2));

  console.log('\n--- Summary ---');
  console.log(`Downloaded: ${report.downloaded}`);
  console.log(`Skipped (already present): ${report.skipped}`);
  console.log(`Failed: ${report.failed}`);
  if (report.failed) {
    console.log('\nFailed paths:');
    for (const f of report.failedPaths) console.log(`  ${f.path}: ${f.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
