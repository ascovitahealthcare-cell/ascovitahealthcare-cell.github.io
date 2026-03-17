// ============================================================
// Ascovita Healthcare — Service Worker (sw.js)
// Place this file in ROOT of your GitHub Pages repo
// ============================================================

const CACHE_NAME = 'ascovita-pwa-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache on install (your core pages)
const CORE_FILES = [
  '/',
  '/index.html',
  '/shop',
  '/advisor',
  '/about',
  '/contact',
  '/faq',
  '/offline.html'
];

// ── INSTALL: cache core files ──
self.addEventListener('install', event => {
  console.log('[Ascovita SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_FILES).catch(err => {
        // If some files fail (e.g. /shop not a static file), continue anyway
        console.warn('[Ascovita SW] Some files not cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean old caches ──
self.addEventListener('activate', event => {
  console.log('[Ascovita SW] Activated');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[Ascovita SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Network first, fallback to cache ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST for orders, etc.)
  if (request.method !== 'GET') return;

  // Skip external APIs (Supabase, Cashfree, Shiprocket, Render backend)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cashfree.com') ||
    url.hostname.includes('shiprocket.in') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('wixstatic.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return; // Let browser handle API calls normally
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: return cached version
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // If it's a page navigation, show offline page
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// ── PUSH NOTIFICATIONS (optional future use) ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Ascovita Healthcare';
  const options = {
    body: data.body || 'Check out our latest offers!',
    icon: 'https://static.wixstatic.com/media/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png',
    badge: 'https://static.wixstatic.com/media/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
