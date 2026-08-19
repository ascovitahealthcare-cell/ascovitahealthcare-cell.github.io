// Extracted from index.html (line 9293) by Manus SEO pass — load order preserved

  (function(){
    // cdnImg() is declared in store-core.js, which loads AFTER this file. The
    // bare calls that used to be here threw a ReferenceError whenever this ran
    // early, which is why the whole block was deferred behind a ~1.1s timer.
    // Resolved lazily, the media map can be applied the moment it is known.
    function smCdn(u){ return (typeof cdnImg === 'function') ? cdnImg(u) : u; }
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
      // Resolve the CDN helper lazily: store-core (cdnImg) loads after
      // this script, so check the global first and fall back to the
      // local imgCdn copy (or the raw URL if nothing is available yet).
      var cdn = (typeof window.cdnImg === 'function') ? window.cdnImg : (typeof imgCdn === 'function' ? imgCdn : null);
      var src = cdn ? cdn(u) : u;
      if (!document.querySelector('link[rel="preload"][as="image"].ozylix-sm-preload')) {
        var l = document.createElement('link');
        l.rel = 'preload'; l.as = 'image'; l.href = src;
        l.fetchPriority = 'high';
        l.className = 'ozylix-sm-preload';
        document.head.appendChild(l);
      }
    }
    function refreshSiteMedia(){
      var base = (typeof API_BASE !== 'undefined') ? API_BASE : 'https://ascovitahealthcare-cell-github-io.onrender.com';
      fetch(base + '/api/site-media').then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){
          var fresh = d && (d.data || d);
          applySiteMedia(fresh);
          smPreloadHeroOne(fresh);
          if (fresh) smCacheWrite(fresh);
        })
        .catch(function(){ /* keep hard-coded defaults already in the HTML */ });
    }
    // Cached map first, synchronously. This file is deferred, so it runs with
    // the document fully parsed but BEFORE DOMContentLoaded — which is exactly
    // when banners.js builds the carousel. Publishing ADMIN_HERO_BANNERS here
    // means the hero is built with its images on the first pass: no empty
    // display:none section, no late is-live flip pushing the page down.
    function startSiteMedia(){
      var cached = smCacheRead();
      if (cached) { smPreloadHeroOne(cached); applySiteMedia(cached); }
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
  