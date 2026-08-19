// Extracted from index.html (line 24158) by Manus SEO pass — load order preserved

/* ══ META PIXEL — PageView on SPA navigation ═══════════════════════════
   The base pixel fires PageView once, at load, and never again. Measured:
   three in-app navigations later the queue still read a single PageView,
   and browser Back did not add one either. Every view after the landing
   page was invisible to Meta, so the campaign could only ever optimise
   against entrances.

   Why the usual popstate/hashchange pair is not enough here: this router
   navigates with history.pushState, and pushState fires NEITHER event.
   Those listeners would have caught Back and Forward only — the minority
   of navigations — and left taps on the nav still unreported. The router
   itself has to be the signal, so showPage() is wrapped.

   popstate is still listened for, because the app's own popstate handler
   swaps pages directly without going through showPage.

   The dedupe matters: Back can reach both this listener and showPage for
   one navigation, and a doubled PageView is worse than a missing one —
   it inflates reach and corrupts what the campaign learns.             */
(function () {
  var lastPath = null, lastAt = 0;

  function firePageView() {
    if (typeof window.fbq !== 'function') return;
    var path = location.pathname + location.search;
    var now  = Date.now();
    if (path === lastPath && (now - lastAt) < 900) return;
    lastPath = path; lastAt = now;
    fbq('track', 'PageView');
  }

  // Seed from the load-time PageView the base snippet already sent, so the
  // first navigation is not deduped against nothing.
  lastPath = location.pathname + location.search;
  lastAt   = Date.now();

  var _sp = window.showPage;
  if (typeof _sp === 'function') {
    window.showPage = function () {
      var out = _sp.apply(this, arguments);
      // After, not before: showPage pushes the new URL, and PageView should
      // carry the page being entered rather than the one being left.
      try { firePageView(); } catch (e) {}
      // Same reason — the WhatsApp button has to read the page just entered
      // to know whether it is a checkout step it must stay out of.
      try { window.waSync && window.waSync(); } catch (e) {}
      return out;
    };
  }

  window.addEventListener('popstate', function () {
    firePageView();
    try { window.waSync && window.waSync(); } catch (e) {}
  });
  window.addEventListener('hashchange', firePageView);
})();
