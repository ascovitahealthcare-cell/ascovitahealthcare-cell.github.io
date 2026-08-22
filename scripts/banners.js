// Extracted from index.html (line 9597) by Manus SEO pass — load order preserved

// ══════════════════════════════════════════════════════════
// INSTAGRAM FEED — Live from Render backend
// Backend fetches from Instagram Graph API using your token
// Setup: add INSTAGRAM_TOKEN to Render env vars
// ══════════════════════════════════════════════════════════

(function() {

  var IG_API = (typeof API_BASE !== 'undefined' ? API_BASE : 'https://ascovitahealthcare-cell-github-io.onrender.com') + '/api/instagram';
  var CARDS_VISIBLE = window.innerWidth < 600 ? 2 : window.innerWidth < 900 ? 3 : 5;
  var igPosts = [];
  var igIndex = 0;
  var igTotal = 0;
  var igAutoTimer = null;

  // ── FETCH POSTS ──
  async function loadInstagram() {
    try {
      var r = await fetchWithTimeout(IG_API, {}, 10000);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var data = await r.json();
      igPosts = (data.data || data).filter(function(p) {
        return p.media_type !== 'VIDEO' || p.thumbnail_url;
      }).slice(0, 12);
      if (!igPosts.length) throw new Error('No posts');
      renderIgSlider();
    } catch(e) {
      // Show beautiful static fallback tiles pointing to real Instagram
      var staticTiles = [
        {emoji:'✨', label:'Skin & Glow', bg:'#E8EDE6'},
        {emoji:'🌿', label:'Spirulina', bg:'#E8EDE6'},
        {emoji:'💪', label:'Immunity', bg:'#E8F5E9'},
        {emoji:'⚡', label:'Energy', bg:'var(--st-warn-bg)'},
        {emoji:'🏆', label:'Multidiata', bg:'#F3E5F5'},
        {emoji:'🫧', label:'Effervescent', bg:'#E3F2FD'},
      ];
      var track = document.getElementById('igTrack');
      if (track) {
        track.innerHTML = staticTiles.map(function(t) {
          return '<a class="ig-card" href="https://www.instagram.com/ozylixlife" target="_blank" rel="noopener" style="text-decoration:none;background:'+t.bg+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:14px;aspect-ratio:1;min-height:180px">'
            + '<span style="font-size:2.8rem">'+t.emoji+'</span>'
            + '<span style="font-size:0.78rem;font-weight:600;color:var(--green)">'+t.label+'</span>'
            + '<span style="font-size:0.68rem;color:var(--gray)">@ozylixlife</span>'
            + '</a>';
        }).join('');
      }
      document.getElementById('igError').style.display = 'block';
    }
  }

  // ── RENDER CARDS ──
  function renderIgSlider() {
    var track = document.getElementById('igTrack');
    if (!track) return;
    igTotal = igPosts.length;

    track.innerHTML = igPosts.map(function(p, i) {
      var isVideo = p.media_type === 'VIDEO' && p.media_url;
      var imgSrc = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
      var caption = (p.caption || '').replace(/[#@]\S+/g, '').trim().slice(0, 120);
      var typeLabel = p.media_type === 'VIDEO' ? '▶ Reel' : p.media_type === 'CAROUSEL_ALBUM' ? '⊞ Album' : '';
      // Reels used to render as a still thumbnail with a ▶ badge. They now
      // play silently in place: poster is the same thumbnail, so the card
      // looks identical until the video is ready, and preload="none" means
      // nothing downloads until it scrolls into view (igPlayObserver below).
      // Muted + playsinline is what lets iOS autoplay at all. Clicking still
      // opens the post on Instagram.
      var media = isVideo
        ? '<video poster="' + imgSrc + '" muted loop playsinline preload="none" ' +
            'aria-label="Ozylix Instagram reel" ' +
            'onerror="this.closest(\'.ig-card\').style.display=\'none\'">' +
            '<source src="' + p.media_url + '" type="video/mp4">' +
          '</video>'
        : '<img src="' + imgSrc + '" alt="Ozylix Instagram post" loading="lazy" onerror="this.closest(\'.ig-card\').style.display=\'none\'" decoding="async">';
      return '<a class="ig-card" href="' + p.permalink + '" target="_blank" rel="noopener" data-reveal="scale" data-delay="' + Math.min(i % 5 + 1, 5) + '">' +
        media +
        (typeLabel ? '<div class="ig-type-badge">' + typeLabel + '</div>' : '') +
        '<div class="ig-overlay">' +
          (caption ? '<div class="ig-caption">' + escHtml(caption) + '</div>' : '') +
          '<div class="ig-meta">' +
            '<span>❤️ ' + fmtNum(p.like_count || 0) + '</span>' +
            '<span>💬 ' + fmtNum(p.comments_count || 0) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    buildDots();
    updateSlider();
    startAutoPlay();
    igWatchVideos();

    // Re-trigger scroll reveal for new cards
    if (typeof tagSections === 'function') setTimeout(tagSections, 100);
  }

  // ══════════════════════════════════════════════════════════════════════
  // HERO BANNER — the site's ONE offer carousel. Rendered at the top of the
  // home page (#heroBanner) and again on the shop page (#shopHero), from
  // this single config, so the two are always identical.
  //
  // ▼▼▼ PASTE YOUR BANNER IMAGES HERE ▼▼▼
  // Add up to 3. Leave src empty and that slide is skipped entirely; leave
  // all of them empty and the whole banner stays hidden.
  //
  //   desktop : 1600 x 686  (the artwork's own 2688 x 1152 shape)
  //   mobile  : 1000 x 429  (same shape, smaller file — never a square crop)
  //   keep each file under ~150 KB, WebP or JPG
  //
  // `link` is optional — where the banner sends the customer.
  // `mobile` is optional — falls back to `src` if you only make one image.
  // `alt` must state the REAL offer on the artwork: the offer reminder card
  // reads the first slide's alt verbatim, so a stale alt = a wrong offer.
  // ══════════════════════════════════════════════════════════════════════
// FEATURE HERO — removed Aug 2026. The captioned home slider (and its
// FEATURE_HERO_SLIDES config + engine) is gone: the home page now has a
// single image slider, #heroBanner, defined by BANNER_SLIDES below.

// mediaTypeFromUrl() lives in store-core.js, which loads after this file. The
// banner engines below now run as soon as the markup exists — earlier than
// that — so resolve it lazily and fall back to the same extension test.
// True when the element is actually laid out — offsetParent is null for a
// carousel inside an SPA page that is currently display:none.
function bnVisible(el) {
  return !!(el && el.offsetParent !== null);
}

// Build a carousel only once its own page is on screen.
//
// Home and shop are two sliders in ONE document, and both used to build at
// load whichever page you were on: opening the home page also rendered the
// shop hero's slides — extra <img> elements fetched, decoded and held in
// memory for a section the visitor cannot see — and /shop did the same for
// the home banner. They are independent sliders and now boot independently.
//
// #page-home ships with class "active", so the home banner is laid out at
// parse time and still builds immediately — the LCP path is unchanged. Only
// the offscreen one waits, and it waits on the element itself rather than on
// a router hook, so it works however the visitor arrives.
// The gate has to watch the PAGE, not the carousel. .hero-banner is
// display:none until it goes live, so its own offsetParent is null right up
// until the thing we are deciding whether to build has been built.
function bnPageOf(el) {
  return (el && el.closest && el.closest('.page')) || (el && el.parentElement) || el;
}
// Which page the URL asks for. #page-home ships with class "active" so the
// home banner can build before the router runs — that is what keeps it on the
// LCP path. But on a deep link the router is about to swap that class, so at
// boot the markup says "home is visible" for a page that is about to be
// replaced: a visitor landing on /shop was still building the whole home
// carousel. For that first decision the URL is the honest signal.
function bnRoute() {
  var p = String(location.pathname || '').replace(/\/+$/, '');
  if (p === '' || p === '/index.html') return 'home';
  if (p === '/shop') return 'shop';
  return 'other';
}
// Build a carousel only when its own page is the one on screen, and watch for
// that moment if it is not.
//
// Both sliders live in ONE document, so whichever page you opened used to
// build both: the home page also rendered the shop hero's slides — extra
// <img> elements fetched, decoded and held in memory for a section the
// visitor cannot see — and /shop did the same for the home banner. They are
// independent sliders and now boot independently.
//
// The test is the ROUTE, not layout. #page-home carries class "active" in the
// static markup until the router swaps it, and the router runs well after
// these scripts do, so during boot layout claims the home page is on screen
// even on a deep link to /shop. showPage() pushes a clean path ('/' or
// '/shop') on every navigation, so the URL is the one signal that is true
// both at boot and afterwards.
function bnWhenVisible(el, name, build) {
  if (!el) return;
  var page = bnPageOf(el);
  var ready = function () { return bnRoute() === name && bnVisible(page); };
  if (ready()) { build(); return; }
  // No IntersectionObserver: keep the old eager behaviour rather than a
  // carousel that never appears.
  if (!('IntersectionObserver' in window)) { build(); return; }
  if (el.__bnWatching) return;
  el.__bnWatching = true;
  var io = new IntersectionObserver(function () {
    // Fires on the way out as well, and can fire while the route still names
    // the other page — keep observing until both agree.
    if (!ready()) return;
    io.disconnect();
    el.__bnWatching = false;
    build();
  }, { rootMargin: '400px 0px' });
  io.observe(page);
}

function bnMediaType(url) {
  if (typeof mediaTypeFromUrl === 'function') return mediaTypeFromUrl(url);
  return /\.(mp4|webm|mov|m4v|3gp)(\?|$)/i.test(String(url || '')) ? 'video' : 'image';
}

// ── SHOP HERO SLIDER (Aug 2026) ────────────────────────────────────
// Deliberately NOT its own slider any more. The shop hero renders the exact
// same markup as the home #heroBanner. Aug 2026: both pages are driven by the
// admin-uploaded banners (ADMIN_HERO_BANNERS) — upload once in the admin
// panel and both the home carousel and the shop hero follow automatically.
(function () {
  var shIdx = 0, shTimer = null, shSlides = [];
  function shGo(i) {
    if (!shSlides.length) return;
    var n = shSlides.length;
    shIdx = ((i % n) + n) % n;                  // wraps both directions
    var track = document.getElementById('shTrack');
    if (track) track.style.transform = 'translateX(-' + (shIdx * 100) + '%)';
    var wrap = document.getElementById('shopHero');
    if (wrap) wrap.querySelectorAll('.hero-banner-dot').forEach(function (d, j) {
      d.classList.toggle('active', j === shIdx);
    });
  }
  function shRestart() {
    clearInterval(shTimer);
    if (shSlides.length < 2) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    shTimer = setInterval(function () {
      // Same as the home carousel: skip the tick while this page is offscreen.
      if (!document.hidden && bnVisible(document.getElementById('shopHero'))) shGo(shIdx + 1);
    }, 5000);
  }
  // force: only the visibility watcher passes true, to build a carousel whose
  // page has just been revealed. Every other caller leaves it out and goes
  // through the route gate below.
  window.initShopHero = function (force) {
    var wrap  = document.getElementById('shopHero');
    var track = document.getElementById('shTrack');
    if (!wrap || !track) return;
    // Offscreen and never built: wait for the shop page instead of rendering
    // slides nobody can see. Once built, later calls fall through and update
    // it in place so it is correct the moment the page is shown.
    if (force !== true && bnRoute() !== 'shop' && !wrap.classList.contains('is-live')) {
      bnWhenVisible(wrap, 'shop', function () { window.initShopHero(true); });
      return;
    }

    // Same source of truth as the home banner, filtered the same way: empty
    // entries are dropped BEFORE render, so an <img src=""> never fires an
    // error and leaves the index pointing at a slide that no longer exists.
    // Aug 2026: admin-uploaded banners (ADMIN_HERO_BANNERS) now drive BOTH
    // the home carousel and the shop hero — BANNER_SLIDES stays empty.
    var shSrc = (window.ADMIN_HERO_BANNERS && window.ADMIN_HERO_BANNERS.length) ? window.ADMIN_HERO_BANNERS.map(function (b) {
      return { src: b.url, mobile: b.url, alt: b.alt || 'Ozylix effervescent supplements offer banner', link: b.link || '' };
    }) : (window.BANNER_SLIDES || []);
    var shNext = shSrc.filter(function (s) {
      return s && s.src && String(s.src).trim();
    });
    if (!shNext.length) return;                 // stays display:none
    var shSig = shNext.map(function (s) { return s.src + '|' + s.link + '|' + s.alt; }).join('~');
    if (wrap.classList.contains('is-live') && wrap.__shSig === shSig) return;
    wrap.__shSig = shSig;
    shSlides = shNext;

    var isPhone = window.matchMedia('(max-width: 820px)').matches;
    track.innerHTML = shSlides.map(function (s, i) {
      var inner;
      if (bnMediaType(s.src) === 'video') {
        // Video banners play silently and loop — muted + playsinline is what
        // lets iOS autoplay them; the autoplay attr covers desktop.
        inner = '<video src="' + s.src + '" muted loop playsinline preload="metadata" autoplay'
              + ' aria-label="' + (s.alt || 'Ozylix effervescent supplements offer banner') + '"'
              + ' style="width:100%;height:100%;object-fit:cover"></video>';
      } else {
        var img = (isPhone && s.mobile) ? s.mobile : s.src;
        inner = '<img src="' + img + '" alt="' + (s.alt || 'Ozylix effervescent supplements offer banner') + '"' +
                    (i === 0 ? ' fetchpriority="high" decoding="sync"' : ' loading="lazy" decoding="async"') + '>';
      }
      return s.link
        ? '<a class="hero-banner-slide" href="' + s.link + '">' + inner + '</a>'
        : '<div class="hero-banner-slide">' + inner + '</div>';
    }).join('');
    // Kick any autoplaying video banners (some browsers need a real play() call)
    track.querySelectorAll('video').forEach(function (v) { v.play().catch(function () {}); });

    document.getElementById('shDots').innerHTML = shSlides.length < 2 ? '' :
      shSlides.map(function (_, i) {
        return '<button class="hero-banner-dot' + (i === 0 ? ' active' : '') +
               '" data-i="' + i + '" aria-label="Offer ' + (i + 1) + '"></button>';
      }).join('');

    wrap.classList.add('is-live');
    shIdx = 0;                                  // always open on the first slide
    shGo(0);

    if (shSlides.length < 2) {                  // one slide needs no controls
      ['shPrev', 'shNext'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.style.display = 'none';
      });
      return;
    }

    document.getElementById('shPrev').onclick = function () { shGo(shIdx - 1); shRestart(); };
    document.getElementById('shNext').onclick = function () { shGo(shIdx + 1); shRestart(); };
    document.getElementById('shDots').onclick = function (e) {
      var d = e.target.closest('.hero-banner-dot');
      if (d) { shGo(+d.dataset.i); shRestart(); }
    };

    // Swipe. Bound to the section, not the track — the track moves under the
    // finger, which loses the gesture halfway.
    if (!wrap.__shSwipe) {
      wrap.__shSwipe = true;
      var x0 = null, y0 = null;
      wrap.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      wrap.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        // Ignore mostly-vertical drags, or the banner steals page scrolling.
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { shGo(shIdx + (dx < 0 ? 1 : -1)); shRestart(); }
        x0 = y0 = null;
      }, { passive: true });
    }

    shRestart();
  };

  // Self-bootstrap, same reasoning as the home carousel. shop.js boots this
  // too, but its one-shot guard can fire before this deferred file has even
  // defined initShopHero; site-media.js now publishes its cached map earlier
  // than that as well. Initialising here means the shop hero renders on the
  // first pass no matter which of the three gets there first.
  // On /shop this carousel is the LCP, so build it straight away rather than
  // waiting for the router to reveal the page and the observer to fire.
  function shBoot() { window.initShopHero(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', shBoot);
  else shBoot();
})();

// ── OFFER REMINDER — real offer only, once per session ─────────────
// Reads the FIRST live offer banner (BANNER_SLIDES — the source of
// truth for current offers) and surfaces its alt text as a small
// dismissible micro-card. Nothing is invented; if no offer banner is
// live, the reminder never appears.
window.dismissOfferReminder = function () {
  var box = document.getElementById('offerReminder');
  var card = box && box.querySelector('.offer-reminder');
  if (card) card.classList.add('is-exit');
  try { sessionStorage.setItem('ozylix.offerDismissed', '1'); } catch (e) {}
  setTimeout(function () { if (box) box.style.display = 'none'; }, 380);
};
(function () {
  function showOfferReminder() {
    var box = document.getElementById('offerReminder');
    var label = document.getElementById('offerReminderText');
    if (!box || !label) return;
    try { if (sessionStorage.getItem('ozylix.offerDismissed')) return; } catch (e) {}
    // Source of truth: the live offer banners (real offers only)
    var slides = (typeof BANNER_SLIDES !== 'undefined' ? BANNER_SLIDES : []).filter(function (s) {
      return s && s.src && String(s.src).trim() && s.alt;
    });
    if (!slides.length) return;              // no live offer -> stay hidden
    var offer = String(slides[0].alt).replace(/\.?\s*(Ozylix|ASCOVITA)\s*/i, ' Ozylix ');
    offer = offer.replace(/\s*:\s*[^.]+\.?\s*$/, '.');
    label.textContent = offer;
    box.style.display = 'block';
  }
  function tryShow() {
    if (document.getElementById('offerReminder')) showOfferReminder();
    else setTimeout(tryShow, 300);
  }
  tryShow();
})();

// Aug 2026: offer banners are fully admin-managed (admin → Site Images →
  // Offer Banners — upload as many as you want, delete any, each gets alt +
  // link fields). Nothing to paste here anymore; this array stays empty and
  // the carousel simply stays hidden until the admin uploads banners.
  var BANNER_SLIDES = [];
  // ▲▲▲ END OF WHAT YOU EDIT ▲▲▲

  var bnIdx = 0, bnTimer = null, bnSlides = [];

  function initHeroBanner(force) {
    var wrap  = document.getElementById('heroBanner');
    var track = document.getElementById('heroBannerTrack');
    if (!wrap || !track) return;
    // Symmetrical: on /shop the home banner is the offscreen one.
    if (force !== true && bnRoute() !== 'home' && !wrap.classList.contains('is-live')) {
      bnWhenVisible(wrap, 'home', function () { initHeroBanner(true); });
      return;
    }

    // Filter FIRST, then render. An earlier build kept empty entries in the
    // array and rendered <img src="">, which fires an error, removes the
    // card, and leaves the index pointing at a slide that no longer exists —
    // that is what made the carousel open on slide 3 instead of slide 1.
    // Aug 2026: admin-managed banners (unlimited count) take priority over
    // the built-in BANNER_SLIDES array. When the admin has uploaded at least
    // one offer banner, its entries drive the carousel instead.
    var adminBanners = window.ADMIN_HERO_BANNERS;
    var srcSlides = adminBanners && adminBanners.length ? adminBanners.map(function(b) {
      return { src: b.url, mobile: b.url, alt: (String(b.alt || 'Ozylix effervescent supplements offer banner')).replace(/<[^>]+>/g, ''), link: b.link || '' };
    }) : BANNER_SLIDES;
    var nextSlides = srcSlides.filter(function(s) { return s && s.src && String(s.src).trim(); });
    if (!nextSlides.length) return;            // stays display:none
    // The cached media map and the network response almost always resolve to
    // the same banners, and this runs once for each. Re-rendering identical
    // slides re-decodes the images and snaps the carousel back to slide 1
    // under whoever was already looking at it — so compare and bail out.
    var sig = nextSlides.map(function(s) { return s.src + '|' + s.link + '|' + s.alt; }).join('~');
    if (wrap.classList.contains('is-live') && wrap.__bnSig === sig) return;
    wrap.__bnSig = sig;
    bnSlides = nextSlides;

    var isPhone = window.matchMedia('(max-width: 820px)').matches;
    track.innerHTML = bnSlides.map(function(s, i) {
      var inner;
      if (bnMediaType(s.src) === 'video') {
        inner = '<video src="' + s.src + '" muted loop playsinline preload="metadata" autoplay'
              + ' aria-label="' + (s.alt || 'Ozylix effervescent supplements offer banner') + '"'
              + ' style="width:100%;height:100%;object-fit:cover"></video>';
      } else {
        var img = (isPhone && s.mobile) ? s.mobile : s.src;
        inner = '<img src="' + img + '" alt="' + (s.alt || 'Ozylix effervescent supplements offer banner') + '"' +
                    (i === 0 ? ' fetchpriority="high" decoding="sync"' : ' loading="lazy" decoding="async"') + '>';
      }
      return s.link
        ? '<a class="hero-banner-slide" href="' + s.link + '">' + inner + '</a>'
        : '<div class="hero-banner-slide">' + inner + '</div>';
    }).join('');
    track.querySelectorAll('video').forEach(function (v) { v.play().catch(function () {}); });

    document.getElementById('heroBannerDots').innerHTML = bnSlides.length < 2 ? '' :
      bnSlides.map(function(_, i) {
        return '<button class="hero-banner-dot' + (i === 0 ? ' active' : '') +
               '" data-i="' + i + '" aria-label="Offer ' + (i + 1) + '"></button>';
      }).join('');

    wrap.classList.add('is-live');
    bnIdx = 0;                                  // always open on the first slide
    bnGo(0);
    bnClearHeader();

    if (bnSlides.length < 2) {                  // one slide needs no controls
      ['heroBannerPrev','heroBannerNext'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.style.display = 'none';
      });
      return;
    }

    // .onclick assignments replace themselves, but the two addEventListener
    // bindings below did not: initHeroBanner runs again every time site-media
    // applies a map (cache, then network), so they stacked up and one tap
    // advanced the carousel several slides at once.
    document.getElementById('heroBannerPrev').onclick = function() { bnGo(bnIdx - 1); bnRestart(); };
    document.getElementById('heroBannerNext').onclick = function() { bnGo(bnIdx + 1); bnRestart(); };
    if (!wrap.__bnBound) {
      wrap.__bnBound = true;
      document.getElementById('heroBannerDots').addEventListener('click', function(e) {
        var d = e.target.closest('.hero-banner-dot');
        if (d) { bnGo(+d.dataset.i); bnRestart(); }
      });

      // Swipe. Bound to the section, not the track — the track moves under the
      // finger, which made an earlier version lose the gesture halfway.
      var x0 = null, y0 = null;
      wrap.addEventListener('touchstart', function(e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      wrap.addEventListener('touchend', function(e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        var dy = e.changedTouches[0].clientY - y0;
        // Ignore mostly-vertical drags, or the banner steals page scrolling.
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { bnGo(bnIdx + (dx < 0 ? 1 : -1)); bnRestart(); }
        x0 = y0 = null;
      }, { passive: true });
    }

    bnRestart();
  }

  // The header and the announcement ticker are position:fixed, so the banner
  // — the first thing in the page flow — was starting at y=0 underneath them
  // and losing its top 90px on a phone. Measured rather than hard-coded: the
  // chrome is a different height on desktop, and taller again on a notched
  // phone once the safe-area inset applies.
  function bnClearHeader() {
    var wrap = document.getElementById('heroBanner');
    if (!wrap || !wrap.classList.contains('is-live')) return;
    // Named explicitly. A generic sweep for position:fixed also catches
    // #liquidFoil, #pageTransition and the drawers, which are all full-height
    // and would push the banner off the bottom of the screen. The ticker also
    // starts at y=58, not 0, so a "must touch the top" filter misses it.
    var lowest = 0;
    ['#appTopBar', '#appAnnTicker', 'header', '.app-header'].forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        var cs = getComputedStyle(el);
        if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
        var r = el.getBoundingClientRect();
        // Top chrome only: sits near the top and is a bar, not a panel.
        if (r.height > 4 && r.top < 120 && r.height < 160 && r.bottom > lowest) lowest = r.bottom;
      });
    });
    // Keep the landscape slider close to the mobile header while retaining
    // the full measured offset needed for safe-area and ticker chrome.
    if (lowest && window.matchMedia && window.matchMedia('(max-width: 768px)').matches) lowest = Math.max(0, lowest - 4);
    wrap.style.marginTop = lowest ? Math.round(lowest) + 'px' : '';
  }
  // Rotating a phone changes the chrome height.
  window.addEventListener('resize', function() {
    clearTimeout(window.__bnRz);
    window.__bnRz = setTimeout(bnClearHeader, 150);
  });

  function bnGo(i) {
    if (!bnSlides.length) return;
    var n = bnSlides.length;
    bnIdx = ((i % n) + n) % n;                  // wraps both directions
    var track = document.getElementById('heroBannerTrack');
    if (track) track.style.transform = 'translateX(-' + (bnIdx * 100) + '%)';
    // Scoped to this carousel. The shop hero (#shopHero) is the same engine
    // rendering the same markup into the same document, so an unscoped
    // '.hero-banner-dot' sweep matched ITS dots too: every home tick — a
    // click, or just the 5s autoplay — cleared the shop hero's active dot,
    // because the home index never lines up with the shop dots' positions in
    // the combined list. shGo() has always scoped its own query; this one
    // never did.
    var wrap = document.getElementById('heroBanner');
    if (wrap) wrap.querySelectorAll('.hero-banner-dot').forEach(function(d, j) {
      d.classList.toggle('active', j === bnIdx);
    });
  }

  function bnRestart() {
    clearInterval(bnTimer);
    if (bnSlides.length < 2) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    bnTimer = setInterval(function() {
      // A hidden tab should not advance — and neither should a carousel on a
      // page the visitor is not looking at. Home and shop both build their
      // slider at load, so without this the offscreen one animates every 5s
      // for the whole session: style recalcs and a compositor layer nobody
      // can see. offsetParent goes null as soon as the page is display:none.
      if (!document.hidden && bnVisible(document.getElementById('heroBanner'))) bnGo(bnIdx + 1);
    }, 5000);
  }

  // This block lives inside the Instagram IIFE, so without these the config
  // would be unreachable from anywhere else — including the admin, if the
  // banner is ever driven from the database instead of this file.
  window.BANNER_SLIDES   = BANNER_SLIDES;
  window.initHeroBanner  = initHeroBanner;

  // Deferred scripts run with the document already parsed, so #heroBanner
  // exists now. Building it immediately — instead of waiting for the
  // DOMContentLoaded pass — puts the banner on screen a frame earlier when
  // site-media has already published a cached map. On any other route it is
  // the offscreen carousel, so it waits for the visitor to come to it.
  function bnBoot() { initHeroBanner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bnBoot);
  else bnBoot();

  // ── REELS ──
  // Only plays what is actually on screen, and pauses everything else. Left
  // to autoplay, six reels would all download and decode at once on a phone —
  // exactly the kind of thing that made product images vanish mid-load.
  var igPlayObserver = null;
  function igWatchVideos() {
    var vids = document.querySelectorAll('#igTrack video');
    if (!vids.length) return;

    // Someone who asked for less motion should not get six looping videos.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (igPlayObserver) igPlayObserver.disconnect();
    igPlayObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(en) {
        var v = en.target;
        if (en.isIntersecting) {
          // play() rejects on its own if the browser blocks autoplay; the
          // poster stays up, which is the old behaviour anyway.
          var pr = v.play();
          if (pr && pr.catch) pr.catch(function(){});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.6 });

    vids.forEach(function(v) { igPlayObserver.observe(v); });

    // A backgrounded tab should not keep decoding video.
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) vids.forEach(function(v) { if (!v.paused) v.pause(); });
    });
  }

  // ── DOTS ──
  function buildDots() {
    var el = document.getElementById('igDots');
    if (!el) return;
    var pages = Math.ceil(igTotal / CARDS_VISIBLE);
    el.innerHTML = Array.from({length: pages}, function(_, i) {
      return '<button class="ig-dot' + (i === 0 ? ' active' : '') + '" onclick="igGoTo(' + i + ')"></button>';
    }).join('');
  }

  // ── SLIDE ──
  window.igSlide = function(dir) {
    var pages = Math.ceil(igTotal / CARDS_VISIBLE);
    igIndex = (igIndex + dir + pages) % pages;
    updateSlider();
    resetAutoPlay();
  };

  window.igGoTo = function(page) {
    igIndex = page;
    updateSlider();
    resetAutoPlay();
  };

  function updateSlider() {
    var track = document.getElementById('igTrack');
    if (!track) return;
    var cardW = track.querySelector('.ig-card');
    if (!cardW) return;
    var gap = 14;
    var cardWidth = cardW.getBoundingClientRect().width + gap;
    track.style.transform = 'translateX(-' + (igIndex * CARDS_VISIBLE * cardWidth) + 'px)';

    // Update dots
    document.querySelectorAll('.ig-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === igIndex);
    });

    // Update nav buttons
    var pages = Math.ceil(igTotal / CARDS_VISIBLE);
    var prev = document.querySelector('.ig-prev');
    var next = document.querySelector('.ig-next');
    if (prev) prev.disabled = igTotal <= CARDS_VISIBLE;
    if (next) next.disabled = igTotal <= CARDS_VISIBLE;
  }

  function startAutoPlay() {
    igAutoTimer = setInterval(function() { igSlide(1); }, 4000);
  }
  function resetAutoPlay() {
    clearInterval(igAutoTimer);
    startAutoPlay();
  }

  // ── HELPERS ──
  function fmtNum(n) { return n > 999 ? (n/1000).toFixed(1) + 'k' : n; }
  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', function() {
    // Only load when section scrolls into view (saves bandwidth)
    var section = document.getElementById('igSection');
    if (!section) return;
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        loadInstagram();
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(section);
  });

})();
