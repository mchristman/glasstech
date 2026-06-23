#!/usr/bin/env node
/**
 * Scrape content from glasstech.com legacy ASP.NET pages
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://www.glasstech.com';
const OUT = join(__dirname, '../src/data/scraped');

const PAGES = [
  'default.aspx',
  'Aboutus.aspx', 'CorporateOverview.aspx', 'InvestorRelations.aspx',
  'MarketsServed.aspx', 'Quality.aspx', 'JobOpportunities.aspx',
  'Products.aspx',
  '31Solar.aspx', '311Solar.aspx', '312Solar.aspx', '313Solar.aspx',
  '314Solar.aspx', '315Solar.aspx', '316Solar.aspx',
  '32Automotive.aspx', '321Automotive.aspx', '322Automotive.aspx',
  '323Automotive.aspx', '324Automotive.aspx', '325Automotive.aspx',
  '326Automotive.aspx', '326XAutomotive.aspx', '327Automotive.aspx',
  '328Automotive.aspx', '329Automotive.aspx', '32LTAutomotive.aspx',
  '32XLTAutomotive.aspx',
  '33Architectural.aspx', '331Architectural.aspx', '332Architectural.aspx',
  '333Architectural.aspx', '334Architectural.aspx',
  '34Aftermarket.aspx', '341Aftermarket.aspx', '342Aftermarket.aspx',
  '343Aftermarket.aspx', '344Aftermarket.aspx', '345Aftermarket.aspx',
  '346Aftermarket.aspx',
  'Support.aspx', '41support.aspx', '42support.aspx', '43support.aspx',
  'newsevents.aspx', '51NewsEvents.aspx', '52NewsEvents.aspx', '53NewsEvents.aspx',
  'Software.aspx', '71AGIR.aspx', '71AGIT.aspx', '72Software.aspx', '73Software.aspx',
  'Contactus.aspx', 'PrivacyPolicy.aspx',
];

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function extractTitle(html) {
  const m = html.match(/<title>\s*([\s\S]*?)\s*<\/title>/i);
  return m ? decodeHtml(m[1].trim()) : '';
}

function extractMetaDescription(html) {
  const m = html.match(/name="description"\s+content="([^"]*)"/i);
  return m ? decodeHtml(m[1]) : '';
}

function extractCopyBlock(html) {
  // Full subMidCont including rightCol PDF sidebar
  let m = html.match(/<div class="subMidCont">([\s\S]*?)<div class="clearCopy">/i);
  if (m) {
    return m[1]
      .replace(/<div class="rightCol">[\s\S]*?<\/div>\s*(?=<div class="clear">)/i, (sidebar) => {
        const pdfs = extractPdfLinks(sidebar);
        if (pdfs.length === 0) return '';
        const links = pdfs.map(p => `<a href="/${p.href}" class="btn btn-primary mr-2 mb-2" target="_blank" rel="noopener">${p.label || 'Download PDF'}</a>`).join('\n');
        return `<div class="pdf-downloads mt-8 p-6 bg-slate-100 rounded-lg"><h2>Downloads</h2>${links}</div>`;
      })
      .replace(/<div class="rightCol">[\s\S]*?<\/div>/gi, '')
      .replace(/<div class="subSearchHldr">[\s\S]*?<\/div>/gi, '')
      .trim();
  }

  // Try subMidCopy only
  m = html.match(/<div class="subMidCopy">([\s\S]*?)<\/div>\s*(?:<div class="rightCol"|<div class="clearCopy")/i);
  if (m) return m[1].trim();

  // Home page market cards
  m = html.match(/<div class="homeCats">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div class="footer"/i);
  if (m) return m[1].trim();

  // Products listing
  m = html.match(/<div class="subMidCont">([\s\S]*?)<div class="footer"/i);
  if (m) {
    const block = m[1];
    const copy = block.match(/<div class="subMidCopy">([\s\S]*?)<\/div>/i);
    if (copy) return copy[1].trim();
    return block.replace(/<div class="rightCol">[\s\S]*?<\/div>\s*<div class="clear">[\s\S]*?<\/div>/i, '').trim();
  }

  return '';
}

function extractH1(content) {
  const m = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? decodeHtml(m[1].replace(/<[^>]+>/g, '').trim()) : '';
}

function extractLinks(content) {
  const links = [];
  const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    const href = m[1];
    const text = decodeHtml(m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (href && !href.startsWith('javascript:') && text) {
      links.push({ href, text });
    }
  }
  return links;
}

function extractPdfLinks(content) {
  const pdfs = [];
  const re = /<a[^>]+href="([^"]+\.pdf[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    pdfs.push({
      href: m[1],
      label: decodeHtml(m[2].replace(/<[^>]+>/g, '').trim()) || 'Download PDF',
    });
  }
  return pdfs;
}

function cleanContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

async function scrapePage(page) {
  const url = `${BASE}/${page}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { page, error: `HTTP ${res.status}` };
    const html = await res.text();
    const rawContent = extractCopyBlock(html);
    const content = cleanContent(rawContent);
    return {
      page,
      url,
      title: extractTitle(html),
      description: extractMetaDescription(html),
      h1: extractH1(content) || extractH1(html),
      content,
      links: extractLinks(content),
      pdfs: extractPdfLinks(html),
    };
  } catch (err) {
    return { page, error: err.message };
  }
}

mkdirSync(OUT, { recursive: true });

console.log(`Scraping ${PAGES.length} pages...`);
const results = [];
for (const page of PAGES) {
  process.stdout.write(`  ${page}...`);
  const data = await scrapePage(page);
  results.push(data);
  writeFileSync(join(OUT, page.replace('.aspx', '.json')), JSON.stringify(data, null, 2));
  console.log(data.error ? ` ERROR: ${data.error}` : ' OK');
  await new Promise(r => setTimeout(r, 100));
}

writeFileSync(join(OUT, '_all.json'), JSON.stringify(results, null, 2));
console.log(`\nDone. ${results.filter(r => !r.error).length}/${results.length} pages scraped.`);
