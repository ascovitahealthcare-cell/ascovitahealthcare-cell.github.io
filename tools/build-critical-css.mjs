/**
 * tools/build-critical-css.mjs — regenerate the inlined critical CSS.
 *
 * WHY THIS EXISTS
 * index.html used to carry one 283KB <style> block. Moving it to an external
 * stylesheet made it cacheable but put an extra round trip and a 283KB download
 * in front of first paint: measured on a throttled phone profile, FCP went from
 * 2.3s to 6.1s. Neither shape is right on its own.
 *
 * So index.html inlines the subset of rules Chromium reports as actually used
 * while rendering the page, and loads the full sheet asynchronously afterwards.
 * That subset is what this script produces. FCP measured 1.0s with it.
 *
 * RUN IT after editing anything in styles/ that index.html depends on:
 *
 *   node tools/build-critical-css.mjs
 *
 * It starts its own static server, loads the page at three widths, unions the
 * coverage, and rewrites the <style id="critical-css"> blocks in place. The
 * page keeps working if you forget — the full sheet still loads — but first
 * paint gets slower and rules added since the last run will flash in late.
 *
 * Requires devDependencies: playwright, clean-css.
 */
import { chromium } from 'playwright';
import CleanCSS from 'clean-css';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8931;
const VIEWPORTS = [[390, 844, true], [768, 1024, true], [1440, 900, false]];
// Which stylesheet feeds which inline <style> block in index.html.
// Point at the MINIFIED sheets, because those are what index.html links and so
// what Chromium reports coverage against. tools/build-assets.mjs generates them;
// run it first if you have just edited the source stylesheets.
const TARGETS = [
  { css: 'styles/store-main.min.css',           styleId: 'critical-css' },
  { css: 'styles/store-account-mobile.min.css', styleId: 'critical-css-account' },
];

const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json',
               '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon' };

function serve() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404).end(); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    s.listen(PORT, () => resolve(s));
  });
}

/** Walk top-level rules, yielding [preludeStart, blockStart, itemEnd]. blockStart is -1 for `@x;`. */
function* items(css, start, end) {
  let i = start;
  while (i < end) {
    while (i < end && /\s/.test(css[i])) i++;
    if (i >= end) break;
    if (css.startsWith('/*', i)) { const j = css.indexOf('*/', i + 2); i = j === -1 ? end : j + 2; continue; }
    const ps = i;
    let depth = 0, bs = -1, str = null, done = false;
    while (i < end) {
      const c = css[i];
      if (str) { if (c === '\\') { i += 2; continue; } if (c === str) str = null; i++; continue; }
      if (c === '"' || c === "'") { str = c; i++; continue; }
      if (css.startsWith('/*', i)) { const j = css.indexOf('*/', i + 2); i = j === -1 ? end : j + 2; continue; }
      if (c === '{') { if (depth === 0) bs = i; depth++; }
      else if (c === '}') { if (--depth === 0) { i++; yield [ps, bs, i]; done = true; break; } }
      else if (c === ';' && depth === 0) { i++; yield [ps, -1, i]; done = true; break; }
      i++;
    }
    if (!done) break;
  }
}

const hit = (ranges, a, b) => ranges.some(r => r.start < b && r.end > a);

function extract(css, ranges) {
  const out = [];
  for (const [ps, bs, ie] of items(css, 0, css.length)) {
    if (bs === -1) { out.push(css.slice(ps, ie)); continue; }          // @import / @charset
    const head = css.slice(ps, bs).trim().toLowerCase();
    // Keep unconditionally: they define resources other kept rules reference.
    if (/^@(font-face|(-webkit-)?keyframes|property)/.test(head)) { out.push(css.slice(ps, ie)); continue; }
    if (/^@(media|supports|layer)/.test(head)) {
      const inner = [];
      for (const [ips, ibs, iie] of items(css, bs + 1, ie - 1)) {
        if (ibs === -1 || hit(ranges, ips, iie)) inner.push(css.slice(ips, iie));
      }
      if (inner.length) out.push(css.slice(ps, bs).trim() + '{' + inner.join('') + '}');
      continue;
    }
    if (hit(ranges, ps, ie)) out.push(css.slice(ps, ie));
  }
  return out.join('\n');
}

const server = await serve();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const collected = new Map();

for (const [width, height, isMobile] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile, hasTouch: isMobile });
  const page = await ctx.newPage();
  await page.coverage.startCSSCoverage();
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(3500);
  for (const entry of await page.coverage.stopCSSCoverage()) {
    const name = entry.url.split('/').pop().split('?')[0];
    if (!collected.has(name)) collected.set(name, { text: entry.text, ranges: [] });
    collected.get(name).ranges.push(...entry.ranges);
  }
  await ctx.close();
}
await browser.close();
server.close();

const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

for (const { css, styleId } of TARGETS) {
  const name = path.basename(css);
  const got = collected.get(name);
  if (!got) { console.error(`  !! no coverage recorded for ${name} — is it still linked from index.html?`); process.exitCode = 1; continue; }

  const merged = [];
  for (const r of got.ranges.sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }

  const source = fs.readFileSync(path.join(ROOT, css), 'utf8');
  const picked = extract(source, merged);
  const min = new CleanCSS({ level: 2 }).minify(picked);
  if (min.errors.length) { console.error(`  !! ${name}:`, min.errors.slice(0, 3)); process.exitCode = 1; continue; }

  const re = new RegExp(`(<style id="${styleId}">)[\\s\\S]*?(</style>)`);
  if (!re.test(html)) { console.error(`  !! <style id="${styleId}"> not found in index.html`); process.exitCode = 1; continue; }
  html = html.replace(re, (_, open, close) => open + min.styles + close);

  const pct = (min.styles.length / source.length * 100).toFixed(1);
  console.log(`  ${name.padEnd(30)} ${source.length} -> ${min.styles.length} bytes inlined (${pct}%)`);
}

fs.writeFileSync(indexPath, html);
console.log('index.html updated.');
