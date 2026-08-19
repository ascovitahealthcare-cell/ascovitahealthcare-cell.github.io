// Extracted from index.html (line 13388) by Manus SEO pass — load order preserved

// ============================================================
// ASCOVITA — PRODUCT IMAGES
// Using direct Wix CDN URLs — no local image upload needed
// ============================================================

const PRODUCT_IMAGES = {

  // —— id: 1 — L-Glutathione Effervescent – Orange Flavour ——
  1: { images: [
    "",
    "",
    "",
    "",
    "",
    "",
  ]},

  // —— id: 2 — Apple Cider Vinegar + Moringa – Green Apple Flavour ——
  2: { images: [
    "",
    "",
    "",
    "",
    "",
  ]},

  // —— id: 3 — L-Carnitine Effervescent – Orange Flavour ——
  3: { images: [
    "",
  ]},

  // —— id: 4 — B12 + Biotin Effervescent – Guava Flavour ——
  4: { images: [
    "",
  ]},

  // —— id: 5 — Vitamin C Effervescent – Orange Flavour ——
  5: { images: [
    "",
  ]},

  // —— id: 8 — Multidiata – Ozylix Premium Multivitamin ——
  8: { images: [
    "",
  ]},

  // —— id: 10 — VitaPlus B12 + D3 Vegan – with Certified Organic Spirulina ——
  // FIX: was keyed as "6" (wrong) — product id is 10. Caused VitaPlus to show
  //      a generic fallback image instead of its real product photo.
  10: { images: [
    "",
  ]},

  // —— id: 11 — MG+++ Magnesium – B12 + D3 with Magnesium ——
  11: { images: [
    "",
  ]},

  // —— id: 12 — CS++ + Iron++ – Calcium + Iron with B12+D3 ——
  12: { images: [
    "",
  ]},

  // —— id: 20 — Moringa Tablets ——
  20: { images: [
    "",
  ]},

  // —— id: 22 — Power Pro Tablets ——
  22: { images: [] },

};

// ================================================================
// RESPONSIVE IMAGE HELPER
// Wix media URLs embed their own resize params (w_XXX,h_XXX). Swapping
// that segment gives us a smaller variant of the same image for free —
// no extra uploads, no extra CDN. Used to serve small thumbnails to
// grid/cart/related-product cards instead of the full 600-1100px asset.
// ================================================================
function wixResize(url, size) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/w_\d+,h_\d+/, 'w_' + size + ',h_' + size);
}

// ================================================================
// AUTO-APPLY IMAGES TO PRODUCTS ARRAY
// This runs after PRODUCTS is defined and injects the real images
// ================================================================
(function applyProductImages() {
  if (typeof PRODUCTS === 'undefined') {
    // Retry after a short delay if PRODUCTS not ready yet
    setTimeout(applyProductImages, 100);
    return;
  }

  PRODUCTS.forEach(function(p) {
    var imgData = PRODUCT_IMAGES[p.id];
    if (!imgData || !imgData.images || !imgData.images.length) return;

    var imgs = imgData.images;

    // Set primary image (full size — product page / lightbox)
    p.image  = imgs[0] || p.image;
    p.image2 = imgs[1] || '';
    p.image3 = imgs[2] || '';
    p.image4 = imgs[3] || '';
    p.image5 = imgs[4] || '';

    // Set allImages array for gallery
    p.allImages = imgs;

    // Build media array for the 10-image gallery system.
    // thumb is now a real small variant (300px) instead of the full image,
    // so the gallery thumbnail strip doesn't download full-res images 5x over.
    p.media = imgs.map(function(url) {
      return { url: url, type: 'image', thumb: wixResize(url, 300) };
    });

    // NEW — small (400px) variant for product-card grids, cart rows,
    // related/upsell tiles. These never need the full 600-1100px asset.
    p.thumb400 = wixResize(imgs[0] || p.image || '', 400);
  });

  console.log('[Ozylix] ✅ Product images applied from PRODUCT_IMAGES map');

  // Write the structured data from whatever we know locally, without waiting
  // for the backend. syncProductStructuredData() was only called at the end
  // of the backend merge, so a slow or sleeping API — the Render free tier
  // cold-starts in about a minute — meant Googlebot snapshotted the page
  // before any of it ran, and read the hand-written static block instead.
  // The backend merge calls it again afterwards with live stock and prices.
  if (typeof syncProductStructuredData === 'function') {
    try { syncProductStructuredData(); } catch (e) { /* never block render */ }
  }
})();

// Export for Node.js / bundlers
if (typeof module !== "undefined") module.exports = { PRODUCT_IMAGES: PRODUCT_IMAGES, wixResize: wixResize };

