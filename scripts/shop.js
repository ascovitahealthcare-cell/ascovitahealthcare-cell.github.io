/**
 * SHOP.js — Ozylix
 * ─────────────────────────────────────────────────────────────────
 * Extracted from index.html inline scripts (19 Aug 2026, Manus SEO pass).
 * Supabase client config (lazy — the deferred CDN bundle may not exist
 * when this runs and must not block first paint), VITA points display,
 * service-worker registration with non-disruptive update notices, and
 * the deterministic initShopHero bootstrap for the banner sliders.
 *
 * Removed as dead code: the old ".carousel-wrap" touch-swipe block — the
 * home carousel (shopHero / shTrack) is rendered by banners.js with its
 * own controls, and no .carousel-wrap markup exists in the page.
 */
(function () {
  // ── SUPABASE ──
  window.SUPABASE_URL = 'https://frwsjgrrtzhjfflcdjjs.supabase.co';
  window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd3NqZ3JydHpoamZmbGNkampzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDUzMTgsImV4cCI6MjA4ODI4MTMxOH0.iIjlG1A0BoMAmROwovyLasRZU7bVRJC5q7vhmWiMeOs';
  // The library is deferred, so it does not exist yet when this runs —
  // and it must not, because a blocking <script src> to a CDN in <head>
  // holds up first paint for as long as the CDN takes to answer. Reviews
  // are never needed during first paint, so the client is built on first
  // use. Every call site is inside an async function, so by the time one
  // runs the deferred bundle has executed.
  var _sbClient = null;
  window.sbClient = function () {
    if (_sbClient) return _sbClient;
    if (!window.supabase) return null;
    _sbClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return _sbClient;
  };

  // ── VITA POINTS MICRO-DISPLAY ──
  try {
    var e = typeof VITA_EARN_PER_RUPEE !== 'undefined' ? VITA_EARN_PER_RUPEE : 1;
    var v = typeof VITA_REDEEM_PER_RUPEE !== 'undefined' ? VITA_REDEEM_PER_RUPEE : 150;
    var a = document.getElementById('vitaMicroEarn');
    var b = document.getElementById('vitaMicroValue');
    if (a) a.textContent = e + ' point' + (e > 1 ? 's' : '') + ' per ₹1';
    if (b) b.textContent = v + ' points = ₹1 off';
  } catch (x) { /* decorative — never break the page */ }

  // ── SERVICE WORKER ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (reg) {
        // A new sw.js was deployed while this tab was open. Don't force a
        // reload mid-session (could drop a cart/checkout in progress) —
        // just let the person know, the same way the network banner does.
        reg.addEventListener('updatefound', function () {
          var installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function () {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              if (typeof showToast === 'function') {
                showToast('A new version of the site is available — refresh to update.', '');
              }
            }
          });
        });
      }).catch(function (err) {
        console.warn('[Ozylix] Service worker registration failed:', err);
      });
    });
  }

  // ── SHOP HERO BOOTSTRAP ──
  // banners.js (which defines initShopHero) is now a defer-loaded external
  // script, so DOMContentLoaded fires BEFORE the function exists. The eager
  // call covers the pre-split case; the window 'load' retry catches the
  // deferred-script case. site-media.js also re-invokes initShopHero after
  // admin banners arrive, covering live updates.
  var ran = { v: false };
  function boot() {
    if (ran.v) return; ran.v = true;
    try { if (typeof initShopHero === 'function') initShopHero(); } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); });
  } else {
    setTimeout(boot, 0);
  }
  window.addEventListener('load', function () { setTimeout(boot, 0); });
})();
