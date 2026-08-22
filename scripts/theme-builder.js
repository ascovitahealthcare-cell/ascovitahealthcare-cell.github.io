// Extracted from index.html (line 24781) by Manus SEO pass — load order preserved

// ═════════════ OZYLIX v10 — STORE LOADER EXTENSION ═════════════
// Reads the published theme's `style` + `combos` and builds the extra
// CSS rules the design-system engine produces (mirror of the admin
// panel's registry). Also applies published content edits (v9.6).
// Appended at end of file per repo convention.
(function () {
  'use strict';
  var CONTENT_API = 'https://ascovitahealthcare-cell-github-io.onrender.com/api/public/content';
  var CONTENT_KEY = 'ozylix';
  var CONTENT_CACHE_MS = 60000;

  function mix(a, b, t) {
    var pa = [a, b].map(function (c) {
      var h = c.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    });
    var r = pa[0].map(function (v, i) { return Math.round(v + (pa[1][i] - v) * t); });
    return '#' + r.map(function (v) { return Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0'); }).join('').toUpperCase();
  }

  function lighten(hex, t) { return mix(hex, '#FFFFFF', Math.min(1, Math.max(0, t))); }
  function darken(hex, t)  { return mix(hex, '#000000', Math.min(1, Math.max(0, t))); }

  function buildStyleCss(theme) {
    var t = theme || {};
    var p = t.palette || {};
    var c = t.combos || {};
    var style = t.style || 'default';
    var css = [];

    // ── Design-system preset base ─────────────────────────────────
    if (style === 'clay') {
      var shd = 'rgba(90,80,110,.16)', lit = 'rgba(255,255,255,.85)';
      if (p.paper) css.push('--paper:' + lighten(p.paper, .04) + ';');
      css.push('--sh-d:' + shd + ';--sh-l:' + lit + ';',
        '--neo-1:6px 8px 14px ' + shd + ', -5px -6px 12px ' + lit + ';',
        '--neo-2:10px 12px 22px ' + shd + ', -8px -10px 18px ' + lit + ';',
        '--neo-in:inset 6px 6px 12px ' + shd + ', inset -5px -5px 10px ' + lit + ';',
        '--neo-shadow:var(--neo-2);', '--radius:var(--r-lg);',
        '.product-card:hover,.cat-card:hover,.btn-primary:hover,.shader-btn-primary:hover{transform:translateY(-3px) scale(1.015);transition:transform .25s ease, box-shadow .25s ease;}');
    } else if (style === 'aurora') {
      var fl1 = p.flavour1 || '#4B7BE5', fl2 = p.flavour2 || '#9B5DE5', fl3 = p.flavour3 || '#F15BB5', fl4 = p.flavour4 || '#4CC9F0';
      var brand = p.brand || '#C0394A';
      css.push('--paper-hi:rgba(255,255,255,.62);--paper-lo:rgba(245,243,244,.45);',
        'body{background:radial-gradient(1200px 600px at 12% -5%,' + lighten(fl1, .68) + ',transparent 55%),radial-gradient(900px 500px at 88% 8%,' + lighten(fl2, .62) + ',transparent 52%),radial-gradient(1000px 700px at 50% 105%,' + lighten(fl3, .58) + ',transparent 58%),linear-gradient(180deg,#F7F4FC,#EEF2FA);}',
        '#liquidFoil{display:none !important;}',
        '.navbar,.card,.product-card,.cat-card,.cat-card-sm{background:rgba(255,255,255,.62) !important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.65);box-shadow:0 8px 30px rgba(90,80,120,.12);}',
        '--shadow:0 8px 30px rgba(90,80,120,.12);--shadow-xs:0 4px 14px rgba(90,80,120,.10);--shadow-sm:0 6px 18px rgba(90,80,120,.11);',
        '--radius:var(--r-lg);',
        '.btn-primary,.shader-btn-primary{background:' + brand + ';box-shadow:0 6px 20px ' + darken(brand, .25) + '40;border:none;}',
        '.particle{opacity:.3 !important;animation-duration:38s !important;}');
    } else if (style === 'bento') {
      var bink = p.ink || '#18181B'; var bbrand = p.brand || '#C0394A';
      css.push('--sh-d:rgba(30,30,36,.07);--sh-l:#FFFFFF;',
        '--neo-1:0 0 0 1px rgba(30,30,36,.06), 0 2px 8px rgba(30,30,36,.06);',
        '--neo-2:0 0 0 1px rgba(30,30,36,.07), 0 6px 18px rgba(30,30,36,.08);',
        '--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-1);',
        '--radius:var(--r-md);',
        '.navbar{background:#FFFFFF;border-bottom:1px solid rgba(30,30,36,.07);box-shadow:none;}',
        '.promo-strip,.announce{border-radius:18px;box-shadow:var(--neo-1);}',
        '.btn-primary,.shader-btn-primary{box-shadow:0 2px 8px ' + darken(bbrand, .3) + '26;border-radius:var(--r-md);}');
    } else if (style === 'brutal') {
      var br = p.brand || '#C0394A', brf1 = p.flavour1 || '#FFD23F', brf2 = p.flavour2 || '#06D6A0', brf3 = p.flavour3 || '#EF476F', brf4 = p.flavour4 || '#118AB2';
      css.push('--paper:' + (p.paper || '#FFEFD8') + ';--ink:#111111;--t-hi:#111111;',
        '--sh-d:#111111;--sh-l:#FFFFFF;',
        '--neo-1:4px 4px 0 #111111;--neo-2:7px 7px 0 #111111;',
        '--neo-in:inset 4px 4px 0 rgba(0,0,0,.12);',
        '--shadow:var(--neo-1);--shadow-xs:3px 3px 0 #111111;--shadow-sm:5px 5px 0 #111111;',
        '--radius:var(--r-sm);',
        '.card,.product-card,.cat-card,.cat-card-sm,.navbar,.hero-body{border:2.5px solid #111111 !important;}',
        '.btn-primary,.shader-btn-primary{border:2.5px solid #111111;box-shadow:4px 4px 0 #111111;}',
        '.btn-primary:active,.shader-btn-primary:active{transform:translate(3px,3px);box-shadow:1px 1px 0 #111111;}',
        'h1,h2,h3{text-transform:uppercase;letter-spacing:.06em;}',
        '.products-grid .product-card:nth-child(5n+1){background:' + brf1 + ';}.products-grid .product-card:nth-child(5n+2){background:' + brf2 + ';color:#0B3D2C;}',
        '.products-grid .product-card:nth-child(5n+3){background:' + brf3 + ';color:#FFF;}.products-grid .product-card:nth-child(5n+4){background:' + brf4 + ';color:#FFF;}',
        '.particle{display:none !important;}#liquidFoil{display:none;}');
    } else if (style === 'skeuo') {
      var sk = p.brand || '#C0394A';
      css.push('--paper:' + (p.paper || '#EAE2D6') + ';--paper-hi:#F6EFE3;--paper-lo:#DDD2C2;--ink:' + (p.ink || '#3B2F24') + ';',
        '--sh-d:rgba(60,45,30,.28);--sh-l:rgba(255,250,238,.75);',
        '--neo-1:2px 3px 5px rgba(60,45,30,.3), inset 0 1px 0 rgba(255,250,238,.9);',
        '--neo-2:4px 6px 10px rgba(60,45,30,.28), inset 0 1px 0 rgba(255,250,238,.8);',
        '--neo-in:inset 2px 3px 6px rgba(60,45,30,.3), inset 0 1px 0 rgba(255,250,238,.5);',
        '--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-1);',
        '--radius:var(--r-sm);',
        '.card,.product-card,.cat-card{background:linear-gradient(180deg,#F8F1E4,#EDE2D0);border:1px solid #CBBBA2;}',
        '.btn-primary,.shader-btn-primary{background:linear-gradient(180deg,' + lighten(sk, .15) + ',' + darken(sk, .1) + ');border:1px solid ' + darken(sk, .3) + ';box-shadow:0 2px 4px rgba(40,25,15,.35), inset 0 1px 0 rgba(255,255,255,.35);}',
        '.navbar{background:linear-gradient(180deg,#EFE6D5,#E2D4BE);border-bottom:1px solid #CBBBA2;}',
        '.particle{display:none !important;}#liquidFoil{display:none;}');
    } else if (style === 'material') {
      var mb = p.brand || '#C0394A';
      css.push('--paper:' + (p.paper || '#FAFAF9') + ';--paper-hi:#FFFFFF;--paper-lo:#F3F3F2;',
        '--sh-d:rgba(30,30,32,.09);--sh-l:#FFFFFF;',
        '--neo-1:0 1px 2px rgba(30,30,32,.06), 0 2px 6px rgba(30,30,32,.05);',
        '--neo-2:0 3px 8px rgba(30,30,32,.08), 0 8px 20px rgba(30,30,32,.07);',
        '--neo-in:none;',
        '--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:0 2px 7px rgba(30,30,32,.07);',
        '--radius:var(--r-md);',
        '.card,.product-card,.cat-card{border:1px solid rgba(30,30,32,.06);}',
        '.btn-primary,.shader-btn-primary{box-shadow:0 2px 6px ' + darken(mb, .3) + '29;}',
        '.navbar{border-bottom:1px solid rgba(30,30,32,.07);}',
        '.particle{opacity:.2 !important;}');
    }


    // ── v10.3: brand-new full templates ───────────────────────────
    else if (style === 'midnight') {
      var md = p.brand || '#C9A24B', mdpaper = p.paper || '#101217', mdink = p.ink || '#F2EFE8';
      css.push('--paper:' + mdpaper + ';--paper-hi:#171A21;--paper-lo:#0A0C10;',
        '--ink:' + mdink + ';--t-hi:#F2EFE8;--t-mid:#A9A498;--t-low:#7C786E;',
        '--sh-d:rgba(0,0,0,.55);--sh-l:rgba(255,255,255,.05);',
        '--neo-1:0 8px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04);',
        '--neo-2:0 16px 48px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04);',
        '--neo-in:inset 0 2px 8px rgba(0,0,0,.5);',
        '--shadow:var(--neo-1);--shadow-xs:0 4px 14px rgba(0,0,0,.45);--shadow-sm:0 10px 34px rgba(0,0,0,.5);',
        '--radius:var(--r-md);',
        '--font-display:\'Playfair Display\',Georgia,serif;',
        'body{background:linear-gradient(180deg,#0F1116,#0A0C10) !important;color:' + mdink + ';}',
        '.navbar,.card,.product-card,.cat-card,.cat-card-sm,.trust-card{background:#171A21 !important;border:1px solid rgba(201,162,75,.22);box-shadow:var(--neo-1);}',
        '.hero-body,.shader-stage{background:linear-gradient(180deg,#14161C 0%,#0C0E13 70%);}',
        '.btn-primary,.shader-btn-primary{background:linear-gradient(180deg,' + lighten(md, .12) + ',' + md + ');color:#141208;border:none;box-shadow:0 4px 18px ' + md + '55;font-weight:600;letter-spacing:.06em;}',
        '.shader-badge{background:' + md + '22;border:1px solid ' + md + '66;color:' + lighten(md, .35) + ';}',
        'h1,h2,h3{color:' + mdink + ';font-family:\'Playfair Display\',Georgia,serif;font-weight:500;letter-spacing:.01em;}',
        '.trust-tile{background:#171A21;border:1px solid rgba(201,162,75,.2);}',
        '.footer-wrap{background:#0A0C10;border-top:1px solid rgba(201,162,75,.18);}',
        '.particle{display:none !important;}#liquidFoil{display:none;}');
    } else if (style === 'freshpharm') {
      var fp = p.brand || '#0E7C86', fppaper = p.paper || '#FFFFFF';
      css.push('--paper:' + fppaper + ';--paper-hi:#FFFFFF;--paper-lo:#F2F6F7;',
        '--ink:#0B2529;--t-hi:#0B2529;--t-mid:#3A5559;--t-low:#5F7A7E;',
        '--sh-d:rgba(14,124,134,.14);--sh-l:#FFFFFF;',
        '--neo-1:0 0 0 1px rgba(14,124,134,.10), 0 1px 3px rgba(14,124,134,.06);',
        '--neo-2:0 0 0 1px rgba(14,124,134,.12), 0 4px 12px rgba(14,124,134,.08);',
        '--neo-in:none;',
        '--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-2);',
        '--radius:14px;',
        '--font-display:\'Jost\',system-ui,sans-serif;',
        'body{background:#F8FBFB !important;}',
        '.navbar{background:#FFFFFF;border-bottom:2px solid ' + fp + ' !important;box-shadow:none;}',
        '.card,.product-card,.cat-card,.cat-card-sm{background:#FFFFFF !important;border:1px solid rgba(14,124,134,.16);box-shadow:0 1px 3px rgba(14,124,134,.05);border-radius:14px;}',
        '.hero-body{background:linear-gradient(135deg,#F2F8F9,#E7F3F5) !important;}',
        '.btn-primary,.shader-btn-primary{background:' + fp + ';color:#FFFFFF;border:none;box-shadow:0 2px 8px rgba(14,124,134,.25);border-radius:12px;font-weight:600;}',
        '.shader-badge{background:#E4F2F4;border:1px solid ' + fp + '55;color:' + darken(fp, .15) + ';font-weight:700;letter-spacing:.05em;}',
        '.trust-tile{background:#FFFFFF;border:1px solid rgba(14,124,134,.14);}',
        'h1,h2,h3{color:#0B2529;font-weight:700;letter-spacing:.005em;}',
        '.sm-item{background:#FFFFFF;border:1px solid rgba(14,124,134,.12);}',
        '.particle{display:none !important;}#liquidFoil{display:none;}');
    } else if (style === 'retropop') {
      var rp = p.brand || '#E85D26', rpink = p.ink || '#3A2418', rppaper = p.paper || '#FAF1DE';
      css.push('--paper:' + rppaper + ';--paper-hi:#FFF7E7;--paper-lo:#F0E3C6;',
        '--ink:' + rpink + ';--t-hi:' + rpink + ';--t-mid:#6B4F3C;--t-low:#8A6D55;',
        '--sh-d:rgba(58,36,24,.22);--sh-l:rgba(255,250,235,.85);',
        '--neo-1:3px 4px 0 rgba(58,36,24,.35);',
        '--neo-2:6px 7px 0 rgba(58,36,24,.3);',
        '--neo-in:inset 2px 3px 0 rgba(58,36,24,.12);',
        '--shadow:var(--neo-1);--shadow-xs:2px 3px 0 rgba(58,36,24,.3);--shadow-sm:4px 5px 0 rgba(58,36,24,.3);',
        '--radius:22px;',
        '--font-display:\'Fraunces\',Georgia,serif;',
        'body{background:#FAF1DE !important;}',
        '.navbar{background:#E85D26;border-radius:0 0 24px 24px;box-shadow:0 4px 0 rgba(58,36,24,.25);}',
        '.navbar a,.nav-link{color:#FFF7E7 !important;}',
        '.card,.product-card,.cat-card,.cat-card-sm{background:#FFF7E7 !important;border:2.5px solid #3A2418;box-shadow:var(--neo-1);border-radius:24px;}',
        '.hero-body{background:radial-gradient(circle at 30% 20%,#FFD97A 0%,#FAF1DE 55%) !important;}',
        '.btn-primary,.shader-btn-primary{background:#3A2418;color:#FAF1DE;border:2.5px solid #3A2418;box-shadow:4px 4px 0 #E85D26;border-radius:40px;font-weight:700;}',
        '.shader-badge{background:#E85D26;color:#FFF7E7;border:2px solid #3A2418;border-radius:40px;font-weight:700;}',
        '.trust-tile{background:#FFD97A;border:2.5px solid #3A2418;box-shadow:var(--neo-1);}',
        'h1,h2,h3{font-family:\'Fraunces\',Georgia,serif;color:#3A2418;font-weight:600;}',
        '.particle{display:none !important;}#liquidFoil{display:none;}');
    } else if (style === 'editorial') {
      var eb = p.brand || '#4A5B35', ebink = p.ink || '#1E2218', ebpaper = p.paper || '#F6F4EC';
      css.push('--paper:' + ebpaper + ';--paper-hi:#FBFAF5;--paper-lo:#EAE7DA;',
        '--ink:' + ebink + ';--t-hi:' + ebink + ';--t-mid:#4E5343;--t-low:#6E7462;',
        '--sh-d:rgba(30,34,24,.12);--sh-l:#FBFAF5;',
        '--neo-1:none;',
        '--neo-2:none;',
        '--neo-in:none;',
        '--shadow:none;--shadow-xs:none;--shadow-sm:none;',
        '--radius:4px;',
        '--font-display:\'Playfair Display\',Georgia,serif;',
        'body{background:#F6F4EC !important;}',
        '.navbar{background:#F6F4EC;border-bottom:1.5px solid #1E2218 !important;box-shadow:none;}',
        '.card,.product-card,.cat-card,.cat-card-sm{background:#FBFAF5 !important;border:none;border-top:1.5px solid #1E2218;box-shadow:none;border-radius:0;}',
        '.hero-body{background:#F6F4EC !important;border-bottom:1.5px solid #1E2218;}',
        '.btn-primary,.shader-btn-primary{background:#1E2218;color:#F6F4EC;border:none;border-radius:0;font-weight:500;letter-spacing:.08em;text-transform:uppercase;}',
        '.shader-badge{background:none;border:1.5px solid #1E2218;color:#1E2218;border-radius:0;font-weight:600;letter-spacing:.14em;text-transform:uppercase;}',
        'h1,h2,h3{font-family:\'Playfair Display\',Georgia,serif;color:#1E2218;font-weight:500;font-style:italic;}',
        '.trust-tile{background:none;border:none;border-top:1.5px solid #1E2218;border-radius:0;}',
        '.particle{display:none !important;}#liquidFoil{display:none;}');
    }
    // ── Combination tweaks ────────────────────────────────────────    // ── Combination tweaks ────────────────────────────────────────
    var b = p.brand || '#C0394A';
    if (c.shadows === 'none')    css.push('--neo-1:none;--neo-2:none;--neo-3:none;--neo-4:none;--neo-in:none;--shadow:none;--shadow-xs:none;--shadow-sm:none;');
    else if (c.shadows === 'soft')    css.push('--neo-1:0 1px 4px rgba(0,0,0,.08);--neo-2:0 3px 10px rgba(0,0,0,.09);--neo-in:none;--shadow-xs:0 1px 4px rgba(0,0,0,.08);--shadow-sm:0 3px 10px rgba(0,0,0,.09);');
    else if (c.shadows === 'clay')    css.push('--neo-1:8px 10px 16px rgba(90,80,110,.16), -6px -8px 14px rgba(255,255,255,.85);--neo-2:12px 14px 24px rgba(90,80,110,.18), -9px -11px 20px rgba(255,255,255,.8);--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-1);--radius:var(--r-lg);');
    else if (c.shadows === 'hard')    css.push('--neo-1:5px 5px 0 #111;--neo-2:8px 8px 0 #111;--neo-in:inset 4px 4px 0 rgba(0,0,0,.1);--shadow:var(--neo-1);--shadow-xs:3px 3px 0 #111;--shadow-sm:6px 6px 0 #111;--radius:var(--r-sm);');
    else if (c.shadows === 'layered') css.push('--neo-1:0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.06);--neo-2:0 4px 10px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.08);--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-1);');

    if (c.buttons === 'flat')      css.push('.btn-primary,.shader-btn-primary{box-shadow:none;border:none;border-radius:var(--r-pill);}');
    else if (c.buttons === 'extruded') css.push('.btn-primary,.shader-btn-primary{box-shadow:7px 8px 14px rgba(90,80,110,.18), -5px -6px 12px rgba(255,255,255,.85);}');
    else if (c.buttons === 'outline')  css.push('.btn-primary,.shader-btn-primary{border:2.5px solid #111;box-shadow:4px 4px 0 #111;}');
    else                               css.push('.btn-primary,.shader-btn-primary{box-shadow:0 2px 8px rgba(0,0,0,.15);}');

    if (c.borders === 'none')   css.push('.card,.product-card,.cat-card,.cat-card-sm,.navbar{border:none !important;}');
    else if (c.borders === 'hairline') css.push('.card,.product-card,.cat-card,.cat-card-sm{border:1px solid rgba(0,0,0,.07) !important;}');
    else if (c.borders === 'bold')     css.push('.card,.product-card,.cat-card,.cat-card-sm,.navbar{border:2px solid #111 !important;}');

    if (c.weight === 'light') css.push('h1,h2,h3{font-weight:400;}');
    else if (c.weight === 'bold') css.push('h1,h2,h3{font-weight:800;}');

    if (c.density === 'compact') css.push('.card,.product-card,.cat-card{padding:12px 14px !important;}');
    else if (c.density === 'airy') css.push('.card,.product-card,.cat-card{padding:26px 30px !important;}');

    if (c.bgfx === 'bubbles')   css.push('.particle{display:none !important;}#liquidFoil{display:none;}');
    else if (c.bgfx === 'aurora') css.push('body{background:radial-gradient(900px 500px at 12% -5%, rgba(75,123,229,.35), transparent 55%), radial-gradient(800px 500px at 88% 8%, rgba(155,93,229,.3), transparent 52%), linear-gradient(180deg, #F7F4FC, #EEF2FA);}#liquidFoil{display:none !important;}');
    else if (c.bgfx === 'clean')  css.push('.particle{display:none !important;}#liquidFoil{display:none;}');

    if (c.cardstyle === 'flat')      css.push('.product-card,.cat-card,.cat-card-sm{box-shadow:none;border:1px solid rgba(0,0,0,.07);}');
    else if (c.cardstyle === 'clay') css.push('.product-card,.cat-card,.cat-card-sm{box-shadow:8px 10px 16px rgba(90,80,110,.16), -6px -8px 14px rgba(255,255,255,.85);border-radius:var(--r-lg);}');
    else if (c.cardstyle === 'bento') css.push('.product-card,.cat-card,.cat-card-sm{box-shadow:0 0 0 1px rgba(30,30,36,.06), 0 2px 8px rgba(30,30,36,.06);border-radius:var(--r-md);}');
    else                              css.push('.product-card,.cat-card,.cat-card-sm{box-shadow:var(--neo-1);}');
    // ── v10.4: Design & Layout controls (banner / cards / borders / image shape-fit-position).
    //    Default path emits NO rules — the base storefront styles own the
    //    landscape ratio. Named sizes only change the desktop frame width;
    //    no mode may force a portrait crop or fixed full-screen height.
    const _b = c.banner, _k = c.cards, _cb = c.cardborder, _is = c.imgshape, _if = c.imgfit, _ip = c.imgpos;
    if (_b === 'full') css.push('@media(min-width:821px){.hero-banner{width:min(calc(100% - 32px),1320px);}.hero-banner-slide img{height:auto;min-height:0;aspect-ratio:2688/1152;object-fit:contain !important;}#shopBannerSlot1 img,#shopBannerSlot2 img{height:460px !important;}}');
    else if (_b === 'compact') css.push('@media(min-width:821px){.hero-banner{width:min(calc(100% - 32px),1160px);}.hero-banner-slide img{height:auto;min-height:0;aspect-ratio:2688/1152;object-fit:contain !important;}#shopBannerSlot1 img,#shopBannerSlot2 img{height:240px !important;}}');
    if (_k === 's')      css.push('.products-grid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr)) !important;}.product-card .p-info{font-size:.82rem !important;}');
    else if (_k === 'l') css.push('.products-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr)) !important;}.product-card .p-info{font-size:1rem !important;}.product-card{padding:11px !important;}');
    if (_cb === 'none')   css.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:none !important;box-shadow:none !important;}');
    else if (_cb === 'thin')   css.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:1px solid rgba(0,0,0,.09) !important;}');
    else if (_cb === 'medium') css.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:2.5px solid rgba(0,0,0,.16) !important;}');
    else if (_cb === 'thick')  css.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:4px solid #111 !important;}');
    if (_is === 'rounded') css.push('.p-img-wrap,.p-img-wrap img,.promo-card-media,.promo-card-media img,.blog-img,.blog-img img{border-radius:18px !important;}');
    else if (_is === 'circle') css.push('.p-img-wrap,.p-img-wrap img,.promo-card-media,.promo-card-media img,.blog-img,.blog-img img{border-radius:50% !important;}.p-img-wrap img{aspect-ratio:1/1 !important;object-fit:cover !important;}');
    if (_if === 'contain')  css.push('.hero-banner-slide img,.p-img-wrap img,.shop-banner-slot img,.promo-card-media img,.blog-img img{object-fit:contain !important;}');
    else if (_if === 'center') css.push('.hero-banner-slide img,.p-img-wrap img,.shop-banner-slot img,.promo-card-media img,.blog-img img{object-fit:cover !important;object-position:center !important;}');
    if (_ip === 'top')    css.push('.hero-banner-slide img,.shop-banner-slot img,.p-img-wrap img{object-position:top !important;}');
    else if (_ip === 'bottom') css.push('.hero-banner-slide img,.shop-banner-slot img,.p-img-wrap img{object-position:bottom !important;}');
    else if (_ip === 'center') css.push('.hero-banner-slide img,.shop-banner-slot img,.p-img-wrap img{object-position:center !important;}');


    // v10.3: separate root variable declarations from selector rules and
    // wrap the variables in a :root{} block — bare top-level declarations
    // are invalid CSS and were silently dropped by the browser.
    var vars = [], rules = [];
    for (var i = 0; i < css.length; i++) {
      var entry = css[i].trim();
      if (entry && entry.charAt(0) === '-' && entry.indexOf('{') === -1) vars.push(entry);
      else if (entry.indexOf('{') !== -1) rules.push(entry);
    }
    var out = '';
    if (vars.length) out += ':root{' + vars.join('') + '}';
    if (rules.length) out += rules.join('');
    return out;
  }

  // ── Published content edits (v9.6) ──────────────────────────────
  function esc(v) { return v == null ? '' : String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function applyContent(c) {
    if (!c || typeof c !== 'object') return;
    try {
      var q = function (s) { return document.querySelectorAll(s); };
      // Announcement items
      if (Array.isArray(c.announcement) && c.announcement.length) {
        var wraps = q('.announce .ann-item, .announce-inner > div');
        if (wraps.length) {
          c.announcement.forEach(function (it, i) {
            if (wraps[i] && it && it.text !== undefined) wraps[i].textContent = (it.icon ? it.icon + ' ' : '') + it.text;
          });
        }
      }
      // Hero
      if (c.hero) {
        var badge = q('.shader-badge span:last-child');
        if (badge.length && c.hero.badge !== undefined) badge[0].textContent = c.hero.badge;
        [1, 2, 3].forEach(function (n) {
          var ln = q('.sh-line-' + n);
          if (ln.length && c.hero['line' + n] !== undefined) ln[0].textContent = c.hero['line' + n];
        });
        var sub = q('.shader-sub');
        if (sub.length && c.hero.sub !== undefined) sub[0].textContent = c.hero.sub;
        var cta = q('.shader-btn-primary');
        if (cta.length && c.hero.cta !== undefined) cta[0].textContent = c.hero.cta;
      }
      // Stats
      if (Array.isArray(c.stats) && c.stats.length) {
        var sms = q('.sm-item');
        if (sms.length) c.stats.forEach(function (it, i) {
          if (sms[i] && typeof it === 'object' && it.text !== undefined) {
            var parts = String(it.text).split('|');
            var spans = sms[i].querySelectorAll('span');
            if (spans.length >= 2) { spans[0].textContent = parts[0]; spans[1].textContent = parts[1] || ''; }
          }
        });
      }
      // Trust tiles
      if (c.trust && Array.isArray(c.trust.tiles)) {
        var tiles = q('.trust-tile');
        c.trust.tiles.forEach(function (it, i) {
          if (tiles[i]) {
            var ico = tiles[i].querySelector('.tt-ico');
            var lbl = tiles[i].querySelector('.tt-lbl');
            if (ico && it.icon !== undefined) ico.textContent = it.icon;
            if (lbl && it.label !== undefined) lbl.innerHTML = esc(it.label);
          }
        });
      }
      // Vita points promo
      if (c.vitaMicro) {
        var ve = document.getElementById('vitaMicroEarn'), vv = document.getElementById('vitaMicroValue');
        if (ve && c.vitaMicro.earnText !== undefined) ve.textContent = c.vitaMicro.earnText;
        if (vv && c.vitaMicro.valueText !== undefined) vv.textContent = c.vitaMicro.valueText;
      }
      // Offer reminder
      if (c.offerReminder) {
        var ort = q('.offer-reminder .or-title');
        if (ort.length && c.offerReminder.title !== undefined) ort[0].textContent = c.offerReminder.title;
        var oro = q('.offer-reminder .or-offer');
        if (oro.length && c.offerReminder.offerHtml !== undefined) oro[0].innerHTML = esc(c.offerReminder.offerHtml);
        var orc = q('.offer-reminder .or-cta, .offer-reminder .btn');
        if (orc.length && c.offerReminder.cta !== undefined) orc[0].textContent = c.offerReminder.cta;
      }
    } catch (_) {}
  }

  function loadContent() {
    try {
      var cached = null;
      try {
        var raw = localStorage.getItem('ozylix_content_cache');
        if (raw) {
          var obj = JSON.parse(raw);
          if (Date.now() - obj.at < CONTENT_CACHE_MS) cached = obj.content;
        }
      } catch (_) {}
      if (cached && Object.keys(cached).length) applyContent(cached);

      fetch(CONTENT_API + '?key=' + CONTENT_KEY)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (d && d.ok && d.content && Object.keys(d.content).length) {
            try { localStorage.setItem('ozylix_content_cache', JSON.stringify({ at: Date.now(), content: d.content })); } catch (_) {}
            applyContent(d.content);
          }
        })
        .catch(function () {});
    } catch (_) {}
  }

  // ── Design-system CSS pass (style + combos) ────────────────────
  function applyStyleCss() {
    try {
      var isPreview = /[?&]preview=1/.test(location.search);
      var theme = null;
      if (isPreview) {
        try { theme = JSON.parse(localStorage.getItem('ozylix_theme') || 'null'); } catch (_) {}
      }
      if (!theme) {
        try {
          var raw = localStorage.getItem('ozylix_theme_cache');
          if (raw) {
            var obj = JSON.parse(raw);
            if (Date.now() - obj.at < CONTENT_CACHE_MS) theme = obj.theme;
          }
        } catch (_) {}
      }
      if (!theme) return;
      var extra = buildStyleCss(theme);
      if (!extra) return;
      // Write to a dedicated style element so the theme loader's fetch
      // refresh (which overwrites #live-theme entirely) never erases it.
      var el = document.getElementById('live-theme-v10');
      if (!el) {
        el = document.createElement('style');
        el.id = 'live-theme-v10';
        var base = document.getElementById('live-theme');
        if (base && base.nextSibling) base.parentNode.insertBefore(el, base.nextSibling);
        else document.head.appendChild(el);
      }
      el.textContent = extra;
    } catch (_) {}
  }

  // Re-apply the style layer after the theme loader's background fetch
  // completes (it replaces #live-theme wholesale).
  var __v10applied = false;
  function applyStyleCssAfterDelay() {
    if (__v10applied) return;
    setTimeout(function () {
      applyStyleCss();
      __v10applied = true;
    }, 2500);
  }

  applyStyleCssAfterDelay();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { applyStyleCss(); applyStyleCssAfterDelay(); loadContent(); });
  else { applyStyleCss(); applyStyleCssAfterDelay(); loadContent(); }
})();
