/**
 * TRACKING.js — Ozylix
 * ─────────────────────────────────────────────────────────────────
 * Extracted from index.html inline scripts (19 Aug 2026, Manus SEO pass).
 * GA4 (G-1SPY139WS1) + Meta Pixel (1031030359902418) + Google Identity
 * Services (bot-gated). The heavy fbevents.js bundle still loads after the
 * LCP window so it never fights banner/product images on first paint.
 */
(function () {
  // ── GA4 ──
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-1SPY139WS1');
  var _gtag = function () {
    var args = Array.prototype.slice.call(arguments);
    if (typeof gtag === 'function') gtag.apply(null, args);
  };

  // ── META PIXEL ──
  window.META_PIXEL_ID = '1031030359902418';
  if (window.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      var __loadFb = function () {
        if (f._fbLoaded) return; f._fbLoaded = !0;
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
        t.onload = function () { fbq('init', window.META_PIXEL_ID); fbq('track', 'PageView'); };
      };
      if (window.requestIdleCallback) { requestIdleCallback(__loadFb, { timeout: 2500 }); }
      else { window.addEventListener('load', function () { setTimeout(__loadFb, 1500); }); }
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    if (window.META_PIXEL_ID && !window._fbq) { fbq('init', window.META_PIXEL_ID); fbq('track', 'PageView'); }
    document.write('<noscript><img height="1" width="1" style="display:none" ' +
      'src="https://www.facebook.com/tr?id=' + encodeURIComponent(window.META_PIXEL_ID) +
      '&ev=PageView&noscript=1" alt=""></noscript>');
  }

  // ── GOOGLE IDENTITY SERVICES (bot-gated) ──
  var ua = navigator.userAgent || '';
  var isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|crawler|spider|headlesschrome|bot\b/i.test(ua);
  if (!isBot) {
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = function () { window.onGoogleLibraryLoad && window.onGoogleLibraryLoad(); };
    document.head.appendChild(s);
  }

  // ── E-COMMERCE / ENGAGEMENT HELPERS ──
  // PAGE VIEW — called from showPage (SPA navigation). Reads the REAL URL
  // rather than rebuilding a hash-routed one; GA4's Pages report used to
  // list '/#shop' while Search Console and every real link said '/shop'.
  window._trackPage = function (pageName) {
    _gtag('event', 'page_view', {
      page_title:    'Ozylix – ' + (pageName.charAt(0).toUpperCase() + pageName.slice(1)),
      page_location: window.location.href,
      page_path:     window.location.pathname + window.location.search,
    });
  };

  window._trackViewItem = function (product) {
    if (!product) return;
    _gtag('event', 'view_item', {
      currency: 'INR',
      value:    product.salePrice || product.price || 0,
      items: [{
        item_id:       String(product.id),
        item_name:     product.name || '',
        item_category: product.category || '',
        item_brand:    product.brand || 'Ozylix',
        price:         product.salePrice || product.price || 0,
        quantity:      1,
      }],
    });
    if (typeof fbq === 'function') fbq('track', 'ViewContent', {
      content_ids: [String(product.id)],
      content_name: product.name || '',
      content_category: product.category || '',
      content_type: 'product',
      value: product.salePrice || product.price || 0,
      currency: 'INR',
    });
  };

  window._trackAddToCart = function (product, qty) {
    if (!product) return;
    _gtag('event', 'add_to_cart', {
      currency: 'INR',
      value:    (product.salePrice || product.price || 0) * (qty || 1),
      items: [{
        item_id:       String(product.id),
        item_name:     product.name || '',
        item_category: product.category || '',
        item_brand:    product.brand || 'Ozylix',
        price:         product.salePrice || product.price || 0,
        quantity:      qty || 1,
      }],
    });
    if (typeof fbq === 'function') fbq('track', 'AddToCart', {
      content_ids: [String(product.id)],
      content_name: product.name || '',
      content_type: 'product',
      value: (product.salePrice || product.price || 0) * (qty || 1),
      currency: 'INR',
    });
  };

  window._trackViewCart = function (cartItems, total) {
    _gtag('event', 'view_cart', {
      currency: 'INR',
      value:    total || 0,
      items:    (cartItems || []).map(function (i) {
        return { item_id: String(i.id), item_name: i.name || '', price: i.price || 0, quantity: i.qty || 1 };
      }),
    });
  };

  window._trackBeginCheckout = function (cartItems, total) {
    _gtag('event', 'begin_checkout', {
      currency: 'INR',
      value:    total || 0,
      items:    (cartItems || []).map(function (i) {
        return { item_id: String(i.id), item_name: i.name || '', price: i.price || 0, quantity: i.qty || 1 };
      }),
    });
    if (typeof fbq === 'function') fbq('track', 'InitiateCheckout', {
      content_ids: (cartItems || []).map(function (i) { return String(i.id); }),
      content_type: 'product',
      num_items: (cartItems || []).reduce(function (n, i) { return n + (i.qty || 1); }, 0),
      value: total || 0,
      currency: 'INR',
    });
  };

  window._trackPurchase = function (orderId, total, items) {
    _gtag('event', 'purchase', {
      transaction_id: orderId,
      value:          total,
      currency:       'INR',
      items:          (items || []).map(function (i) {
        return { item_id: i.sku || String(i.id || ''), item_name: i.name || '', price: i.selling_price || i.price || 0, quantity: i.units || i.qty || 1 };
      }),
    });
    if (typeof fbq === 'function') fbq('track', 'Purchase', {
      content_ids: (items || []).map(function (i) { return i.sku || String(i.id || ''); }),
      content_type: 'product',
      value: total,
      currency: 'INR',
    }, { eventID: String(orderId) }); // eventID enables dedup if you later add server-side Conversions API for the same order
  };

  window._trackSearch = function (searchTerm) {
    _gtag('event', 'search', { search_term: searchTerm });
    if (typeof fbq === 'function') fbq('track', 'Search', { search_string: searchTerm });
  };

  window._trackCoupon = function (couponCode, discount) {
    _gtag('event', 'select_promotion', {
      promotion_name: couponCode,
      discount:       discount || 0,
    });
  };
})();
