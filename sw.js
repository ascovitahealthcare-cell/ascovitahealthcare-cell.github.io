// ============================================================
// Ozylix — Service Worker (sw.js)
// Place this file in ROOT of your GitHub Pages repo
// ============================================================

// Bumped v7 -> v8 to force-purge every stale cache.
//
// Documents are network-first below, so an online visitor normally gets
// fresh HTML. But the cache fallback fires whenever fetch() REJECTS — and
// on patchy mobile data that happens often. A phone that cached
// index.html back when the drawer scroll-lock bug was still in it could
// therefore be handed that frozen copy again on any flaky load, long
// after the fix went live. That is indistinguishable, to the person
// holding the phone, from the fix never having shipped.
//
// The activate handler deletes every cache whose key !== CACHE_NAME, so
// changing this string is what actually evicts the bad copy from devices
// already carrying it. Bump it on any deploy that fixes a page-breaking
// bug — a fix nobody can receive is not shipped.
const CACHE_NAME = 'ozylix-pwa-v17';
const OFFLINE_URL = '/offline.html';

// Files to cache on install (your core pages)
// index.html is now modular: core JS lives in external scripts/ modules
// (security, tracking, seo-core in head; shop, promo-data at body end).
// They are cacheable so offline fallbacks stay consistent.
const CORE_FILES = [
  '/manifest.json',
  '/',
  '/index.html',
  '/shop',
  '/advisor',
  '/about',
  '/contact',
  '/faq',
  '/offline.html',
  // cache.addAll rejects the whole batch if a single entry 404s, so every
  // path below must exist.
  '/assets/ozylix-logo.png',
  '/assets/ozylix-mark.svg',
  '/assets/favicon.svg',
  '/assets/ozylix-icon-192.png',
  '/assets/ozylix-icon-512.png',
  '/scripts/security.js',
  '/scripts/tracking.js',
  '/scripts/seo-core.js',
  '/scripts/shop.js',
  '/scripts/promo-data.js',
  '/scripts/store-core.js',
  '/scripts/auth-core.js',
  '/scripts/cart-utils.js'
];

// ── INSTALL: cache core files ──
self.addEventListener('install', event => {
  console.log('[Ozylix SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_FILES).catch(err => {
        // If some files fail (e.g. /shop not a static file), continue anyway
        console.warn('[Ozylix SW] Some files not cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean old caches ──
self.addEventListener('activate', event => {
  console.log('[Ozylix SW] Activated');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[Ozylix SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ────────────────────────────────────────────────────────────
// Two rules, and a hard requirement.
//
// The requirement: every path through this handler must return a real
// Response. The previous version fell through to `undefined` whenever a
// non-document request failed with nothing cached, and returning
// undefined from respondWith is a *network error* — it turned every
// flaky-signal blip into a permanently broken image that never retried.
// That is why promo images appeared on first load and vanished after.
//
// Rule 1: cross-origin requests are none of our business. Image CDNs,
// fonts and analytics are left entirely to the browser, which handles
// their caching and retries better than we can. Intercepting them only
// added a service-worker round trip to every image.
//
// Rule 2: same-origin. Documents are network-first so content is fresh;
// static assets are cache-first so repeat views are instant.
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  // Rule 1 — anything not served from this origin.
  if (url.origin !== self.location.origin) return;

  // Rule 1b — the API. /api/site-media is now fetched same-origin so it hits
  // the Worker's edge cache instead of Render directly, which brought it
  // under Rule 2b: cache-first, so an admin's banner change could take two
  // loads to show. API responses have their own freshness rules (a 60s edge
  // TTL, and the storefront's own localStorage copy) and have no business in
  // the static asset cache.
  if (url.pathname.startsWith('/api/')) return;

  const isDocument = request.mode === 'navigate' || request.destination === 'document';

  // Rule 2a — documents: network first, cache as backup.
  if (isDocument) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request))
              || (await caches.match('/index.html'))
              || (await caches.match(OFFLINE_URL))
              || new Response('<h1>Offline</h1>', { status: 503, headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // Rule 2b — same-origin static assets: cache first, refresh in background.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    })
  );
});

// ── PUSH NOTIFICATIONS (optional future use) ──
// The page only calls showNotification after the visitor has granted browser permission.
self.addEventListener('message', event => {
  const d = event.data || {};
  if (d.type !== 'ozylix-show-notification') return;
  const title = d.title || 'Ozylix';
  const options = { body: d.body || '', icon: '/assets/ozylix-icon-192.png', badge: '/assets/ozylix-icon-192.png', data: { url: d.url || '/' } };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Ozylix';
  const options = {
    body: data.body || 'Check out our latest offers!',
    icon: '/assets/ozylix-icon-192.png',
    badge: '/assets/ozylix-icon-192.png',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
