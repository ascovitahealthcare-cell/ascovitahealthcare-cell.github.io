// Extracted from index.html (line 23692) by Manus SEO pass — load order preserved

/* ══════════════════════════════════════════════════════════════════════
   APP LAYER v2 — behaviour
   Idempotent: safe to run twice, safe to re-run after the store re-renders.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__azLayer2) return;
  window.__azLayer2 = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Connection status
     A shopper on Indian mobile data who loses signal mid-checkout
     currently sees a silent failure. Tell them what happened.
     --------------------------------------------------------------- */
  var net = document.createElement('div');
  net.className = 'az-net';
  net.setAttribute('role', 'status');
  net.setAttribute('aria-live', 'polite');
  document.body.appendChild(net);
  var netTimer;
  function netMsg(text, ok) {
    net.textContent = text;
    net.classList.toggle('ok', !!ok);
    net.classList.add('show');
    clearTimeout(netTimer);
    if (ok) netTimer = setTimeout(function () { net.classList.remove('show'); }, 2600);
  }
  window.addEventListener('offline', function () { netMsg('No internet connection', false); });
  window.addEventListener('online',  function () { netMsg('Back online', true); });

  /* ---------------------------------------------------------------
     2. Haptics + press feedback on the actions that matter
     A short tap vibration on add-to-cart is the single cheapest thing
     that makes a web store feel like an app on Android.
     --------------------------------------------------------------- */
  function buzz(ms) { try { if (navigator.vibrate && !reduce) navigator.vibrate(ms); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, .btn, .btn-primary, [onclick]');
    if (!t) return;
    var label = (t.textContent || '') + ' ' + (t.getAttribute('onclick') || '');
    if (/addToCart|add to cart|buy now|checkout|place order/i.test(label)) buzz(12);
  }, true);

  /* ---------------------------------------------------------------
     3. Image loading discipline
     Most product images are injected by JS template literals, so they
     miss the loading/decoding attributes and cause layout shift as
     each one lands. Apply them as the DOM changes.
     --------------------------------------------------------------- */
  function tidyImages(root) {
    var imgs = (root || document).querySelectorAll('img:not([data-az-img])');
    for (var n = 0; n < imgs.length; n++) {
      var im = imgs[n];
      im.setAttribute('data-az-img', '1');
      if (!im.hasAttribute('loading'))  im.setAttribute('loading', 'lazy');
      if (!im.hasAttribute('decoding')) im.setAttribute('decoding', 'async');
      if (!im.getAttribute('alt'))      im.setAttribute('alt', '');
      if (!im.complete) {
        im.classList.add('az-fade');
        im.addEventListener('load',  function () { this.classList.add('az-in'); }, { once: true });
        im.addEventListener('error', function () { this.classList.add('az-in'); }, { once: true });
      }
    }
  }

  /* ---------------------------------------------------------------
     4. Horizontal rails get snap + momentum
     --------------------------------------------------------------- */
  function tidyRails() {
    var els = document.querySelectorAll('[class*="chips"],[class*="rail"],[class*="carousel"],[class*="scroller"]');
    for (var n = 0; n < els.length; n++) {
      var el = els[n];
      if (el.hasAttribute('data-az-rail')) continue;
      var cs = getComputedStyle(el);
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') {
        el.setAttribute('data-az-rail', '1');
        el.classList.add('az-rail');
      }
    }
  }

  /* ---------------------------------------------------------------
     5. Bottom-pinned bars clear the home indicator on iPhone
     --------------------------------------------------------------- */
  function tidyFixed() {
    var els = document.querySelectorAll('#stickyCart, .app-bottom-nav, [class*="bottom-nav"], [class*="sticky-bar"]');
    for (var n = 0; n < els.length; n++) els[n].classList.add('az-safe-bottom');
  }

  function tidy() { tidyImages(); tidyRails(); tidyFixed(); }
  tidy();

  /* The store re-renders its grids after every fetch, so re-apply on change
     rather than only once at boot. Throttled to one pass per frame. */
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; tidy(); });
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------------------------------------------------------------
     6. Forms: right keyboard, right autofill
     On a phone, a numeric pincode field that opens the alphabet
     keyboard is the most common reason a checkout gets abandoned.
     --------------------------------------------------------------- */
  function tidyInputs() {
    var f = document.querySelectorAll('input:not([data-az-inp])');
    for (var n = 0; n < f.length; n++) {
      var el = f[n], id = ((el.id || '') + ' ' + (el.name || '') + ' ' + (el.placeholder || '')).toLowerCase();
      el.setAttribute('data-az-inp', '1');
      if (el.type === 'text' || el.type === '') {
        if (/pin ?code|zip|postal/.test(id)) { el.setAttribute('inputmode', 'numeric'); el.setAttribute('autocomplete', 'postal-code'); el.setAttribute('maxlength', '6'); }
        else if (/phone|mobile|contact/.test(id)) { el.setAttribute('inputmode', 'tel'); el.setAttribute('autocomplete', 'tel'); }
        else if (/name/.test(id) && !/user ?name/.test(id)) { el.setAttribute('autocomplete', 'name'); el.setAttribute('autocapitalize', 'words'); }
        else if (/address|street|city|state/.test(id)) { el.setAttribute('autocomplete', 'street-address'); el.setAttribute('autocapitalize', 'words'); }
      }
      if (el.type === 'email') { el.setAttribute('autocomplete', 'email'); el.setAttribute('autocapitalize', 'none'); el.setAttribute('spellcheck', 'false'); }
      if (el.type === 'tel')   { el.setAttribute('inputmode', 'tel'); el.setAttribute('autocomplete', 'tel'); }
    }
  }
  tidyInputs();
  setInterval(tidyInputs, 2500);

  /* ---------------------------------------------------------------
     7. Tell the shopper when a slow backend is the reason nothing moved

     This used to say "Waking the server — one moment" after 4 seconds,
     which was true on Render's free tier: it sleeps after 15 minutes and
     cold-starts for about 30 seconds. The service is on Starter now and
     never sleeps, so nothing is ever waking up — a request past 4s is
     just a slow request, and telling the customer the server was asleep
     was both wrong and alarming. Honest wording, and a longer threshold
     so an ordinary request on a mobile connection does not trip it.
     --------------------------------------------------------------- */
  if (typeof window.fetch === 'function' && typeof API_BASE !== 'undefined') {
    var _f = window.fetch;
    window.fetch = function (input, init) {
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var isOurs = url.indexOf(API_BASE) === 0;
      var slow;
      if (isOurs && !/visitors\//.test(url)) {
        slow = setTimeout(function () { netMsg('Still loading — hang on', false); }, 7000);
      }
      return _f.apply(this, arguments).then(function (r) {
        if (slow) { clearTimeout(slow); net.classList.remove('show'); }
        return r;
      }, function (e) {
        if (slow) { clearTimeout(slow); net.classList.remove('show'); }
        throw e;
      });
    };
  }

