// Extracted from index.html (line 24675) by Manus SEO pass — load order preserved

(function () {
  'use strict';
  var STORE = 'ozylix';
  var API = 'https://ascovitahealthcare-cell-github-io.onrender.com/api/public/theme';
  var CACHE_MS = 60000;

  function buildCss(theme) {
    var t = theme || {};
    var p = t.palette || {};
    var f = t.fonts || {};
    var css = [];
    // Surface
    if (p.paper !== undefined)    css.push('--paper:' + p.paper + ';');
    if (p.paperHi !== undefined)  css.push('--paper-hi:' + p.paperHi + ';');
    if (p.paperLo !== undefined)  css.push('--paper-lo:' + p.paperLo + ';');
    if (p.white !== undefined)    css.push('--white:' + p.white + ';');
    // Brand + ink
    if (p.brand !== undefined)    css.push('--indigo:' + p.brand + ';');
    if (p.brandDeep !== undefined)  css.push('--indigo-lo:' + p.brandDeep + ';');
    if (p.brandHi !== undefined)    css.push('--indigo-hi:' + p.brandHi + ';');
    if (p.secondary !== undefined)  css.push('--green:' + p.secondary + ';');
    if (p.secondaryHi !== undefined) css.push('--green-hi:' + p.secondaryHi + ';');
    if (p.ink !== undefined)      css.push('--ink:' + p.ink + ';');
    if (p.inkMid !== undefined)   css.push('--navy:' + p.inkMid + ';');
    if (p.tHi !== undefined)      css.push('--t-hi:' + p.tHi + ';');
    if (p.tMid !== undefined)     css.push('--t-mid:' + p.tMid + ';');
    if (p.tLow !== undefined)     css.push('--t-low:' + p.tLow + ';');
    // Ambient flavour field (drives liquid foil + card chips)
    if (p.flavour1 !== undefined) css.push('--f-citrus:' + p.flavour1 + ';');
    if (p.flavour2 !== undefined) css.push('--f-cobalt:' + p.flavour2 + ';');
    if (p.flavour3 !== undefined) css.push('--f-guava:' + p.flavour3 + ';');
    if (p.flavour4 !== undefined) css.push('--f-apple:' + p.flavour4 + ';');
    // Legacy bridges keep working automatically
    if (p.brand !== undefined)    css.push('--gold:' + p.brand + ';--amber:' + p.brand + ';');
    if (p.brandDeep !== undefined)  css.push('--red:#C0304A;');
    // Fonts
    if (f.display !== undefined) css.push('--font-display:' + f.display + ';');
    if (f.body !== undefined)    css.push('--font-ui:' + f.body + ';--font-body:' + f.body + ';');
    // Layout switches
    if (t.radius === 'sharp')      css.push('--r-pill:14px;--r-md:12px;--r-lg:18px;--r-xl:26px;');
    else if (t.radius === 'extra') css.push('--r-pill:30px;--r-md:22px;--r-lg:32px;--r-xl:44px;');
    if (t.shadows === 'soft')      css.push('--neo-1:var(--neo-in);--neo-2:var(--neo-in);--neo-3:var(--neo-in);--neo-4:var(--neo-in);');
    else if (t.shadows === 'none') css.push('--neo-1:none;--neo-2:none;--neo-3:none;--neo-4:none;');
    // Navbar
    if (t.header && t.header.bg) {
      css.push('.navbar{background:' + t.header.bg + ';}');
      if (t.header.fg) css.push('.navbar{color:' + t.header.fg + ';}');
    }
    // Ambient bubbles
    if (t.bubbles === 'off') css.push('.particle{display:none !important;}#liquidFoil{display:none;}');
    if (!css.length) return '';
    return ':root{' + css.join('') + '}';
  }

  function applyThemeCss(cssText) {
    var el = document.getElementById('live-theme');
    if (!el) {
      el = document.createElement('style');
      el.id = 'live-theme';
      document.head.appendChild(el);
    }
    el.textContent = cssText;
  }

  function loadTheme() {
    try {
      var draft = null;
      try { draft = localStorage.getItem('ozylix_theme'); } catch (_) {}
      var isPreview = /[?&]preview=1/.test(location.search);
      var cached = null;
      try {
        var raw = localStorage.getItem('ozylix_theme_cache');
        if (raw) {
          var obj = JSON.parse(raw);
          if (Date.now() - obj.at < CACHE_MS) cached = obj.theme;
        }
      } catch (_) {}

      var use = cached;
      var save = function (theme) {
        try { localStorage.setItem('ozylix_theme_cache', JSON.stringify({ at: Date.now(), theme: theme })); } catch (_) {}
      };

      if (isPreview && draft) use = draft;
      applyThemeCss(buildCss(use));

      // Refresh from the backend in the background; admin drafts always win.
      fetch(API + '?key=' + STORE)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (d && d.ok && d.theme && Object.keys(d.theme).length) {
            save(d.theme);
            if (!isPreview) applyThemeCss(buildCss(d.theme));
          }
        })
        .catch(function () {});
    } catch (_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadTheme);
  else loadTheme();
})();
