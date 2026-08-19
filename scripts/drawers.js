// Extracted from index.html (line 22228) by Manus SEO pass — load order preserved

function openMoreDrawer() {
  document.getElementById('appMoreDrawer')?.classList.add('open');
  document.getElementById('appMoreOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMoreDrawer() {
  document.getElementById('appMoreDrawer')?.classList.remove('open');
  document.getElementById('appMoreOverlay')?.classList.remove('open');
  unlockBodyScroll();
}
