/**
 * OZY-TRACK.js — Ozylix behaviour beacon
 * ─────────────────────────────────────────────────────────────────
 * Sends behavioural events to the Ozylix marketing service so the store owns
 * its own customer data. Meta Pixel and GA4 (scripts/tracking.js) send to
 * Meta and Google; nothing was ever written to a database Ozylix controls,
 * which is why cart recovery was impossible — an abandoned cart lived only in
 * this browser's localStorage and left no trace on any server.
 *
 * ── THIS FILE MUST NEVER BREAK THE STORE ──────────────────────────
 * Every entry point is wrapped in try/catch, every network call is
 * fire-and-forget, and nothing here is awaited by any store code path. If the
 * marketing service is down, slow, blocked by an ad blocker, or returns
 * garbage, the shopper sees no difference whatsoever. Analytics is never
 * worth a broken checkout.
 *
 * ── HOW IT HOOKS IN ───────────────────────────────────────────────
 * It wraps existing functions rather than adding instrumentation to them, so
 * no existing file needed editing:
 *
 *   window.showPage        — SPA navigation. This is the same seam
 *                            fire-pageview.js already proved works: this
 *                            router uses history.pushState, which fires
 *                            NEITHER popstate NOR hashchange, so the router
 *                            itself has to be the signal.
 *   window._trackViewItem  — product views (defined in tracking.js)
 *   window._trackAddToCart — add to cart
 *   window._trackSearch    — search
 *   window._trackBeginCheckout / _trackPurchase — checkout and purchase
 *   STORE.save             — every cart mutation, for the full snapshot
 *
 * Wrapping the existing _track* helpers means the pixel, GA4 and this beacon
 * all fire from one place. They cannot drift apart, and there is no second
 * definition of "a product view" to keep in sync.
 *
 * Load AFTER scripts/tracking.js and after the store scripts, with `defer`.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://marketing-automation-rmcb.onrender.com';
  var AID_KEY  = 'ozy_aid';        // anonymous id, persists across sessions
  var SID_KEY  = 'ozy_sid';        // session id + last-activity stamp
  var UTM_KEY  = 'ozy_utm';        // first-touch UTMs for this session
  var OPTOUT   = 'ozy_optout';
  var SESSION_IDLE_MS = 30 * 60 * 1000;
  var FLUSH_MS = 3000;
  var FLUSH_AT = 10;

  // ── Opt-out and Do Not Track ────────────────────────────────────
  // A visitor who has asked not to be tracked is not tracked. There is no
  // version of this system that is worth overriding that with.
  function optedOut() {
    try {
      if (localStorage.getItem(OPTOUT) === '1') return true;
      var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      if (dnt === '1' || dnt === 'yes') return true;
    } catch (e) {}
    return false;
  }
  if (optedOut()) {
    window.ozyTrack = { disabled: true, track: function () {}, identify: function () {} };
    return;
  }

  // ── ids ─────────────────────────────────────────────────────────

  function uuid() {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function anonId() {
    try {
      var v = localStorage.getItem(AID_KEY);
      if (!v) { v = uuid(); localStorage.setItem(AID_KEY, v); }
      return v;
    } catch (e) {
      // Private mode / storage disabled: fall back to a per-page id. The
      // visitor is not stitched across pages, which is a worse signal but not
      // a broken one — and it beats throwing on every event.
      return window._ozyMemAid || (window._ozyMemAid = uuid());
    }
  }

  // Session id rolls over after 30 minutes idle, matching the engine's own
  // session window so the two agree on where one visit ends.
  function sessionId() {
    var now = Date.now();
    try {
      var raw = sessionStorage.getItem(SID_KEY);
      var rec = raw ? JSON.parse(raw) : null;
      if (rec && rec.id && (now - rec.at) < SESSION_IDLE_MS) {
        rec.at = now;
        sessionStorage.setItem(SID_KEY, JSON.stringify(rec));
        return rec.id;
      }
      var fresh = { id: uuid(), at: now, isNew: true };
      sessionStorage.setItem(SID_KEY, JSON.stringify(fresh));
      return fresh.id;
    } catch (e) {
      return window._ozyMemSid || (window._ozyMemSid = uuid());
    }
  }

  function isNewSession() {
    try {
      var raw = sessionStorage.getItem(SID_KEY);
      if (!raw) return true;
      return !!JSON.parse(raw).isNew;
    } catch (e) { return false; }
  }

  function clearNewSessionFlag() {
    try {
      var raw = sessionStorage.getItem(SID_KEY);
      if (!raw) return;
      var rec = JSON.parse(raw);
      delete rec.isNew;
      sessionStorage.setItem(SID_KEY, JSON.stringify(rec));
    } catch (e) {}
  }

  // ── UTMs ────────────────────────────────────────────────────────
  // Captured on the landing page and kept for the whole session. Reading them
  // fresh on each event would lose the campaign the moment the visitor
  // navigates once — which is every visitor who actually engages.
  function utms() {
    try {
      var stored = sessionStorage.getItem(UTM_KEY);
      if (stored) return JSON.parse(stored);
      var q = new URLSearchParams(location.search);
      var u = {
        source:   q.get('utm_source')   || null,
        medium:   q.get('utm_medium')   || null,
        campaign: q.get('utm_campaign') || null,
        content:  q.get('utm_content')  || null,
        term:     q.get('utm_term')     || null
      };
      // Meta and Google click ids identify a paid click even when the
      // campaign forgot its UTMs, which is common on boosted posts.
      if (!u.source && q.get('fbclid')) { u.source = 'facebook'; u.medium = 'paid_social'; }
      if (!u.source && q.get('gclid'))  { u.source = 'google';   u.medium = 'cpc'; }
      sessionStorage.setItem(UTM_KEY, JSON.stringify(u));
      return u;
    } catch (e) { return {}; }
  }

  function deviceHint() {
    try {
      // iPadOS 13+ reports itself as a Mac; only the browser knows it has
      // touch points. Without this hint every iPad is counted as a desktop.
      if (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) return 'tablet';
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        return Math.min(screen.width, screen.height) >= 600 ? 'tablet' : 'mobile';
      }
    } catch (e) {}
    return null;
  }

  // ── queue and transport ─────────────────────────────────────────

  var queue = [];
  var timer = null;

  function envelope(events) {
    return {
      anon_id: anonId(),
      session_id: sessionId(),
      utm: utms(),
      referrer: document.referrer || null,
      landing_page: (function () {
        try { return sessionStorage.getItem('ozy_landing') || location.pathname; }
        catch (e) { return location.pathname; }
      })(),
      page: location.pathname + location.search,
      device_hint: deviceHint(),
      screen_w: screen && screen.width || null,
      screen_h: screen && screen.height || null,
      is_pwa: (function () {
        try {
          return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
        } catch (e) { return false; }
      })(),
      events: events
    };
  }

  /**
   * Send a batch.
   *
   * `useBeacon` is set when the page is going away. sendBeacon is the only
   * transport the browser guarantees to complete after unload — a normal
   * fetch is cancelled, which is precisely how a checkout_abandoned event
   * gets lost, and that is the single most valuable event in this system.
   */
  function send(events, useBeacon) {
    if (!events.length) return;
    var body;
    try { body = JSON.stringify(envelope(events)); } catch (e) { return; }

    try {
      if (useBeacon && navigator.sendBeacon) {
        // text/plain avoids a CORS preflight, which sendBeacon cannot wait
        // for during unload. The /beacon route parses the raw body.
        navigator.sendBeacon(ENDPOINT + '/api/track/beacon',
          new Blob([body], { type: 'text/plain;charset=UTF-8' }));
        return;
      }
    } catch (e) { /* fall through to fetch */ }

    try {
      fetch(ENDPOINT + '/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'omit',
        mode: 'cors'
      })['catch'](function () { /* a dead marketing service is not the shopper's problem */ });
    } catch (e) {}
  }

  function flush(useBeacon) {
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    if (timer) { clearTimeout(timer); timer = null; }
    send(batch, useBeacon);
  }

  function track(name, props) {
    try {
      var ev = props || {};
      ev.event_name = name;
      ev.event_id = uuid();
      ev.at = new Date().toISOString();
      if (!ev.page) ev.page = location.pathname + location.search;
      queue.push(ev);

      if (queue.length >= FLUSH_AT) { flush(false); return; }
      if (!timer) timer = setTimeout(function () { flush(false); }, FLUSH_MS);
    } catch (e) {}
  }

  // ── cart snapshot ───────────────────────────────────────────────

  /**
   * Read the live cart out of STORE.
   *
   * A full snapshot is sent on every change rather than add/remove deltas.
   * Deltas drift the moment one beacon is dropped — and on Indian mobile data
   * they are dropped regularly — leaving a phantom item in a recovery email
   * the shopper never added. A snapshot is self-correcting: the next one
   * repairs whatever the last one missed.
   *
   * The unit-price rule mirrors renderCheckoutSummary() in cart-utils.js
   * exactly (tierRate when set, else salePrice || price), so the total in a
   * cart reminder matches the total the shopper saw at checkout. A reminder
   * quoting a different price than the site is worse than no reminder.
   */
  function cartSnapshot() {
    try {
      if (typeof STORE === 'undefined' || !STORE || !Array.isArray(STORE.cart)) return null;
      var products = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS : [];

      return STORE.cart.map(function (item) {
        var p = products.filter(function (x) { return x.id === item.id; })[0];
        var unit = (item.tierRate !== undefined && item.tierRate !== null)
          ? item.tierRate
          : (p ? (p.salePrice || p.price) : 0);
        return {
          id: String(item.id),
          name: (p && p.name) || item.name || ('Item ' + item.id),
          image: (p && (p.image || (p.images && p.images[0]))) || null,
          price: unit,
          qty: item.qty || 1
        };
      }).filter(function (i) { return i.id; });
    } catch (e) { return null; }
  }

  var lastCartHash = null;

  function sendCartSnapshot(reason) {
    try {
      var cart = cartSnapshot();
      if (cart === null) return;
      var hash = JSON.stringify(cart.map(function (i) { return i.id + ':' + i.qty + ':' + i.price; }));
      // Only report real changes. STORE.save() is called on every UI refresh,
      // not only on mutations, so without this the engine would see a stream
      // of identical snapshots and keep resetting the cart-abandonment clock —
      // meaning cart recovery would never fire for anyone.
      if (hash === lastCartHash && reason !== 'checkout') return;
      lastCartHash = hash;

      var total = cart.reduce(function (s, i) { return s + (i.price || 0) * (i.qty || 1); }, 0);
      track('cart_snapshot', { cart: cart, value: total, quantity: cart.length, props: { reason: reason } });
    } catch (e) {}
  }

  // ── wrapping the existing store functions ───────────────────────

  function wrap(name, after) {
    try {
      var original = window[name];
      if (typeof original !== 'function' || original.__ozyWrapped) return false;
      var wrapped = function () {
        var out;
        // The original runs first and its result is returned untouched. If
        // the tracking hook throws, the store still behaves exactly as it
        // did before this file existed.
        try { out = original.apply(this, arguments); } catch (err) { throw err; }
        try { after.apply(null, arguments); } catch (e) {}
        return out;
      };
      wrapped.__ozyWrapped = true;
      window[name] = wrapped;
      return true;
    } catch (e) { return false; }
  }

  function pageKind(name) {
    if (!name) return 'page_viewed';
    if (name === 'home') return 'homepage_viewed';
    if (name === 'shop') return 'category_viewed';
    return 'page_viewed';
  }

  var lastPage = null, lastPageAt = 0;

  function onPage(name) {
    var path = location.pathname + location.search;
    var now = Date.now();
    // Back can reach both the popstate listener and showPage for one
    // navigation. A doubled page view inflates every engagement metric it
    // feeds, so the same dedupe fire-pageview.js uses is applied here.
    if (path === lastPage && (now - lastPageAt) < 900) return;
    lastPage = path; lastPageAt = now;

    track(pageKind(name), { props: { page_name: name || '' } });

    if (name === 'cart') sendCartSnapshot('cart_view');
    if (name === 'checkout') sendCartSnapshot('checkout');
  }

  function install() {
    // Landing page, recorded once per session.
    try {
      if (!sessionStorage.getItem('ozy_landing')) {
        sessionStorage.setItem('ozy_landing', location.pathname + location.search);
      }
    } catch (e) {}

    if (isNewSession()) {
      track('session_started', {});
      clearNewSessionFlag();
    }

    onPage(typeof currentPage !== 'undefined' ? currentPage : 'home');

    wrap('showPage', function (name) { onPage(name); });

    wrap('_trackViewItem', function (product) {
      if (!product) return;
      track('product_viewed', {
        product_id: String(product.id),
        product_name: product.name || '',
        category: product.category || '',
        value: product.salePrice || product.price || 0
      });
    });

    wrap('_trackAddToCart', function (product, qty) {
      if (!product) return;
      track('product_added_to_cart', {
        product_id: String(product.id),
        product_name: product.name || '',
        category: product.category || '',
        quantity: qty || 1,
        value: (product.salePrice || product.price || 0) * (qty || 1)
      });
      // Snapshot on the next tick: _trackAddToCart is called from inside
      // STORE.addToCart, before save() has written the new item, so reading
      // the cart synchronously here would miss the item just added.
      setTimeout(function () { sendCartSnapshot('add'); }, 0);
    });

    wrap('_trackSearch', function (term) {
      track('product_search', { search_term: String(term || '').slice(0, 160) });
    });

    wrap('_trackViewCart', function () { sendCartSnapshot('cart_view'); });

    wrap('_trackBeginCheckout', function (items, total) {
      track('checkout_started', { value: total || 0, quantity: (items || []).length });
      sendCartSnapshot('checkout');
      checkoutOpen = true;
    });

    wrap('_trackPurchase', function (orderId, total, items) {
      checkoutOpen = false;
      track('purchase_completed', {
        order_id: String(orderId),
        value: total || 0,
        items: (items || []).map(function (i) {
          return {
            id: i.sku || String(i.id || ''),
            name: i.name || '',
            price: i.selling_price || i.price || 0,
            qty: i.units || i.qty || 1
          };
        }),
        email: readEmail()
      });
      // A purchase is the one event that must not sit in a 3-second buffer:
      // the thank-you page frequently redirects, and the purchase event is
      // what cancels every cart-recovery workflow chasing this person.
      // Losing it means they get a "you left something behind" email for the
      // order they just paid for.
      flush(true);
      lastCartHash = null;
    });

    wrap('_trackCoupon', function (code, discount) {
      track('coupon_used', { coupon: String(code || '').slice(0, 60), value: discount || 0 });
    });

    // Cart mutations that do not go through the tracked helpers (quantity
    // changes at checkout, removals, the side cart).
    try {
      if (typeof STORE !== 'undefined' && STORE && typeof STORE.save === 'function' && !STORE.save.__ozyWrapped) {
        var origSave = STORE.save;
        var saveWrapped = function () {
          var out = origSave.apply(this, arguments);
          try { sendCartSnapshot('save'); } catch (e) {}
          return out;
        };
        saveWrapped.__ozyWrapped = true;
        STORE.save = saveWrapped;
      }
    } catch (e) {}

    // popstate is still listened for because the app's own handler swaps
    // pages directly without going through showPage.
    window.addEventListener('popstate', function () {
      try { onPage(typeof currentPage !== 'undefined' ? currentPage : null); } catch (e) {}
    });

    reportCampaignClick();
  }

  // ── checkout abandonment ────────────────────────────────────────

  var checkoutOpen = false;

  function onLeaving() {
    try {
      // Fired when someone reached checkout and is leaving without having
      // paid. This is the highest-intent recovery signal the store has, and
      // it is the one event that only exists if it is captured at unload.
      if (checkoutOpen) {
        var cart = cartSnapshot();
        if (cart && cart.length) {
          var total = cart.reduce(function (s, i) { return s + (i.price || 0) * (i.qty || 1); }, 0);
          track('checkout_abandoned', { cart: cart, value: total, quantity: cart.length });
        }
      }
      flush(true);
    } catch (e) {}
  }

  // pagehide is the reliable one. beforeunload does not fire on mobile
  // Safari at all, and visibilitychange alone fires on every tab switch.
  window.addEventListener('pagehide', onLeaving);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { try { flush(true); } catch (e) {} }
  });

  // ── campaign click reporting ────────────────────────────────────

  /**
   * Automated messages link to ozylix.com with ?ozy_run=<run_id>. Reporting
   * the click after arrival — rather than redirecting through the marketing
   * service — keeps every link in every sent email a plain direct link that
   * works whether or not that Render instance is awake.
   */
  function reportCampaignClick() {
    try {
      var q = new URLSearchParams(location.search);
      var runId = q.get('ozy_run');
      if (!runId) return;

      fetch(ENDPOINT + '/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: runId, anon_id: anonId(), session_id: sessionId() }),
        keepalive: true, credentials: 'omit', mode: 'cors'
      })['catch'](function () {});

      track('campaign_clicked', { props: { run_id: runId } });
    } catch (e) {}
  }

  // ── identity ────────────────────────────────────────────────────

  function readEmail() {
    try {
      var u = JSON.parse(localStorage.getItem('asc_user') || 'null');
      return (u && u.email) || null;
    } catch (e) { return null; }
  }

  /**
   * Attach a known identity to this browser. Called on login, signup and
   * checkout.
   *
   * Consent is only ever passed when the customer actually granted it. This
   * function never infers consent from the fact that someone placed an order:
   * buying something is not agreeing to marketing messages, and treating it
   * that way is how a store ends up messaging people who never opted in.
   */
  function identify(traits) {
    try {
      var t = traits || {};
      if (!t.email && !t.phone && !t.customer_id) return;
      fetch(ENDPOINT + '/api/track/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anon_id: anonId(),
          email: t.email || null,
          phone: t.phone || null,
          customer_id: t.customer_id || null,
          method: t.method || 'identify_call',
          consent: t.consent || undefined,
          consent_source: t.consent_source || undefined
        }),
        keepalive: true, credentials: 'omit', mode: 'cors'
      })['catch'](function () {});
    } catch (e) {}
  }

  // Pick up an already-signed-in visitor on load, and again when the login
  // flow writes asc_user (which happens after this file has finished).
  function autoIdentify() {
    try {
      var email = readEmail();
      if (email && email !== window._ozyLastIdentified) {
        window._ozyLastIdentified = email;
        identify({ email: email, method: 'session' });
      }
    } catch (e) {}
  }

  // ── public surface ──────────────────────────────────────────────

  window.ozyTrack = {
    track: track,
    identify: identify,
    flush: function () { flush(false); },
    cartSnapshot: cartSnapshot,
    anonId: anonId,
    sessionId: sessionId,
    optOut: function () { try { localStorage.setItem(OPTOUT, '1'); } catch (e) {} }
  };

  // ── boot ────────────────────────────────────────────────────────
  //
  // The store's own scripts define showPage, STORE and the _track* helpers
  // during and after DOMContentLoaded. Installing too early would wrap
  // nothing; installing once and hoping is fragile. So installation is
  // attempted on DOM ready and retried briefly until the store exists, then
  // stops. Whatever is missing simply is not tracked — it never blocks.

  var installed = false;
  var attempts = 0;

  function tryInstall() {
    if (installed) return;
    attempts += 1;
    try {
      if (typeof window.showPage === 'function' || typeof STORE !== 'undefined') {
        install();
        installed = true;
        autoIdentify();
        setInterval(autoIdentify, 20000);
        return;
      }
    } catch (e) {}
    if (attempts < 25) setTimeout(tryInstall, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInstall);
  } else {
    tryInstall();
  }
})();
