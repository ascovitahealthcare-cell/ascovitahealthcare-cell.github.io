// Extracted from index.html (line 24021) by Manus SEO pass — load order preserved

/* ══════════════════════════════════════════════════════════════════════
   SCROLL SELF-TEST  —  open the site with ?diag=1 on the affected phone

   Why this exists: a scrolling fault that reproduces on a real Android
   handset but not in any emulator cannot be diagnosed from a laptop. The
   two candidate explanations — "the page is genuinely broken" and "this
   phone is running an old cached copy of the page" — look identical to
   the person holding it. This tells them apart ON the device, in the
   state where it is actually failing.

   Inert unless ?diag=1 is in the URL. It never runs for a customer.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  try {
    if (!/[?&]diag=1/.test(location.search)) return;

    function build() {
      var b = document.body, de = document.documentElement;
      var cs = getComputedStyle(b), cd = getComputedStyle(de);

      // Does the page actually move? Try it and put it back.
      //
      // behavior:'instant' is essential. The stylesheet sets
      // scroll-behavior:smooth on <html>, so a plain scrollTo animates and
      // scrollY is still the OLD value when read on the next line — which
      // reports "page does not scroll" on a perfectly healthy page. An
      // alarm that fires on a working build is worse than no alarm.
      var y0 = window.scrollY;
      var probe = Math.max(1, Math.min(300, de.scrollHeight - innerHeight));
      try { window.scrollTo({ top: y0 + probe, behavior: 'instant' }); }
      catch (e) { window.scrollTo(0, y0 + probe); }
      var moved = window.scrollY !== y0;
      try { window.scrollTo({ top: y0, behavior: 'instant' }); }
      catch (e) { window.scrollTo(0, y0); }

      // Whatever is on top at the middle of the screen is what a finger
      // would land on.
      var hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      var hitDesc = 'none';
      if (hit) {
        var hcs = getComputedStyle(hit);
        hitDesc = hit.tagName + (hit.id ? '#' + hit.id : '') +
          ' pe=' + hcs.pointerEvents + ' pos=' + hcs.position + ' z=' + hcs.zIndex;
      }

      var openLayers = ['sideCart', 'appMenuDrawer', 'appMoreDrawer', 'authOverlay']
        .filter(function (id) {
          var n = document.getElementById(id);
          return n && n.classList.contains('open');
        });

      // The decisive line: this function only exists in the fixed build.
      // Absent means this phone is running an OLD cached copy, whatever
      // the server is serving.
      var hasFix = (typeof window.healStuckScrollLock === 'function');

      var rows = [
        ['BUILD HAS SCROLL FIX', hasFix ? 'YES' : 'NO  <-- old cached copy'],
        ['page scrolls', moved ? 'YES' : 'NO'],
        ['body inline position', b.style.position || '(none)'],
        ['body inline overflow', b.style.overflow || '(none)'],
        ['body inline top', b.style.top || '(none)'],
        ['computed html overflow', cd.overflowX + ' / ' + cd.overflowY],
        ['computed body overflow', cs.overflowX + ' / ' + cs.overflowY],
        ['drawers open', openLayers.length ? openLayers.join(', ') : 'none'],
        ['element at centre', hitDesc],
        ['scrollHeight / innerHeight', de.scrollHeight + ' / ' + innerHeight],
        ['horizontal overflow', de.scrollWidth > de.clientWidth
          ? 'YES (' + de.scrollWidth + ' > ' + de.clientWidth + ')' : 'no'],
        ['pointer', (matchMedia('(pointer: coarse)').matches ? 'coarse' : '') +
                    (matchMedia('(pointer: fine)').matches ? ' fine' : '')],
        ['service worker', navigator.serviceWorker && navigator.serviceWorker.controller
          ? 'controlling this page' : 'not controlling'],
        ['viewport', innerWidth + ' x ' + innerHeight + ' dpr=' + (window.devicePixelRatio || 1)],
        ['user agent', navigator.userAgent]
      ];

      var box = document.createElement('div');
      box.id = '_diagPanel';
      /* 40vh, not 75vh. The panel is a scrollable fixed layer, so at 75vh
         it covered most of the screen and swallowed the very thumb-drags
         the person was trying to test with — the tool got in the way of
         the measurement. This leaves the lower half of the page clear to
         drag on while the readings stay visible. */
      box.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483647;' +
        'background:#0b1030;color:#dfe6ff;font:11px/1.45 monospace;padding:10px 12px 12px;' +
        'max-height:40vh;overflow:auto;-webkit-overflow-scrolling:touch;box-shadow:0 8px 24px rgba(0,0,0,.5)';

      var html = '<div style="font-weight:700;margin-bottom:8px">Ozylix scroll self-test</div>';
      rows.forEach(function (r) {
        var warn = (r[0] === 'BUILD HAS SCROLL FIX' && !hasFix) ||
                   (r[0] === 'page scrolls' && !moved);
        html += '<div style="margin-bottom:3px' + (warn ? ';color:#ff9b9b;font-weight:700' : '') + '">' +
                r[0] + ': <span style="color:#9ad0ff">' + String(r[1]).replace(/[<>&]/g, '') + '</span></div>';
      });
      box.innerHTML = html;

      // Two escape hatches: force the page unstuck, and dismiss the panel.
      var fix = document.createElement('button');
      fix.textContent = 'Force unstick';
      fix.style.cssText = 'margin:10px 8px 0 0;padding:9px 14px;background:#3d5afe;color:#fff;border:0;border-radius:6px;font:600 12px monospace';
      fix.onclick = function () {
        if (window.closeAllOverlays) window.closeAllOverlays();
        else {
          b.style.position = ''; b.style.top = ''; b.style.left = '';
          b.style.right = ''; b.style.width = ''; b.style.overflow = '';
        }
        box.remove();
        build();
      };
      /* Re-test matters more than the first reading. The fault appears
         AFTER interaction — open the menu, press Back — so the state at
         page load is usually healthy. Get the page into the broken state,
         then tap this to see what it looks like at that moment. */
      var again = document.createElement('button');
      again.textContent = 'Re-test';
      again.style.cssText = 'margin:10px 8px 0 0;padding:9px 14px;background:#1b7f4b;color:#fff;border:0;border-radius:6px;font:600 12px monospace';
      again.onclick = function () { box.remove(); build(); };

      var close = document.createElement('button');
      close.textContent = 'Close';
      close.style.cssText = 'margin-top:10px;padding:9px 14px;background:#39406b;color:#fff;border:0;border-radius:6px;font:600 12px monospace';
      close.onclick = function () { box.remove(); };
      box.appendChild(again); box.appendChild(fix); box.appendChild(close);
      document.body.appendChild(box);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 1200); });
    } else {
      setTimeout(build, 1200);
    }
  } catch (e) { /* a diagnostic must never break the page it inspects */ }
})();