// ── Premium account welcome banner ─────────────────────────────
// Populates the gradient header (name, order count, VitaPoints, savings)
// whenever the account page or a panel is visited.
async function refreshAccountWelcome() {
  const host = document.getElementById('accountWelcome');
  const nameEl = document.getElementById('awName');
  const ordersEl = document.getElementById('awOrders');
  const pointsEl = document.getElementById('awPoints');
  const savedEl = document.getElementById('awSaved');
  if (!host) return;

  const user = getCurrentUser();
  if (!user || !user.email) {
    if (nameEl) nameEl.textContent = 'Welcome to your Ozylix account';
    if (ordersEl) ordersEl.textContent = '—';
    if (pointsEl) pointsEl.textContent = '—';
    if (savedEl) savedEl.textContent = '—';
    return;
  }
  if (nameEl) nameEl.textContent = 'Welcome back, ' + (user.name || user.email.split('@')[0]) + ' 👋';

  // Points (cached vita state, instantaneous)
  if (pointsEl) pointsEl.textContent = (Number(getVitaState().balance) || 0).toLocaleString('en-IN');

  // Orders + savings — backend first, localStorage merged as fallback
  let orders = [];
  const jwt = localStorage.getItem('asc_jwt') || '';
  if (jwt) {
    try {
      const r = await fetchWithTimeout(API_BASE + '/api/orders/my', {
        headers: { 'Authorization': 'Bearer ' + jwt }
      }, 8000);
      if (r.ok) {
        const d = await r.json();
        orders = (d.data || d || []).filter(function(o){
          return (o.customer_email || '').toLowerCase().trim() === user.email.toLowerCase().trim();
        });
      }
    } catch(e) { console.warn('[Welcome] orders fetch failed:', e.message); }
  }
  // Local history (orders placed before accounts existed)
  try {
    const local = JSON.parse(localStorage.getItem('asc_orders') || '[]')
      .filter(function(o){ return (o.userEmail || o.email || '').toLowerCase().trim() === user.email.toLowerCase().trim(); })
      .filter(function(o){ return !orders.some(function(b){ return b.id === o.orderId || b.id === o.id; }); })
      .map(function(o){ return Object.assign({}, o, { id: o.orderId }); });
    orders = orders.concat(local);
  } catch(e) {}

  if (ordersEl) ordersEl.textContent = orders.length;

  // Lifetime savings = sum of per-item MRP-vs-price discount where available
  let saved = 0;
  orders.forEach(function(o){
    let items = o.items || [];
    if (typeof items === 'string') { try { items = JSON.parse(items); } catch(e){ items = []; } }
    items.forEach(function(it){
      const qty = Number(it.qty) || 0;
      const mrp = Number(it.mrp || it.max_retail_price || 0);
      const price = Number(it.price || it.sale_price || it.unit_price || 0);
      if (mrp > price && qty) saved += (mrp - price) * qty;
    });
  });
  if (savedEl) savedEl.textContent = '₹' + Math.round(saved).toLocaleString('en-IN');
}
// Expose to the earlier (gtag-style) script block that hooks showPage('account')
window.refreshAccountWelcome = refreshAccountWelcome;

})();
