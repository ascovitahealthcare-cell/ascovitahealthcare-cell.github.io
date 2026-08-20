// Extracted from index.html (line 24236) by Manus SEO pass — load order preserved

/* ═══════════════════════════════════════════════════════════════
   OZYLiX — SESSION POSITION RESTORE
   Reload (or re-open tab) lands the shopper exactly where they
   left off: same page, same product/category/pack, checkout form
   and payment method re-filled, same scroll position.

   Escape hatch: ?fresh=1 skips restore for a clean start.
   Storage key 'ozylix-position' — namespaced, never touched elsewhere.
═══════════════════════════════════════════════════════════════ */
(function () {
  const POS_KEY = 'ozylix-position';

  const MAX_AGE_MS = 60 * 60 * 1000; // ignore positions older than 1 hour

  // Capture the saved state SYNCHRONOUSLY at parse time (during the reload,
  // Chromium has already re-hydrated localStorage by the time inline
  // scripts run — this avoids the async re-hydration race where reads at
  // 900ms+ occasionally still return null).
  let BOOT_STATE = null;
  try { BOOT_STATE = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) {}

  // Snapshot the raw query string at PARSE TIME — the app's boot router
  // replaces ?p= deep-link params with a clean URL synchronously, so
  // checking location.search later would miss an intentional deep link.
  let BOOT_QS = '';
  try { BOOT_QS = window.location.search || ''; } catch (e) {}

  // ── Checkout form field selectors (mirror validateCheckoutForm) ──
  const CK_FIELDS = {
    firstName:  'input[placeholder="Enter first name"]',
    lastName:   'input[placeholder="Enter last name"]',
    email:      'input[type="email"]',
    phone:      'input[type="tel"]',
    addr1:      'input[placeholder="House / Flat No., Street"]',
    addr2:      'input[placeholder="Area / Locality (optional)"]',
    city:       'input[placeholder="City"]',
    state:      'select',
    pin:        'input[placeholder="6-digit PIN"]'
  };

  // Pages that exist in the SPA route list.
  const VALID_PAGES = ['home','shop','product','cart','checkout','orders','account','login','thankyou','wishlist','notifications','about','contact','faq','advisor','blog','privacy','terms','shipping','refund','accessibility','download'];

  // The shop category switcher (filterCat) changes the section without going
  // through showPage, so wrap it to persist the picked category immediately.
  // It is defined later in the document — the wrap is applied when possible
  // right after DOMContentLoaded and again lazily on first use.
  function _wrapFilterCat() {
    if (typeof window.filterCat !== 'function' || window._ozyPosCk) return;
    var _fc = window.filterCat;
    window.filterCat = function () {
      var out = _fc.apply(this, arguments);
      try { if (arguments.length && arguments[0] && (Date.now() - BOOT_START >= BOOT_QUIET_MS)) savePosition(); } catch (e) {}
      return out;
    };
    window._ozyPosCk = true;
  }

  function snap() {
    const snap_ = {
      page: (typeof currentPage !== 'undefined' && currentPage) || 'home',
      productId: (typeof currentProduct !== 'undefined' && currentProduct && currentProduct.id) || null,
      scroll: (typeof window.scrollY === 'number') ? window.scrollY : 0,
      shopCat: (typeof currentCat !== 'undefined') ? currentCat : null,
      selectedTiers: (typeof selectedTiers !== 'undefined') ? selectedTiers : null,
      cartLen: (typeof STORE !== 'undefined' && STORE && STORE.cart) ? STORE.cart.length : 0,
      at: Date.now()
    };
    // Payment method: which .pay-method is .selected inside the checkout page
    try {
      const sel = document.querySelector('#page-checkout .pay-method.selected');
      if (sel) {
        // Payment methods have distinct label text — derive a key from it
        const lbl = (sel.textContent || '').trim();
        if (/GoKwik|Online|UPI|Card|Net Banking/i.test(lbl)) snap_.payMethod = 'online';
        else if (/Cash on Delivery|COD/i.test(lbl)) snap_.payMethod = 'cod';
        else snap_.payMethod = lbl.slice(0, 24);
      }
      // 2026-08: also persist the compact gateway row (cashfree · gokwik · cod)
      if (!snap_.payMethod) {
        const gw = document.querySelector('#page-checkout .pay-method-compact.selected');
        if (gw) snap_.payMethod = gw.getAttribute('data-gateway') || 'online';
      }
    } catch (e) {}
    // Checkout form field values (never store passwords — there are none)
    if (typeof currentPage !== 'undefined' && currentPage === 'checkout') {
      try {
        const vals = {};
        for (const k in CK_FIELDS) {
          const el = document.querySelector('#page-checkout ' + CK_FIELDS[k]);
          if (el && el.value) vals[k] = el.value;
        }
        if (Object.keys(vals).length) snap_.ckFields = vals;
      } catch (e) {}
    }
    return snap_;
  }

  // The app's own boot sequence calls showPage('home') a few hundred ms
  // after DOMContentLoaded on a plain '/' — before our restore runs. If we
  // saved on every showPage unconditionally, that boot navigation would
  // overwrite the shopper's real saved position with 'home'. So writes are
    // suppressed during a short post-boot grace period (1.1s), which is
  //    longer than bootApp's 200/300ms initial routing.
  const BOOT_QUIET_MS = 1100;
  const BOOT_START = Date.now();

  function savePosition() {
    try {
      if (Date.now() - BOOT_START < BOOT_QUIET_MS) return;
      const s = snap();
      // Sanity: don't persist junk pages
      if (!VALID_PAGES.includes(s.page)) s.page = 'home';
      localStorage.setItem(POS_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  function clearPosition() {
    try { localStorage.removeItem(POS_KEY); } catch (e) {}
  }

  // ── Restore ──
  function restorePosition() {
  
    if (new URLSearchParams(location.search).get('fresh')) { clearPosition(); return; }
    // Prefer the synchronous parse-time snapshot; fall back to a fresh read.
    let state = BOOT_STATE;
    if (!state || typeof state !== 'object') {
      try { state = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { return; }
    }
    if (!state || typeof state !== 'object') {
      // Chromium re-hydrates localStorage only AFTER script execution on
      // reload, so reads can be null for the first seconds. Retry up to ~4s.
      if (!restorePosition.__retry) restorePosition.__retry = 0;
      if (restorePosition.__retry < 8) {
        restorePosition.__retry++;
        setTimeout(restorePosition, 500);
      }
      return;
    }
    if (Date.now() - (state.at || 0) > MAX_AGE_MS) { clearPosition(); return; }

    const qs = new URLSearchParams(location.search);
    const bootParams = new URLSearchParams(BOOT_QS);
    // An explicit deep link (?p= /shop etc., via the site's 404.html redirect)
    // is intentional — honor the URL and never hijack the navigation with the
    // saved position. The raw query is read at parse time because the boot
    // router replaces ?p= with a clean URL before restore ever runs.
    const deepLink = bootParams.get('p') || qs.get('p');
    const deepPage = deepLink ? String(deepLink).replace(/^\//, '').split('/')[0] : '';
    const pathPage = (location.pathname.replace(/\/+$/, '') || '/').replace(/^\//, '').split('/')[0];
    // Deep-link rule: an intentional URL (e.g. /product/xyz, /blog/abc, /shop
    // or ?p=...) wins EXCEPT when it is exactly the page the shopper left —
    // in that case this is a reload of their own session, not a fresh deep
    // link, so resume their saved position (section, category, scroll and all).
    const targetPage = pathPage || deepPage;
    if (targetPage && state.page !== targetPage && VALID_PAGES.filter(function (p) {
        return p !== 'cart' && p !== 'checkout' && p !== 'thankyou' && p !== 'orders' && p !== 'account' && p !== 'login';
      }).indexOf(targetPage) >= 0) {
      return;
    }

    let page = String(state.page || 'home');
    if (!VALID_PAGES.includes(page)) page = 'home';
    // Never resume a completed order or an empty-cart checkout
    if (page === 'checkout' && (!STORE || !STORE.cart || STORE.cart.length === 0)) page = 'cart';
    if (page === 'thankyou') page = 'home';

    // Navigate — re-apply the saved page (idempotent when it matches the
    // URL already open); showPage sets scrollY=0 and scroll is re-applied
    // after render.
    if (typeof showPage === 'function') { try { showPage(page); } catch (e) { console.error('[ozylix-position] showPage failed', e); } }

    // Sections — these run after the page has a moment to render.
    // Some sections (shop grid, checkout summary) render asynchronously, so
    // the sub-section restores retry a few times before giving up.
    let _restoreTries = 0;
    (function _restoreSections() {
      try {
        // Shop category — the app's own showPage('shop') resets the category
        // to 'all', so re-apply the saved pick after rendering settles.
        if (page === 'shop' && state.shopCat && typeof filterCat === 'function' && state.shopCat !== 'all') {
          const pill = document.querySelector('.cpill[data-cat="' + state.shopCat + '"]');
          if (pill) { filterCat(state.shopCat, pill); }
        }
        // Product page: re-open the same product (pack tier already persisted
        // via asc_selected_tiers, so the right pack re-selects itself)
        if (page === 'product' && state.productId && typeof openProduct === 'function') {
          try { openProduct(state.productId); } catch (e) {}
        }
        // Checkout: re-fill saved form fields + payment method
        if (page === 'checkout' && state.ckFields) {
          for (const k in CK_FIELDS) {
            const v = state.ckFields[k];
            if (!v) continue;
            const el = document.querySelector('#page-checkout ' + CK_FIELDS[k]);
            if (el) {
              if (el.tagName === 'SELECT') {
                if ([...el.options].some(o => o.value === v)) el.value = v;
              } else {
                el.value = v;
                try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e2) {}
              }
            }
          }
        }
        if (page === 'checkout' && state.payMethod && typeof selPayGateway === 'function') {
          let target = null;
          // Compact gateway row (2026-08): cashfree · gokwik · cod tiles
          if (['cashfree', 'gokwik', 'cod'].includes(state.payMethod)) {
            target = document.querySelector('#page-checkout .pay-method-compact[data-gateway="' + state.payMethod + '"]');
          }
          if (!target) {
            document.querySelectorAll('#page-checkout .pay-method').forEach(function (m) {
              const lbl = (m.textContent || '').trim();
              const key = /GoKwik|Online|UPI|Card|Net Banking/i.test(lbl) ? 'online'
                        : /Cash on Delivery|COD/i.test(lbl) ? 'cod'
                        : lbl.slice(0, 24);
              if (key === state.payMethod || lbl === state.payMethod) target = m;
            });
          }
          if (target) { try { (typeof selPayGateway === 'function' ? selPayGateway : selPayMethod)(target); } catch (e) {} }
        }
      } catch (e) { console.warn('[ozylix-position] sections:', e && e.message); }
      if (_restoreTries < 6) { _restoreTries++; setTimeout(_restoreSections, 450); }
    })();

    // Scroll — wait for render, then jump (skip for pages that must open at top,
    // e.g. checkout always opens at the top of the form for safety)
    if (state.scroll > 0 && page !== 'checkout' && page !== 'thankyou') {
      setTimeout(function () {
        try { window.scrollTo({ top: state.scroll, behavior: 'auto' }); } catch (e) {}
      }, 900);
    }
  }

  // ── Live hooks ──
  // 1. Every SPA navigation remembers where the shopper is.
  if (typeof window.showPage === 'function') {
    const _orig = window.showPage;
    window.showPage = function (pg) {
      const out = _orig.apply(this, arguments);
      try { savePosition(); } catch (e) {}
      return out;
    };
  }
  // 2. Scrolling slowly remembers the position (throttled to 300ms).
  let _scrollTimer = null;
  window.addEventListener('scroll', function () {
    if (_scrollTimer) return;
    _scrollTimer = setTimeout(function () {
      _scrollTimer = null;
      try { savePosition(); } catch (e) {}
    }, 300);
  }, { passive: true });
  // 3. Checkout form typing remembers the draft (per keystroke is too much —
  //    debounce 500ms instead of 300 so payment flows stay snappy).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachCheckoutDraftSave);
    document.addEventListener('DOMContentLoaded', _wrapFilterCat);
  } else {
    setTimeout(attachCheckoutDraftSave, 0);
  }
  function attachCheckoutDraftSave() {
    try {
      const box = document.getElementById('page-checkout');
      if (!box) return;
      let _ckTimer = null;
      const ckSave = function () {
        if (_ckTimer) return;
        _ckTimer = setTimeout(function () {
          _ckTimer = null;
          try { savePosition(); } catch (e) {}
        }, 500);
      };
      box.addEventListener('input', ckSave, true);
      box.addEventListener('change', ckSave, true);
    } catch (e) {}
  }

  // 4. Restore once at boot — intentionally AFTER the app's own initial
  //    routing (bootApp's setTimeout(...,200/300) may still push 'home'),
  //    so our restore wins the last-move race on a plain '/' reload.
  //    The pageshow/persisted branch covers browsers that serve the reload
  //    from the back-forward cache (scripts don't re-run, DCL doesn't fire).
  let _restoreScheduled = false;
  function scheduleRestore(ms) {
    if (_restoreScheduled) return;
    _restoreScheduled = true;
    setTimeout(restorePosition, ms);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scheduleRestore(900); });
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) {
        // bfcache restores the JS state from the earlier page load, where
        // restorePosition was already scheduled once — reset the flag so the
        // restored session resumes again instead of skipping it.
        _restoreScheduled = false;
        scheduleRestore(400);
      }
    });
  } else {
    scheduleRestore(900);
  }

  // 5. Cleanup: order placed or signed out → fresh start next visit.
  try {
    if (typeof window.showPage === 'function') {
      const _o2 = window.showPage;
      window.showPage = function (pg) {
        const out = _o2.apply(this, arguments);
        try {
          if (pg === 'thankyou' || pg === 'orders') clearPosition();
        } catch (e) {}
        return out;
      };
    }
    document.addEventListener('DOMContentLoaded', function () {
      try {
        if ((location.pathname.replace(/\/+$/, '') || '/').replace(/^\//, '').split('/')[0] === 'thankyou') clearPosition();
      } catch (e) {}
      // Sign-out on the account page clears saved position too.
      const accBox = document.getElementById('page-account');
      if (accBox) {
        accBox.addEventListener('click', function (e) {
          try {
            const t = e.target;
            if (t && (t.textContent || '').toLowerCase().includes('sign out')) clearPosition();
          } catch (e2) {}
        }, true);
      }
    });
  } catch (e) {}
})();
