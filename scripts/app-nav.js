// Extracted from index.html (line 8093) by Manus SEO pass — load order preserved

// Sync bottom nav active state with showPage()
function setAppNav(page) {
  document.querySelectorAll('.app-nav-item').forEach(function(el) {
    el.classList.remove('active');
  });
  var target = document.getElementById('appNav-' + page);
  if (target) target.classList.add('active');
}

function _appCount(value) {
  var n = Number(value) || 0;
  return n > 99 ? '99+' : String(n);
}

function _setAppLiveBadge(id, count) {
  var el = document.getElementById(id);
  if (!el) return;
  var n = Number(count) || 0;
  el.textContent = _appCount(n);
  el.style.display = n > 0 ? 'inline-flex' : 'none';
}

// Sync every number shown in the storefront menu. Account orders are replaced
// by the authenticated backend count when account-welcome.js finishes loading.
function syncAppMenuCounts() {
  var cartCount = 0;
  var wishCount = 0;
  var orderCount = 0;
  var pointsCount = 0;
  var notificationCount = 0;

  try {
    var cart = JSON.parse(localStorage.getItem('asc_cart') || '[]');
    cartCount = Array.isArray(cart) ? cart.reduce(function(s, i) { return s + (Number(i.qty) || 1); }, 0) : 0;
  } catch(e) {}
  try {
    var wish = JSON.parse(localStorage.getItem('asc_wishlist') || '[]');
    wishCount = Array.isArray(wish) ? wish.length : 0;
  } catch(e) {}
  try {
    var user = JSON.parse(localStorage.getItem('asc_user') || 'null');
    if (user && user.orderCount != null) orderCount = Number(user.orderCount) || 0;
  } catch(e) {}
  if (window.__appBackendOrderCount != null) orderCount = Number(window.__appBackendOrderCount) || 0;
  try {
    if (typeof getVitaState === 'function') pointsCount = Number(getVitaState().balance) || 0;
  } catch(e) {}
  try {
    if (typeof ozylixReadCenterEntries === 'function') {
      notificationCount = ozylixReadCenterEntries().filter(function(x) { return !x.read; }).length;
    }
  } catch(e) {}

  // Persistent summary cards
  var ordersStat = document.getElementById('appMenuOrdersStat');
  if (ordersStat) ordersStat.textContent = _appCount(orderCount);
  var pointsStat = document.getElementById('appMenuPointsStat');
  if (pointsStat) pointsStat.textContent = _appCount(pointsCount);
  var wishStat = document.getElementById('appMenuWishStat');
  if (wishStat) wishStat.textContent = _appCount(wishCount);

  _setAppLiveBadge('appMenuOrdersBadge', orderCount);
  _setAppLiveBadge('appMenuPointsBadge', pointsCount);
  _setAppLiveBadge('appMenuWishBadge', wishCount);
  _setAppLiveBadge('appMenuNotificationBadge', notificationCount);
  _setAppLiveBadge('appMenuCartBadge', cartCount);
  _setAppLiveBadge('appNavCartDot', cartCount);
  _setAppLiveBadge('appCartBadge', cartCount);
}
window.syncAppMenuCounts = syncAppMenuCounts;

// Sync cart badge to app nav + app topbar
function syncAppCartBadge() {
  syncAppMenuCounts();
}

// Sync wishlist badge
function syncAppWishBadge() {
  syncAppMenuCounts();
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
      setTimeout(syncAppMenuCounts, 100);
    };
  }

  // Initial sync
  syncAppMenuCounts();

  // Re-sync on storage change
  window.addEventListener('storage', syncAppMenuCounts);

  // Observe cart badge changes on original badge
  var origCartBadge = document.querySelector('.cart-badge');
  if (origCartBadge) {
    var obs = new MutationObserver(syncAppMenuCounts);
    obs.observe(origCartBadge, { childList: true, characterData: true, subtree: true });
  }

  // Ticker vertical position: if ann-ticker on desktop is hidden, pin app ticker to top-60px
  // (already handled by CSS fixed positioning)
});

// Poll cart, wishlist and local notification state to keep every number current.
setInterval(syncAppMenuCounts, 2000);
