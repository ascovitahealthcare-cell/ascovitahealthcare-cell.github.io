// Extracted from index.html (line 23054) by Manus SEO pass — load order preserved

/* ══════════════════════════════════════════════════════════════════════
   OZYLIX · APP LAYER (behaviour)
   Appended last. Wraps existing functions rather than editing them, so
   every commerce path (cart, checkout, payment, orders) is untouched.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__AZ_APP_LAYER__) return;
  window.__AZ_APP_LAYER__ = true;


  /* ── 7 · PERCENT-COUPON CAP ────────────────────────────────────────
     computeServerSideTotal() clamps percent coupons to
     coupons.max_discount. The storefront re-derived the discount from
     type+value in six places and never clamped, so a capped coupon
     would display a discount larger than the one charged. One helper,
     used by all six. */
  window.azPromoCap = function (d) {
    d = Number(d) || 0;
    /* `activePromoCode` is declared with `let`, and a top-level `let` in a
       classic script goes into the global LEXICAL environment — it never
       becomes a property of `window`. So this read was always undefined,
       `cap` was always null, and the helper returned its input unchanged
       at every call site. The cap it exists to apply had never once been
       applied. Read the binding directly; it is visible across scripts. */
    var c = (typeof activePromoCode !== 'undefined' && activePromoCode) ? activePromoCode : null;
    var cap = c && c.maxDisc != null ? Number(c.maxDisc) : null;
    return cap != null && isFinite(cap) ? Math.min(d, cap) : d;
  };

  /* ── 1 · TRUST RAIL ────────────────────────────────────────────────
     Four claims, each one verifiable. Shipping copy is derived from the
     live SHIP_FEE constant so it can never drift from what is charged. */
  function shipLine() {
    var fee = (typeof SHIP_FEE !== 'undefined') ? Number(SHIP_FEE) : 0;
    var thr = (typeof SHIP_THRESHOLD !== 'undefined') ? Number(SHIP_THRESHOLD) : 599;
    return fee === 0
      ? { t: 'Free delivery', s: 'Every order, all India' }
      : { t: 'Free over \u20b9' + thr, s: '\u20b9' + fee + ' below that' };
  }

  var ICO = {
    factory: '<path d="M3 21V9l6 3V9l6 3V9l6 3v9z"/><path d="M7 21v-4M12 21v-4M17 21v-4"/>',
    flask:  '<path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-5-10V3"/><path d="M7.5 15h9"/>',
    truck:  '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    back:   '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'
  };

  function svg(d) {
    return '<svg class="az-trust-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  function trustRail(slim) {
    var ship = shipLine();
    var items = [
      { i: ICO.factory, t: 'Our own factory', s: 'FSSAI licensed, Anand' },
      { i: ICO.flask,   t: 'Batch lab tested', s: 'Report with every lot' },
      { i: ICO.truck,   t: ship.t,            s: ship.s },
      { i: ICO.back,    t: '7-day returns',   s: 'Unopened packs' }
    ];
    var el = document.createElement('div');
    el.className = 'az-trust' + (slim ? ' az-trust-slim' : '');
    el.setAttribute('role', 'list');
    el.innerHTML = (slim ? items.slice(0, 3) : items).map(function (x) {
      return '<div class="az-trust-item" role="listitem">' + svg(x.i) +
             '<span class="az-trust-t">' + x.t + '</span>' +
             '<span class="az-trust-s">' + x.s + '</span></div>';
    }).join('');
    return el;
  }

  function placeTrust() {
    // Product page — directly under the buy buttons, where the doubt is.
    //
    // WHERE THIS WAS GOING WRONG: the anchor used to be
    // btn.closest('div'), which is not the button's little wrapper — the
    // buy column has no wrapper, so closest('div') walked all the way up
    // to the column ITSELF. Inserting after that made the rail a third
    // child of #productDetail, and #productDetail is .product-page:
    // `display:grid; grid-template-columns: 1fr 1fr`. A third child in a
    // two-column grid drops into row 2, column 1 — so the rail rendered
    // underneath the sticky image gallery, 600px below and a full column
    // across from the button it exists to reassure, tangled up with
    // whatever else was down there. On a phone the same bug parked it at
    // the very bottom of the page, past the reviews.
    //
    // Anchoring to the last call to action inside the column keeps the
    // rail in normal flow next to the buttons and leaves the grid with
    // the two children it is drawn for.
    var btn = document.getElementById('addCartBtn');
    if (btn && !document.getElementById('azTrustPdp')) {
      var col = btn.parentNode;
      var anchor = (col && col.querySelector('.buy-now-btn')) || btn;
      var r = trustRail(false); r.id = 'azTrustPdp';
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(r, anchor.nextSibling);
    }
    // Checkout — one slim line above the pay controls.
    var ck = document.getElementById('ckSummary');
    if (ck && !document.getElementById('azTrustCk')) {
      var r2 = trustRail(true); r2.id = 'azTrustCk';
      ck.parentNode.insertBefore(r2, ck.nextSibling);
    }
  }

  /* ── 2 · BACK BUTTON ───────────────────────────────────────────────
     On a phone, Back must close whatever is open before it leaves the
     page. Without this the first Back press dumps the customer out of
     checkout with the cart drawer still open — the single most common
     way a mobile web store loses a completed basket. */
  //
  //   THE FREEZE THIS KILLS
  //     This list used to cover the cart and the "more" drawer only. The
  //     hamburger menu was missing — and the hamburger is the one drawer
  //     that takes the HEAVY lock (body{position:fixed; top:-scrollY;
  //     overflow:hidden}), because that is the only thing that reliably
  //     stops touch-scroll on Android. So: open the menu, press Android's
  //     Back button — the universal way to dismiss a drawer on a phone —
  //     and popstate found no layer to close. The drawer stayed open, the
  //     lock stayed on, and the whole store was pinned dead. Nothing
  //     scrolled, no button worked, and it never recovered on any page
  //     until a hard reload. #authOverlay had the same gap.
  //
  //   Ordered topmost-first by z-index (auth 960 > drawers 940) so Back
  //   peels the layer the customer is actually looking at.
  var layers = [
    { el: '#authOverlay',    cls: 'open', close: function () { if (window.closeAuth) closeAuth(); } },
    { el: '#appMenuDrawer',  cls: 'open', close: function () { if (window.closeAppMenu) closeAppMenu(); } },
    { el: '#appMenuOverlay', cls: 'open', close: function () { if (window.closeAppMenu) closeAppMenu(); } },
    { el: '#sideCart',       cls: 'open', close: function () { if (window.closeSideCart) closeSideCart(); } },
    { el: '#appMoreDrawer',  cls: 'open', close: function () { if (window.closeMoreDrawer) closeMoreDrawer(); } },
    { el: '#appMoreOverlay', cls: 'open', close: function () { if (window.closeMoreDrawer) closeMoreDrawer(); } }
  ];

  function topOpenLayer() {
    for (var i = 0; i < layers.length; i++) {
      var n = document.querySelector(layers[i].el);
      if (n && n.classList.contains(layers[i].cls)) return layers[i];
    }
    return null;
  }

  function pushGuard() {
    if (history.state && history.state.azLayer) return;
    try { history.pushState({ azLayer: true }, ''); } catch (e) {}
  }

  ['openSideCart', 'openMoreDrawer', 'openAppMenu', 'openAuth'].forEach(function (fn) {
    var orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function () { var r = orig.apply(this, arguments); pushGuard(); return r; };
  });

  window.addEventListener('popstate', function () {
    var l = topOpenLayer();
    if (!l) return;
    l.close();
    // Only re-arm if something is STILL open underneath. Re-arming
    // unconditionally pushed a fresh guard state after closing the last
    // layer, so the next Back press was eaten too and the customer had to
    // press it twice to actually leave the page.
    if (topOpenLayer()) pushGuard();
  });

  // Escape closes the top layer on desktop, same order.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var l = topOpenLayer();
    if (l) l.close();
  });

  /* ── 3 · PAGE TRANSITION + SCROLL RESET ────────────────────────────
     showPage() swaps sections but leaves the scroll position, so moving
     from a long product page to the cart lands the customer mid-page. */
  var _showPage = window.showPage;
  if (typeof _showPage === 'function') {
    window.showPage = function (name) {
      var out = _showPage.apply(this, arguments);
      try {
        var p = document.getElementById('page-' + name);
        if (p) {
          p.classList.remove('az-enter');
          void p.offsetWidth;
          p.classList.add('az-enter');
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
      } catch (e) {}
      return out;
    };
  }

  /* ── 4 · SCROLL TO TOP ─────────────────────────────────────────────*/
  var top = document.createElement('button');
  top.id = 'azTop';
  top.type = 'button';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                  'stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(top);

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      top.classList.toggle('show', window.scrollY > 640);
      ticking = false;
    });
  }, { passive: true });

  /* ── 5 · SKELETONS ─────────────────────────────────────────────────
     The Render instance cold-starts. Show the shape of the grid rather
     than nothing, so a 4s wake never looks like a dead page. */
  function skeleton(grid, n) {
    if (!grid || grid.children.length) return;
    var f = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var d = document.createElement('div');
      d.className = 'az-skel az-skel-card';
      f.appendChild(d);
    }
    grid.appendChild(f);
    grid.setAttribute('aria-busy', 'true');
  }
  skeleton(document.getElementById('shopGrid'), 6);

  /* ── 6 · MAINTAIN ──────────────────────────────────────────────────
     The store re-renders its grids after every fetch, so re-place the
     trust rails when the DOM changes rather than only once at boot. */
  placeTrust();
  var obs = new MutationObserver(function () {
    var g = document.getElementById('shopGrid');
    if (g && g.getAttribute('aria-busy') && !g.querySelector('.az-skel')) g.removeAttribute('aria-busy');
    placeTrust();
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();

