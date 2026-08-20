// Extracted from index.html (line 13323) by Manus SEO pass — load order preserved

// ── PRODUCT CARD IMAGE HYDRATOR (v10.3) ──
// Defined at top level so EVERY render path can reach it — the previous
// copy lived inside syncProductsFromBackend() and was unreachable from
// bootApp, which is why cards stayed blank even after a working page
// render. Watches the whole document: new `img[data-src]` tiles are
// hydrated eagerly when near the viewport, lazily via IntersectionObserver
// otherwise, and a timed flush guarantees nothing stays blank.
(function installProductImgHydrator() {
  if (window._hpiInstalled) return;
  window._hpiInstalled = true;
  var hydrated = new WeakSet();
  function hydrate(img) {
    if (!img || hydrated.has(img) || !img.dataset.src) return;
    hydrated.add(img);
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  }
  function isNearView(img) {
    try {
      var r = img.getBoundingClientRect();
      return r.bottom > -window.innerHeight * 3 && r.top < window.innerHeight * 3;
    } catch(e) { return true; }
  }
  window._hpiFlush = function() {
    document.querySelectorAll('div.product-card img[data-src]').forEach(hydrate);
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { hydrate(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '800px 0px 800px 0px' });
    var mo = new MutationObserver(function(mutations) {
      for (var m = 0; m < mutations.length; m++) {
        var added = mutations[m].addedNodes;
        for (var i = 0; i < added.length; i++) {
          var node = added[i];
          if (!(node instanceof Element)) continue;
          var imgs = node.tagName === 'IMG' ? [node] : node.querySelectorAll('div.product-card img[data-src]');
          for (var j = 0; j < imgs.length; j++) {
            var im = imgs[j];
            // An IMG element reports the current document URL through its
            // .src property even when it has no src attribute. Check the
            // attribute/data payload instead, otherwise lazy cards are never
            // observed and can remain blank until the timed flush.
            if (im.dataset.src && !im.getAttribute('src')) {
              if (isNearView(im)) { hydrate(im); } else { io.observe(im); }
            }
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(window._hpiFlush, 4000);
    setTimeout(window._hpiFlush, 9000);
  } else {
    window._hpiFlush();
    setTimeout(window._hpiFlush, 4000);
    setTimeout(window._hpiFlush, 9000);
  }
})();
// The IIFE above already invokes itself. Calling it again by name threw
// ReferenceError on every page load — a named FUNCTION EXPRESSION binds its
// name only inside its own body, never in the enclosing scope — which
// aborted the rest of this script block.
// Back-compat alias used by bootApp, applyFilters and the sync flush call.
function hydrateProductImgs() { try { window._hpiFlush && window._hpiFlush(); } catch(e) {} }
