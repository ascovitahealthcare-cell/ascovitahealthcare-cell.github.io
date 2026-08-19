/**
 * SECURITY.js — Ozylix
 * ─────────────────────────────────────────────────────────────────
 * Extracted from index.html inline scripts (19 Aug 2026, Manus SEO pass).
 * Three client-side guards: plain-http backstop, clickjacking escape, and
 * canonical-link repair for the Search Console domain.
 */
(function () {
  // ── HTTP → HTTPS BACKSTOP ──
  // GitHub Pages will still serve this site over plain http unless
  // "Enforce HTTPS" is switched on in repository settings, so anyone
  // arriving on an http URL — a typed address, an old bookmark, a QR
  // code, an ad — got a storefront that looked fine and then failed
  // every single API call (CORS: not allowed → http://www.ozylix.com).
  // replace(), not assign(), so the http URL leaves no history entry
  // for Back to bounce off. Localhost is exempt for local dev.
  try {
    if (location.protocol === 'http:' &&
        !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
      location.replace('https://' + location.host + location.pathname +
                       location.search + location.hash);
    }
  } catch (e) { /* never block the page on this */ }

  // ── CLICKJACKING ESCAPE ──
  // Reading the parent's origin throws when it is cross-origin, which is
  // itself the signal we are looking for. If framing can't be broken, the
  // whole document is hidden rather than silently trapped.
  if (window.top !== window.self) {
    try {
      if (window.top.location.origin === window.self.location.origin) return; // same-origin framing is fine
    } catch (e) { /* cross-origin — fall through and break out */ }
    try { window.top.location = window.self.location.href; }
    catch (e) { document.documentElement.style.display = 'none'; }
  }
})();

// ── CANONICAL REPAIR ──
// Ensures the canonical href always points at the Search Console domain.
document.addEventListener('DOMContentLoaded', function () {
  var c = document.querySelector('link[rel="canonical"]');
  if (c && !c.getAttribute('href').startsWith('https://www.ozylix.com')) {
    c.setAttribute('href', 'https://www.ozylix.com/');
  }
});
