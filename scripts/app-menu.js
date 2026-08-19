// Extracted from index.html (line 22295) by Manus SEO pass — load order preserved

// ── Hamburger open/close ──
var _appMenuScrollY = 0;
function openAppMenu() {
  document.getElementById('appMenuDrawer')?.classList.add('open');
  document.getElementById('appMenuOverlay')?.classList.add('open');
  document.getElementById('appHamburgerBtn')?.classList.add('open');
  // Robust scroll lock (overflow:hidden alone doesn't reliably block touch scroll on mobile)
  _appMenuScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = (-_appMenuScrollY) + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
  // Update user name if logged in
  try {
    var user = JSON.parse(localStorage.getItem('asc_user') || 'null');
    if (user && user.name) {
      document.getElementById('appMenuUsername').textContent = 'Hi, ' + user.name.split(' ')[0] + '! 👋';
      document.getElementById('appMenuUsersub').textContent = user.email || 'VitaRewards Member';
    }
  } catch(e) {}
}
function closeAppMenu() {
  document.getElementById('appMenuDrawer')?.classList.remove('open');
  document.getElementById('appMenuOverlay')?.classList.remove('open');
  document.getElementById('appHamburgerBtn')?.classList.remove('open');
  unlockBodyScroll();   // restores position, overflow AND scroll offset
}

// ── Show mobile overlays on mobile only ──
document.addEventListener('DOMContentLoaded', function() {
  function applyMobileSlides() {
    var isMobile = window.innerWidth <= 768;
    document.querySelectorAll('.mobile-slide-content').forEach(function(el) {
      el.style.display = isMobile ? 'flex' : 'none';
    });
    // Hide desktop container on mobile
    document.querySelectorAll('.hero-slide > .container').forEach(function(el) {
      el.style.display = isMobile ? 'none' : '';
    });
  }
  applyMobileSlides();
  window.addEventListener('resize', applyMobileSlides);
});
