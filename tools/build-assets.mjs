/**
 * tools/build-assets.mjs — minify the heavy scripts and stylesheets.
 *
 * WHY THIS EXISTS
 * This repo has no build step by design: the Worker serves the directory as-is.
 * That is fine for everything except size. auth-core.js alone ships 467KB of
 * comments and whitespace to every visitor, and Lighthouse attributes ~285KB of
 * savings to unminified JavaScript and ~110KB to unminified CSS.
 *
 * So: sources stay readable and committed, and a MINIFIED SIBLING is generated
 * next to each one and referenced by the HTML. Nothing about how the site is
 * served changes.
 *
 * THE HAZARD, AND THE GUARD
 * Committing generated files invites the worst kind of bug: someone edits the
 * source, forgets to rebuild, and the site quietly keeps serving the old code.
 * assets.manifest.json records the SHA-256 of every source at build time, and
 * `node tools/build-assets.mjs --check` fails if any source has moved since.
 * That check runs in the repo's own verification, so a stale build cannot ship
 * unnoticed.
 *
 *   node tools/build-assets.mjs           # rebuild
 *   node tools/build-assets.mjs --check   # verify freshness, exit 1 if stale
 *
 * Requires devDependencies: terser, clean-css.
 */
import { minify } from 'terser';
import CleanCSS from 'clean-css';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'assets.manifest.json');

// Only files big enough to be worth the generated-sibling tradeoff.
const MIN_BYTES = 20 * 1024;
const DIRS = ['scripts', 'styles'];

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16);
const isGenerated = (f) => f.includes('.min.');

function targets() {
  const out = [];
  for (const dir of DIRS) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (isGenerated(f)) continue;
      if (!/\.(js|css)$/.test(f)) continue;
      const rel = `${dir}/${f}`;
      if (fs.statSync(path.join(ROOT, rel)).size < MIN_BYTES) continue;
      out.push(rel);
    }
  }
  return out.sort();
}

const minPath = (rel) => rel.replace(/\.(js|css)$/, '.min.$1');
const check = process.argv.includes('--check');
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};

if (check) {
  const stale = [];
  for (const rel of targets()) {
    const cur = sha(fs.readFileSync(path.join(ROOT, rel)));
    if (!fs.existsSync(path.join(ROOT, minPath(rel)))) stale.push(`${rel} — no ${minPath(rel)}`);
    else if (manifest[rel] !== cur) stale.push(`${rel} — source changed since last build`);
  }
  if (stale.length) {
    console.error('asset build is STALE:');
    for (const s of stale) console.error('  - ' + s);
    console.error('\nRun: node tools/build-assets.mjs');
    process.exit(1);
  }
  console.log(`asset build fresh — ${targets().length} minified files match their sources`);
  process.exit(0);
}

let before = 0, after = 0;
const next = {};
for (const rel of targets()) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  let out;
  if (rel.endsWith('.js')) {
    // Conservative: these are non-module globals loaded by <script>, so nothing
    // may be renamed or dropped at the top level.
    const r = await minify(src, {
      compress: { drop_console: false, passes: 1 },
      mangle: { toplevel: false },
      format: { comments: false },
    });
    if (r.error) { console.error(rel, r.error); process.exitCode = 1; continue; }
    out = r.code;
  } else {
    const r = new CleanCSS({ level: 2 }).minify(src);
    if (r.errors.length) { console.error(rel, r.errors.slice(0, 2)); process.exitCode = 1; continue; }
    out = r.styles;
  }
  fs.writeFileSync(path.join(ROOT, minPath(rel)), out);
  next[rel] = sha(Buffer.from(src));
  before += src.length; after += out.length;
  console.log(`  ${rel.padEnd(34)} ${String(src.length).padStart(7)} -> ${String(out.length).padStart(7)}  (${(100 - out.length / src.length * 100).toFixed(0)}% smaller)`);
}
fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + '\n');
console.log(`\ntotal ${before} -> ${after} bytes  (${((before - after) / 1024).toFixed(0)}KB saved)`);
