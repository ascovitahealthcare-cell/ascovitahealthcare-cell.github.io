window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PSRK3R6L0Z', {
    send_page_view: true,
    page_title: 'Ascovita Healthcare',
    page_location: window.location.href,
  });

  const _GA = 'G-PSRK3R6L0Z';
  const _gtag = (...args) => { if(typeof gtag === 'function') gtag(...args); };

  // ── PAGE VIEW (called from showPage) ──
  window._trackPage = function(pageName) {
    _gtag('event', 'page_view', {
      page_title:    'Ascovita – ' + (pageName.charAt(0).toUpperCase() + pageName.slice(1)),
      page_location: window.location.origin + (pageName !== 'home' ? '/#' + pageName : '/'),
      page_path:     pageName !== 'home' ? '/#' + pageName : '/',
    });
  };

  // ── PRODUCT VIEW (call when product detail page opens) ──
  window._trackViewItem = function(product) {
    if (!product) return;
    _gtag('event', 'view_item', {
      currency: 'INR',
      value:    product.salePrice || product.price || 0,
      items: [{
        item_id:       String(product.id),
        item_name:     product.name || '',
        item_category: product.category || '',
        item_brand:    product.brand || 'Ascovita',
        price:         product.salePrice || product.price || 0,
        quantity:      1,
      }],
    });
  };

  // ── ADD TO CART ──
  window._trackAddToCart = function(product, qty) {
    if (!product) return;
    _gtag('event', 'add_to_cart', {
      currency: 'INR',
      value:    (product.salePrice || product.price || 0) * (qty || 1),
      items: [{
        item_id:       String(product.id),
        item_name:     product.name || '',
        item_category: product.category || '',
        item_brand:    product.brand || 'Ascovita',
        price:         product.salePrice || product.price || 0,
        quantity:      qty || 1,
      }],
    });
  };

  // ── VIEW CART ──
  window._trackViewCart = function(cartItems, total) {
    _gtag('event', 'view_cart', {
      currency: 'INR',
      value:    total || 0,
      items:    (cartItems || []).map(i => ({
        item_id:   String(i.id),
        item_name: i.name || '',
        price:     i.price || 0,
        quantity:  i.qty || 1,
      })),
    });
  };

  // ── BEGIN CHECKOUT ──
  window._trackBeginCheckout = function(cartItems, total) {
    _gtag('event', 'begin_checkout', {
      currency: 'INR',
      value:    total || 0,
      items:    (cartItems || []).map(i => ({
        item_id:   String(i.id),
        item_name: i.name || '',
        price:     i.price || 0,
        quantity:  i.qty || 1,
      })),
    });
  };

  // ── PURCHASE ──
  window._trackPurchase = function(orderId, total, items) {
    _gtag('event', 'purchase', {
      transaction_id: orderId,
      value:          total,
      currency:       'INR',
      items:          (items || []).map(i => ({
        item_id:   i.sku || String(i.id || ''),
        item_name: i.name || '',
        price:     i.selling_price || i.price || 0,
        quantity:  i.units || i.qty || 1,
      })),
    });
  };

  // ── SEARCH ──
  window._trackSearch = function(searchTerm) {
    _gtag('event', 'search', { search_term: searchTerm });
  };

  // ── COUPON APPLIED ──
  window._trackCoupon = function(couponCode, discount) {
    _gtag('event', 'select_promotion', {
      promotion_name: couponCode,
      discount:       discount || 0,
    });
  };
