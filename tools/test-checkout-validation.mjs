// ─────────────────────────────────────────────────────────────────────────────
// Regression test for the checkout form and the payment-result dialog.
//
// It exists because of a real customer-facing failure: an order was rejected
// with the dialog titled "Payment Failed" and the body "Missing required
// fields: state" — on a Cash on Delivery order, where no payment was ever
// attempted. Three separate defects lined up to produce it:
//
//   1. validateCheckoutForm() read the State field and returned it, but never
//      checked it. A blank state passed the form and was refused by the server.
//   2. The failure dialog called every failure a payment failure, because the
//      chosen method was dropped on the way in.
//   3. "Retry Payment" always called initiatePayment(), so a customer whose
//      cash order failed was moved onto the card/UPI flow without being asked.
//
// The test drives the real functions, lifted out of auth-core.js by name and
// run against the real checkout markup lifted out of index.html, so it keeps
// testing the shipped code rather than a copy of it.
//
// Run: node tools/test-checkout-validation.mjs
//
// Needs playwright, which this repo does not vendor (neither does
// build-critical-css.mjs). node_modules/ is gitignored, so install it first:
//   npm install --no-save terser clean-css playwright
//
// If playwright's bundled browser is missing, point it at an existing Chromium:
//   CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
//     node tools/test-checkout-validation.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const src  = fs.readFileSync(path.join(ROOT, 'scripts/auth-core.js'), 'utf8');

// ── Lift the checkout page out of index.html by matching its closing div ──
const start = html.indexOf('<div class="page" id="page-checkout"');
if (start < 0) throw new Error('#page-checkout markup not found in index.html');
let depth = 0, end = -1, m;
const divs = /<\/?div\b/g; divs.lastIndex = start;
while ((m = divs.exec(html))) {
  depth += m[0] === '</div' ? -1 : 1;
  if (depth === 0) { end = m.index + '</div>'.length; break; }
}
if (end < 0) throw new Error('unbalanced #page-checkout markup');
const checkout = html.slice(start, end);

// ── Lift a function out of auth-core.js by brace-matching its body ──
function grab(name) {
  const s = src.indexOf(`\nfunction ${name}(`);
  if (s < 0) throw new Error('function not found in auth-core.js: ' + name);
  let d = 0, e = -1, inStr = null;
  for (let k = src.indexOf('{', s); k < src.length; k++) {
    const c = src[k];
    if (inStr) { if (c === inStr && src[k - 1] !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); continue; }
    if (c === '{') d++;
    else if (c === '}' && --d === 0) { e = k + 1; break; }
  }
  if (e < 0) throw new Error('unbalanced body for ' + name);
  return src.slice(s + 1, e);
}

const errMapStart = src.indexOf('const PAY_RESULT_ERROR_MAP');
const errMap = src.slice(errMapStart, src.indexOf('function friendlyPaymentError'));
if (errMapStart < 0) throw new Error('PAY_RESULT_ERROR_MAP not found');

const bundle = [
  errMap,
  grab('getFormField'), grab('getFormEl'), grab('validateCheckoutForm'),
  grab('closePaymentResult'), grab('showPaymentResult'),
  grab('showPaymentError'), grab('friendlyPaymentError'),
].join('\n\n');

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
await page.setContent(`<body>${checkout}</body>`);
await page.addScriptTag({ content: `
  window.__toasts = [];
  function showToast(msg) { window.__toasts.push(msg); }
  // Stubs for the surrounding app these functions call into. The functions
  // under test are the real ones; only their neighbours are faked.
  for (const n of ['hideProcessingScreen','showProcessingScreen','closePaymentModal',
                   'trackEvent','playSuccessSound','vibrate','clearCart','renderCart',
                   'navigateTo','showPage','confetti','refreshVitaBalance']) {
    if (!(n in window)) window[n] = function(){};
  }
  function initiatePayment(){}
  function initiateCOD(){}
  const supportWaNumber = '919898582650';
  ${bundle}
` });
if (pageErrors.length) { console.error('script failed to load:', pageErrors); process.exit(1); }

const results = [];
const check = (name, ok, detail = '') => results.push([name, !!ok, detail]);

const fill = v => page.evaluate((v) => {
  const q = s => document.querySelector('#page-checkout ' + s);
  q('input[placeholder="Enter first name"]').value       = v.first || '';
  q('input[type="email"]').value                          = v.email || '';
  q('input[type="tel"]').value                            = v.phone || '';
  q('input[placeholder="House / Flat No., Street"]').value = v.addr || '';
  q('input[placeholder="City"]').value                    = v.city || '';
  q('input[placeholder="State"]').value                   = v.state || '';
  q('input[placeholder="6-digit PIN"]').value             = v.pin || '';
  window.__toasts = [];
}, v);

const good = { first:'Asha', email:'a@b.com', phone:'9876543210',
               addr:'12 MG Road', city:'Surat', state:'Gujarat', pin:'395007' };

// 1. A blank state must be caught by the form, never by the server.
await fill({ ...good, state:'' });
let r = await page.evaluate(() => ({
  ret: validateCheckoutForm(),
  toasts: window.__toasts,
  flagged: document.querySelector('#page-checkout input[placeholder="State"]').classList.contains('field-error'),
}));
check('blank state is rejected by the form', r.ret === null && /State is required/.test(r.toasts[0] || ''), JSON.stringify(r.toasts));
check('blank state field is highlighted', r.flagged);

// 2. A complete form still passes, and carries the state through.
await fill(good);
r = await page.evaluate(() => validateCheckoutForm());
check('complete form passes with state', r && r.state === 'Gujarat', JSON.stringify(r && r.state));

// 3. A failed COD order must not be called a payment failure.
await page.evaluate(() => {
  document.querySelectorAll('#payResultOverlay').forEach(e => e.remove());
  showPaymentError('COD order failed: upstream timeout', 'AVC-1', {}, 499, 'cod');
});
let text = await page.evaluate(() => document.body.innerText);
let btn  = await page.evaluate(() => document.querySelector('.pay-result-primary.fail')?.outerHTML || '');
check('COD failure is not titled "Payment Failed"', !/Payment Failed/.test(text));
check('COD failure is titled "Order Not Placed"', /Order Not Placed/.test(text));
check('COD failure says nothing was charged', /Nothing has been charged/i.test(text));
check('COD retry calls initiateCOD()', /initiateCOD\(\)/.test(btn) && !/initiatePayment\(\)/.test(btn), btn.slice(0, 120));

// 4. A real payment failure keeps its original wording and retry target.
await page.evaluate(() => {
  document.querySelectorAll('#payResultOverlay').forEach(e => e.remove());
  showPaymentError('Payment declined by bank', 'AVC-2', {}, 499, 'cashfree');
});
text = await page.evaluate(() => document.body.innerText);
btn  = await page.evaluate(() => document.querySelector('.pay-result-primary.fail')?.outerHTML || '');
check('online failure is still titled "Payment Failed"', /Payment Failed/.test(text));
check('online retry calls initiatePayment()', /initiatePayment\(\)/.test(btn), btn.slice(0, 120));

await browser.close();

let failed = 0;
for (const [name, ok, detail] of results) {
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : '  FAIL'}  ${name}${ok ? '' : '   <- ' + detail}`);
}
console.log(`\n${results.length - failed}/${results.length} checkout checks passed`);
if (pageErrors.length) console.log('page errors:', pageErrors);
process.exit(failed ? 1 : 0);
