// Extracted from index.html (line 9293) by Manus SEO pass — load order preserved

  (function(){
    // cdnImg() is declared in store-core.js, which loads AFTER this file. The
    // bare calls that used to be here threw a ReferenceError whenever this ran
    // early, which is why the whole block was deferred behind a ~1.1s timer.
    //
    // The fallback is not a no-op on purpose. Returning the raw URL made the
    // <link rel=preload> point at the Supabase original while the carousel
    // rendered the /cdn-storage/ copy — two URLs, two downloads, and the
    // preload helping neither. This mirrors cdnImg() in store-core.js; keep
    // the two in step.
    function smCdnFallback(u){
      if (!u) return u;
      var m = String(u).match(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/([^"'?\s]+)(\?.*)?$/);
      return m ? '/cdn-storage/' + m[1] + (m[2] || '') : String(u);
    }
    function smCdn(u){ return (typeof cdnImg === 'function') ? cdnImg(u) : smCdnFallback(u); }
    function applySiteMedia(map){
      if(!map) return;
      document.querySelectorAll('[data-media-key]').forEach(function(el){
        var key = el.getAttribute('data-media-key');
        if(map[key]) el.src = smCdn(map[key]);
      });
      if(map['about.hero_background']) document.documentElement.style.setProperty('--about-hero-bg', "url('"+smCdn(map['about.hero_background'])+"')");
      if(map['b2b.hero_background']) document.documentElement.style.setProperty('--b2b-hero-bg', "url('"+smCdn(map['b2b.hero_background'])+"')");
      // Reveal shop banners when their upload exists (fixed slots)
      ['shop.banner.1','shop.banner.2','shop.banner.mix_match'].forEach(function(k){
        if(map[k]){
          var el=document.querySelector('[data-media-key="'+k+'"]');
          if(el){el.style.display='';el.onload=function(){var s=el.closest('[data-no-img]');if(s)s.setAttribute('data-no-img','no');};if(el.complete){var s=el.closest('[data-no-img]');if(s)s.setAttribute('data-no-img','no');}}
        }
      });
      // Aug 2026: admin-uploaded image slots. Kept early and global so any
      // renderer that runs later can pick up an uploaded file for a slot
      // whose hard-coded src is empty.
      window.__ozylixSiteMedia = map || {};

      // ── Admin-managed image families (unlimited, uploaded via admin) ──
      applyAdminImageFamilies(map);
    }
    // Builds image families the admin can manage without limits:
    //   home.banner.N(.alt/.link) — offer banner carousel (unlimited count)
    //   shop.banner.N             — shop slots beyond the two fixed ones
    //   site.og_image             — og:image / twitter:image
    //   fallback.*                — category product-image fallbacks
    function applyAdminImageFamilies(map) {
      if (!map || !Object.keys(map).length) return;
      var imgCdn = smCdn;
      // Offer banner carousel — admin decides the count (any positive N).
      var bnSlides = [];
      for (var i = 1; i <= 9; i++) {
        var u2 = map['home.banner.' + i];
        if (u2) bnSlides.push({ n: i, url: imgCdn(u2), alt: map['home.banner.' + i + '.alt'] || '', link: map['home.banner.' + i + '.link'] || '' });
      }
      window.ADMIN_HERO_BANNERS = bnSlides.length ? bnSlides : null;
      // The carousel only initialised itself once on DOMContentLoaded (before
      // site-media arrived). If the admin has now supplied banners, re-init.
      if (window.ADMIN_HERO_BANNERS) {
        // Refresh both sliders so admin uploads appear on the home carousel
        // and the shop hero without a page reload.
        try { if (typeof window.initHeroBanner === 'function') window.initHeroBanner(); } catch (e) { /* ignore */ }
        try { if (typeof window.initShopHero === 'function') window.initShopHero(); } catch (e) { /* ignore */ }
      }
      // Shop banners beyond the two hard-coded slots.
      var sbWrap = document.querySelector('.shop-promos');
      if (sbWrap) {
        var taken = new Set(['shop.banner.1', 'shop.banner.2', 'shop.banner.mix_match']);
        var extras = [];
        Object.keys(map).forEach(function (k) {
          if (k.match(/^shop\.banner\.(\d+)$/) && !taken.has(k)) extras.push({ key: k, n: +k.split('.').pop(), url: map[k] });
        });
        extras.sort(function (a, b) { return a.n - b.n; });
        extras.forEach(function (e, idx) {
          var slot = document.getElementById('shopBannerSlot' + (idx + 3));
          if (!slot) {
            slot = document.createElement('div');
            slot.className = 'shop-banner-slot';
            slot.id = 'shopBannerSlot' + (idx + 3);
            slot.setAttribute('data-no-img', 'yes');
            var img = document.createElement('img');
            img.id = 'shopBannerImg' + (idx + 3);
            img.loading = 'lazy';
            img.style.display = 'none';
            img.onerror = function () { this.style.display = 'none'; };
            slot.appendChild(img);
            sbWrap.appendChild(slot);
          }
          var img2 = slot.querySelector('img') || slot.querySelector('[data-media-key]');
          if (img2) { img2.src = imgCdn(e.url); img2.setAttribute('data-media-key', e.key); img2.setAttribute('alt', 'Ozylix supplement range banner'); img2.style.display = ''; }
          slot.setAttribute('data-no-img', 'no');
        });
      }
      // og:image + twitter:image
      var og = map['site.og_image'];
      if (og) {
        document.querySelectorAll('meta[property="og:image"]').forEach(function (m) { m.content = og; });
        document.querySelectorAll('meta[name="twitter:image"]').forEach(function (m) { m.content = og; });
      }
      // Product image fallbacks (category + default) — merges over the
      // built-in placeholder map so products without media get a real image.
      var fb = {};
      Object.keys(map).forEach(function (k) {
        var m = k.match(/^fallback\.(.+)$/);
        if (m) fb[m[1]] = imgCdn(map[k]);
      });
      if (Object.keys(fb).length && typeof PRODUCT_FALLBACKS !== 'undefined') {
        Object.keys(fb).forEach(function (k) { PRODUCT_FALLBACKS[k] = fb[k]; });
      }
      // Promo carousel cards — admin-uploaded card images (promo.card.N, any
      // N between 1 and 10). When slots are filled, renderPromoCarousel()
      // uses the uploaded images instead of pulling product photos by link.
      var promoCards = {};
      for (var pc = 1; pc <= 10; pc++) {
        var pu = map['promo.card.' + pc];
        if (pu) promoCards[pc] = { url: imgCdn(pu), alt: map['promo.card.' + pc + '.alt'] || '' };
      }
      if (Object.keys(promoCards).length) {
        window.ADMIN_PROMO_CARDS = promoCards;
        try { if (typeof window.renderPromoCarousel === 'function') window.renderPromoCarousel(); } catch (e) { /* ignore */ }
      } else if (window.ADMIN_PROMO_CARDS) {
        window.ADMIN_PROMO_CARDS = null;
        try { if (typeof window.renderPromoCarousel === 'function') window.renderPromoCarousel(); } catch (e) { /* ignore */ }
      }
    }
    // Whenever admin media changes after load (upload completes), re-run the
    // family builders so new banners/slots appear immediately.
    var __smObserver = null;
    try {
      __smObserver = new MutationObserver(function () { applyAdminImageFamilies(window.__ozylixSiteMedia || {}); });
    } catch (e) { /* old browsers just miss the live refresh */ }
    if (__smObserver) {
      // Watch the hero banner carousel and shop banner container for removals
      // added by admin re-renders; the family functions re-run on each cycle
      // inside applySiteMedia anyway, this covers late DOM changes.
      var __smTargets = [document.getElementById('heroBanner'), document.querySelector('.shop-promos')].filter(Boolean);
      __smTargets.forEach(function (t) { __smObserver.observe(t, { childList: true }); });
    }
    // ── Instant media map (no waiting for the API) ──────────────
    // The media map rarely changes between visits, so keep the last
    // known good copy in localStorage and apply it SYNCHRONOUSLY on
    // every load. A fresh fetch still runs afterwards to pick up any
    // admin change, but hero banners and promo cards are already on
    // screen before the request completes — cutting the ~0.5-1.9s
    // Render round-trip out of the perceived load path on repeat
    // visits (first visits keep the old behaviour).
    var SM_CACHE_KEY = 'ozylix_site_media_v1';
    // Stale-while-revalidate: the cached map paints instantly and the
    // background fetch below corrects it on the same load, so a long TTL costs
    // nothing. The old 1-minute TTL expired between visits, which meant almost
    // every reload waited on the Render round-trip before the banner existed.
    var SM_CACHE_MAXAGE = 86400000; // 24h
    function smCacheRead(){
      try {
        var raw = localStorage.getItem(SM_CACHE_KEY);
        if (!raw) return null;
        var o = JSON.parse(raw);
        if (o && o.t && (Date.now() - o.t < SM_CACHE_MAXAGE) && o.map) return o.map;
      } catch (e) { /* corrupted entry, ignore */ }
      return null;
    }
    function smCacheWrite(map){
      try { localStorage.setItem(SM_CACHE_KEY, JSON.stringify({ t: Date.now(), map: map })); } catch (e) { /* quota, ignore */ }
    }
    function smPreloadHeroOne(map){
      // Start downloading hero banner #1 at maximum priority the moment
      // the map is known, instead of waiting for the carousel init.
      var u = map && (map['home.banner.1'] || map['home.banner.2'] || map['home.banner.3']);
      if (!u) return;
      // imgCdn is a local inside applyAdminImageFamilies and was never in
      // scope here, so this fell through to the raw Supabase URL and
      // preloaded a file the carousel then did not request — it renders the
      // /cdn-storage/ copy. smCdn resolves the same way store-core does.
      var src = smCdn(u);
      // The baked-in snapshot may already have preloaded this exact file from
      // <head>; a second identical link is wasted markup.
      if (!document.querySelector('link[rel="preload"][as="image"][href="' + src.replace(/"/g, '\\"') + '"]')) {
        var l = document.createElement('link');
        l.rel = 'preload'; l.as = 'image'; l.href = src;
        l.fetchPriority = 'high';
        l.className = 'ozylix-sm-preload';
        document.head.appendChild(l);
      }
    }
    // First-ever visit: nothing in localStorage yet. tools/snapshot-banners.mjs
    // bakes the current banner URLs into <head>, which is enough to paint the
    // top of the page while the live map is still in flight. Banner keys only,
    // so it seeds the carousel rather than standing in for the whole map.
    function smSnapshot(){
      var snap = window.__OZYLIX_BANNER_SNAPSHOT;
      if (!snap || typeof snap !== 'object') return null;
      for (var k in snap) { if (Object.prototype.hasOwnProperty.call(snap, k)) return snap; }
      return null;
    }
    function smFetchMap(url){
      return fetch(url).then(function(r){
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function(d){
        var m = d && (d.data || d);
        // A 200 that is not the media map (an SPA shell, a 404 page rendered
        // with a 200) must count as a miss, or it would overwrite good data.
        if (!m || typeof m !== 'object' || Array.isArray(m)) throw new Error('not a media map');
        return m;
      });
    }
    function refreshSiteMedia(){
      var base = (typeof API_BASE !== 'undefined') ? API_BASE : 'https://ascovitahealthcare-cell-github-io.onrender.com';
      // Same origin first: worker/index.js already serves /api/site-media from
      // an in-isolate edge cache, so this is a local hop rather than a Render
      // round-trip (~1.9s on a cold container). The storefront was calling
      // Render directly and never touching that cache. Hosts the Worker does
      // not serve — local preview, github.io — 404 here and fall through.
      smFetchMap('/api/site-media')
        .catch(function(){ return smFetchMap(base + '/api/site-media'); })
        .then(function(fresh){
          applySiteMedia(fresh);
          smPreloadHeroOne(fresh);
          smCacheWrite(fresh);
        })
        .catch(function(){ /* keep whatever is already on screen */ });
    }
    // Cached map first, synchronously. This file is deferred, so it runs with
    // the document fully parsed but BEFORE DOMContentLoaded — which is exactly
    // when banners.js builds the carousel. Publishing ADMIN_HERO_BANNERS here
    // means the hero is built with its images on the first pass: no empty
    // display:none section, no late is-live flip pushing the page down.
    function startSiteMedia(){
      var cached = smCacheRead();
      if (cached) {
        smPreloadHeroOne(cached);
        applySiteMedia(cached);
      } else {
        // No cache — seed just the banner family from the baked-in snapshot.
        // Deliberately not applySiteMedia(): that publishes __ozylixSiteMedia
        // as the whole media map, and the snapshot is only a slice of it.
        var snap = smSnapshot();
        if (snap) { smPreloadHeroOne(snap); applyAdminImageFamilies(snap); }
      }
      // With a warm cache the network pass only corrects what is already on
      // screen, so it can yield to first paint. With no cache the banner has
      // nothing to show until it lands — fetch straight away.
      if (cached) {
        var run = window.requestIdleCallback
          ? function(fn){ window.requestIdleCallback(fn, {timeout: 1200}); }
          : function(fn){ setTimeout(fn, 600); };
        run(refreshSiteMedia);
      } else {
        refreshSiteMedia();
      }
    }
    startSiteMedia();
  })();
  