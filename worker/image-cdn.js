/**
 * image-cdn.js — Ozylix
 * ──────────────────────────────────────────────────────────────────────────
 * Edge image proxy: every site image is now delivered from ozylix.com
 * instead of Supabase Storage, so Supabase egress drops to near zero.
 *
 * How it works:
 *   1) The storefront and admin panel reference images as
 *        /cdn-storage/<bucket>/<path>   (e.g. /cdn-storage/product-images/1786544808269-q1ro7o.webp)
 *   2) The Worker (see index.js) catches anything under /cdn-storage/ and
 *      fetches it from Supabase Storage in the background:
 *        https://frwsjgrrtzhjfflcdjjs.supabase.co/storage/v1/object/public/<bucket>/<path>
 *   3) The response is stored in the Cloudflare Cache API with a YEAR-long
 *      TTL — the FIRST visitor pays for the Supabase transfer once, every
 *      visitor after that is served straight from Cloudflare's edge and
 *      costs Supabase nothing.
 *
 * PERFORMANCE FIX (Aug 2026):
 *   The original implementation returned the streamed Supabase body and
 *   stashed a clone() into the Cache API afterwards. Two things could go
 *   wrong with that pattern: (a) a cache miss could silently fail and the
 *   next visitor would pay the full 3-5s cold-supply cost again, and (b)
 *   every request — even a cache HIT — still had to run the JS fetch path
 *   through the Worker, adding ~50-100ms to each image.
 *
 *   New approach: let Cloudflare's standard zone cache do the work for us.
 *   The origin fetch is made with `cf: { cacheEverything: true,
 *   cacheTtl: 31536000 }`, so Cloudflare stores the image at the edge
 *   automatically (no Cache API gymnastics, visible cf-cache-status HIT/
 *   EXPIRED headers, and the response is served by Cloudflare's cache
 *   layer rather than re-streamed through the Worker on every hit).
 *   The Cache API is kept as a second warm layer for the same URL so
 *   requests that land on a fresh CF node get the stored copy instead of
 *   re-supplying from Supabase.
 *
 * Uploads are unchanged: the admin panel still uploads into Supabase
 * Storage through POST /api/upload/image exactly as before.
 * ──────────────────────────────────────────────────────────────────────────
 */

// The Supabase project that owns the product-images bucket (the same ref
// the storefront's SUPABASE_URL points at).
export const SUPABASE_STORAGE_ORIGIN = 'https://frwsjgrrtzhjfflcdjjs.supabase.co';

// All buckets the site may serve images from. Add new ones here as the
// admin uploads to new buckets — the proxy itself needs no other changes.
export const CDN_BUCKETS = new Set(['product-images']);

const CDN_PREFIX = '/cdn-storage/';
const CACHE_TTL_SECONDS = 31536000; // 1 year — images are immutable (timestamped names)
const IMAGE_TYPES = /\.(webp|png|jpe?g|gif|svg|avif|mp4|mov)$/i;

/**
 * True if the request should be handled by this proxy.
 */
export function isCdnRequest(pathname) {
  return pathname.startsWith(CDN_PREFIX);
}

/**
 * Map /cdn-storage/<bucket>/<path> -> Supabase public object URL.
 * Returns null for malformed paths or buckets we don't serve.
 */
export function toSupabaseUrl(pathname) {
  const rest = pathname.slice(CDN_PREFIX.length);
  if (!rest) return null;
  const slash = rest.indexOf('/');
  if (slash === -1) return null;
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  if (!bucket || !path || !CDN_BUCKETS.has(bucket)) return null;
  // Prevent path traversal (e.g. ../ escaping the bucket root).
  if (/(^|\/)\.\.(\/|$)/.test(path)) return null;
  return `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Serve a cached/origin image response.
 *
 * Cold-supply path (cache miss on both layers):
 *   1. Build a deterministic cache key so ?width= transforms each get their
 *      own entry and never collide with the full-size image.
 *   2. Ask Supabase for the object with `cacheEverything: true` and a
 *      1-year TTL. Cloudflare stores the response in the standard zone
 *      cache keyed by `cacheKey` — subsequent requests are answered by
 *      Cloudflare's cache layer with cf-cache-status: HIT, without
 *      re-entering this JS path at full cost.
 *   3. Mirror the same response into the Cache API so the very next hit,
 *      even on a cold CF node, can be served from the stored copy.
 */
export async function handleCdnRequest(request) {
  const url = new URL(request.url);
  const supabaseUrl = toSupabaseUrl(url.pathname);
  if (!supabaseUrl) {
    return new Response('Not found', { status: 404 });
  }

  // Deterministic key: same URL + same transform params -> same entry.
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cache = caches.default;

  // Layer 1: Cache API — instant if we already stored a copy here.
  let response = await cache.match(cacheKey);
  if (response) {
    return response;
  }

  // Layer 2: Cloudflare zone cache via the origin fetch options.
  const origin = await fetch(supabaseUrl, {
    cf: {
      cacheKey: cacheKey, // explicit key so hits land on the same entry
      cacheTtl: CACHE_TTL_SECONDS,
      cacheEverything: true,
    },
  });

  if (!origin.ok) {
    // Propagate 404s (and other errors) but with a short cache so a deleted
    // image stops hitting Supabase quickly without being cached forever.
    return new Response('Not found', {
      status: origin.status === 404 ? 404 : 502,
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  const headers = new Headers({
    'Content-Type': origin.headers.get('Content-Type') || 'application/octet-stream',
    'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, immutable`,
    'Access-Control-Allow-Origin': '*',
  });
  const len = origin.headers.get('Content-Length');
  if (len) headers.set('Content-Length', len);
  if (origin.headers.get('Accept-Ranges')) headers.set('Accept-Ranges', 'bytes');

  // Only mirror into the Cache API for image/video bodies; skip HTML error
  // pages or unexpected content types so we never serve broken bytes.
  const ct = headers.get('Content-Type') || '';
  if (IMAGE_TYPES.test(url.pathname) || ct.startsWith('image/') || ct.startsWith('video/')) {
    // One source stream, two consumers: the client response AND the cache.
    // clone() legally splits a Response body into two readable copies — the
    // previous version gave the SAME body to both put() and the return,
    // which locked the stream and crashed the Worker with error 1101.
    const resp = new Response(origin.body, { status: 200, headers: new Headers(headers) });
    const storeTask = cache.put(cacheKey, resp.clone());
    storeTask.catch(() => {}); // never let a cache failure break the response
    return resp;
  }

  return new Response(origin.body, { status: 200, headers });
}
