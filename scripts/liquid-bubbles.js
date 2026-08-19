// Extracted from index.html (line 22663) by Manus SEO pass — load order preserved

/* ════════════════════════════════════════════════════════════════════
   OZYLIX · SOFT WHITE ENGINE

   The motion of this world is small and physical:
   · the mark's own bubbles drifting up the page,
   · paper that flexes a few degrees under the pointer,
   · scroll and pointer channels published to CSS.

   Everything is off on coarse pointers, narrow viewports, low-core
   machines and under prefers-reduced-motion.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(hover: none)').matches;
  var narrow = window.innerWidth < 900;
  var weak   = (navigator.hardwareConcurrency || 4) <= 4;
  var LOW    = coarse || narrow || weak;

  /* The shader is retired: this world's motion is the mark's own bubbles
     drifting, and paper that presses when you touch it. */
  function startWater() {}

  /* ══ 2 · DEPTH ═══════════════════════════════════════════════════
     Cards are metal plates suspended in the water; they catch the light
     as the pointer moves past them.                                   */

  var TILT_SELECTOR = [
    '.product-card', '.cat-card', '.cat-card-sm', '.cert-card', '.value-card',
    '.blog-card', '.rt-card', '.pkg-card', '.b2b-svc-card', '.b2b-mini-card',
    '.sub-card', '.brochure-card', '.testi-card', '.access-card'
  ].join(',');

  function tiltable(el) {
    if (el.__tilt) return;
    el.__tilt = true;
    el.setAttribute('data-tilt', '');

    var raf = null, tx = 0, ty = 0, pz = 0;
    function apply() {
      raf = null;
      el.style.setProperty('--tx', tx.toFixed(2) + 'deg');
      el.style.setProperty('--ty', ty.toFixed(2) + 'deg');
      el.style.setProperty('--pz', pz.toFixed(1) + 'px');
    }
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width  - 0.5;
      var ny = (e.clientY - r.top)  / r.height - 0.5;
      tx = -ny * 4; ty = nx * 5; pz = 12;
      el.classList.add('fz-live');
      if (raf === null) raf = requestAnimationFrame(apply);
    }, { passive: true });
    el.addEventListener('pointerleave', function () {
      tx = 0; ty = 0; pz = 0;
      el.classList.remove('fz-live');
      if (raf === null) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  function scanTilt() {
    if (LOW || reduce) return;
    var nodes = document.querySelectorAll(TILT_SELECTOR);
    for (var i = 0; i < nodes.length; i++) tiltable(nodes[i]);
  }

  /* Magnetic pull on the page's leading actions. */
  function magnetise() {}

  /* Pointer and scroll channels, read by CSS. */
  function channels() {
    var root = document.documentElement, raf = null, mx = 0, my = 0;
    if (!coarse && !reduce) {
      window.addEventListener('pointermove', function (e) {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
        if (raf === null) raf = requestAnimationFrame(function () {
          raf = null;
          root.style.setProperty('--mx', mx.toFixed(3));
          root.style.setProperty('--my', my.toFixed(3));
        });
      }, { passive: true });
    }
    var sraf = null;
    window.addEventListener('scroll', function () {
      if (sraf !== null) return;
      sraf = requestAnimationFrame(function () {
        sraf = null;
        var max = document.body.scrollHeight - window.innerHeight;
        root.style.setProperty('--scrollv', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
      });
    }, { passive: true });
  }

  /* ══ 3 · BUBBLE FIELD ════════════════════════════════════════════
     Ambient bubbles across the whole page, not only the hero.        */
  function bubbles() {
    if (reduce) return;
    var n = LOW ? 5 : 11;
    for (var i = 0; i < n; i++) {
      (function (i) {
        setTimeout(function () {
          var b = document.createElement('div');
          b.className = 'particle';
          var size = 6 + Math.random() * 16;
          b.style.cssText = [
            'width:' + size.toFixed(1) + 'px',
            'height:' + size.toFixed(1) + 'px',
            'left:' + (Math.random() * 100).toFixed(2) + '%',
            'animation-duration:' + (14 + Math.random() * 20).toFixed(1) + 's',
            'animation-delay:' + (Math.random() * 10).toFixed(1) + 's'
          ].join(';');
          document.body.appendChild(b);
        }, i * 700);
      })(i);
    }
  }

  /* ══ 3b · LIQUID FOIL ════════════════════════════════════════════
     A soft field of colour behind the paper, built from the product
     range's own flavours. Drifts on its own and leans with the
     pointer and scroll position via the --mx/--my/--scrollv channels
     channels() already publishes.                                   */
  function liquidFoil() {
    if (reduce || document.getElementById('liquidFoil')) return;
    var field = document.createElement('div');
    field.id = 'liquidFoil';
    var count = LOW ? 2 : 4;
    for (var i = 1; i <= count; i++) {
      var blob = document.createElement('div');
      blob.className = 'foil-blob b' + i;
      field.appendChild(blob);
    }
    document.body.insertBefore(field, document.body.firstChild);
  }

  /* The floating cursor that used to live here (a trailing halo plus a
     ring on the pointer) was removed at the owner’s request while
     chasing the Android scrolling fault. It was desktop-only and never
     ran on a phone, but it is deleted rather than disabled so nothing
     remains to suspect. Its listeners went with it. */

  /* ══ 4 · WIRING ══════════════════════════════════════════════════ */
  function boot() {
    startWater();
    channels();
    bubbles();
    liquidFoil();
    scanTilt();
    magnetise();

    /* Re-scan after the app renders grids or swaps pages. */
    var pending = null;
    function rescan() {
      clearTimeout(pending);
      pending = setTimeout(function () { scanTilt(); magnetise(); }, 220);
    }
    ['shopGrid', 'featuredGrid', 'newArrivalsGrid', 'relatedGrid', 'bundleProdList', 'homeBlogGrid', 'fullBlogGrid']
      .forEach(function (id) {
        var el = document.getElementById(id);
        if (el && window.MutationObserver) new MutationObserver(rescan).observe(el, { childList: true });
      });

    var wrapTimer = setInterval(function () {
      if (typeof window.showPage === 'function' && !window.__fzPageWrapped) {
        window.__fzPageWrapped = true;
        var orig = window.showPage;
        window.showPage = function (pg) { orig(pg); rescan(); };
        clearInterval(wrapTimer);
      }
    }, 200);
    setTimeout(function () { clearInterval(wrapTimer); }, 12000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

