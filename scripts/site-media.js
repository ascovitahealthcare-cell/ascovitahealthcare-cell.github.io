// Extracted from index.html (line 9293) by Manus SEO pass — load order preserved

  (function(){
    function applySiteMedia(map){
      if(!map) return;
      document.querySelectorAll('[data-media-key]').forEach(function(el){
        var key = el.getAttribute('data-media-key');
        if(map[key]) el.src = cdnImg(map[key]);
      });
      if(map['about.hero_background']) document.documentElement.style.setProperty('--about-hero-bg', "url('"+cdnImg(map['about.hero_background'])+"')");
      if(map['b2b.hero_background']) document.documentElement.style.setProperty('--b2b-hero-bg', "url('"+cdnImg(map['b2b.hero_background'])+"')");
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
      // Local CDN rewriter — must not depend on cdnImg() which is declared
      // later in this file and would throw here (temporal dead zone).
      var imgCdn = (typeof cdnImg === 'function') ? cdnImg : function (u) { return u; };
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
    function loadSiteMedia(){
      var base = (typeof API_BASE !== 'undefined') ? API_BASE : 'https://ascovitahealthcare-cell-github-io.onrender.com';
      fetch(base + '/api/site-media').then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){ applySiteMedia(d && (d.data || d)); })
        .catch(function(){ /* keep hard-coded defaults already in the HTML */ });
    }
    function startSiteMedia(){
      var run = window.requestIdleCallback
        ? function(fn){ window.requestIdleCallback(fn, {timeout: 1600}); }
        : function(fn){ setTimeout(fn, 1100); };
      run(loadSiteMedia);
    }
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',startSiteMedia); }
    else { startSiteMedia(); }
  })();
  