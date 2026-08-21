// Extracted from index.html (line 8093) by Manus SEO pass — load order preserved

// Sync bottom nav active state with showPage()
function setAppNav(page) {
  document.querySelectorAll('.app-nav-item').forEach(function(el) {
    el.classList.remove('active');
  });
  var target = document.getElementById('appNav-' + page);
  if (target) target.classList.add('active');
}

// Sync cart badge to app nav + app topbar
function syncAppCartBadge() {
  var count = 0;
  try {
    var cart = JSON.parse(localStorage.getItem('asc_cart') || '[]');
    count = cart.reduce(function(s, i) { return s + (i.qty || 1); }, 0);
  } catch(e) {}

  // Bottom nav dot
  var dot = document.getElementById('appNavCartDot');
  if (dot) {
    dot.style.display = count > 0 ? 'flex' : 'none';
    dot.textContent = count > 9 ? '9+' : count;
  }
  // Top bar badge
  var tb = document.getElementById('appCartBadge');
  if (tb) {
    tb.style.display = count > 0 ? 'flex' : 'none';
    tb.textContent = count > 9 ? '9+' : count;
  }
}

// Sync wishlist badge
function syncAppWishBadge() {
  var count = 0;
  try {
    var wish = JSON.parse(localStorage.getItem('asc_wishlist') || '[]');
    count = wish.length;
  } catch(e) {}
  var wb = document.getElementById('appWishBadge');
  if (wb) {
    wb.style.display = count > 0 ? 'flex' : 'none';
    wb.textContent = count;
  }
}

// Hook into existing showPage to sync nav
var _origShowPage = typeof showPage === 'function' ? showPage : null;
document.addEventListener('DOMContentLoaded', function() {
  // Patch showPage to also sync app nav
  var origSP = window.showPage;
  if (origSP) {
    window.showPage = function(page) {
      origSP(page);
      setAppNav(page);
      // Small delay for cart badge sync
      setTimeout(function() {
        syncAppCartBadge();
        syncAppWishBadge();
      }, 100);
    };
  }

  // Initial sync
  syncAppCartBadge();
  syncAppWishBadge();

  // Re-sync on storage change
  window.addEventListener('storage', function() {
    syncAppCartBadge();
    syncAppWishBadge();
  });

  // Observe cart badge changes on original badge
  var origCartBadge = document.querySelector('.cart-badge');
  if (origCartBadge) {
    var obs = new MutationObserver(function() { syncAppCartBadge(); });
    obs.observe(origCartBadge, { childList: true, characterData: true, subtree: true });
  }

  // Ticker vertical position: if ann-ticker on desktop is hidden, pin app ticker to top-60px
  // (already handled by CSS fixed positioning)
});

// Same-tab cart changes are observed through the original badge MutationObserver;
// cross-tab changes use the storage listener above. Avoid a perpetual polling
// loop on every storefront page, especially on battery-constrained phones.
