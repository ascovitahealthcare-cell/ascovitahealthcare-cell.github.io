// ═══════════════════════════════════════════════════════════════
// ASCOVITA — PRODUCT IMAGES
// ═══════════════════════════════════════════════════════════════
// HOW TO USE:
//   1. Upload your product images to your server / hosting
//   2. Find the product below by its id and name
//   3. Fill in the `images` array — add as many URLs as you have
//      (up to 6). The first is the main card image.
//   4. Save this file — index.html picks up changes automatically.
//
// Leave images: [] if no images yet — a placeholder will show.
// ═══════════════════════════════════════════════════════════════

const PRODUCT_IMAGES = {

  // ─── id: 8 — Multidiata – Ascovita Premium Multivitamin ───
  8: { images: [
    "images/multidiata-1.jpg",
  ]},

  // ─── id: 1 — L-Glutathione Effervescent – Orange Flavour ───
  1: { images: [
    "images/glutathione-1.jpg",   // main — shown on product card
    "images/glutathione-2.jpg",
    "images/glutathione-3.jpg",
    "images/glutathione-4.jpg",
    "images/glutathione-5.jpg",
    "images/glutathione-6.jpg",
  ]},

  // ─── id: 2 — Apple Cider Vinegar + Moringa – Green Apple Flavour ───
  2: { images: [
    "images/acv-moringa-1.jpg",
  ]},

  // ─── id: 3 — L-Carnitine Effervescent – Orange Flavour ───
  3: { images: [
    // "images/lcarnitine-1.jpg",
  ]},

  // ─── id: 4 — B12 + Biotin Effervescent – Guava Flavour ───
  4: { images: [
    // "images/biotin-b12-1.jpg",
  ]},

  // ─── id: 5 — Vitamin C Effervescent – Orange Flavour ───
  5: { images: [
    // "images/vitaminc-1.jpg",
  ]},

  // ─── id: 10 — VitaPlus B12 + D3 Vegan – with Certified Organic Spirulina ───
  10: { images: [
    // "images/vitaplus-1.jpg",
  ]},

  // ─── id: 11 — MG+++ Magnesium – B12 + D3 with Magnesium ───
  11: { images: [
    // "images/mg-1.jpg",
  ]},

  // ─── id: 12 — CS++ + Iron++ – Calcium + Iron with B12+D3 ───
  12: { images: [
    // "images/calcium-iron-1.jpg",
  ]},

  // ─── id: 20 — Moringa Tablets ───
  20: { images: [
    "images/moringa-1.jpg",
  ]},

  // ─── id: 22 — Power Pro Tablets ───
  22: { images: [
    // "images/powerpro-1.jpg",
  ]},

};

// ── Auto-inject images into PRODUCTS array ──
// Runs after DOM is ready. Supports full gallery (up to 6 images per product).
document.addEventListener('DOMContentLoaded', function () {
  if (typeof PRODUCTS === 'undefined') return;
  PRODUCTS.forEach(function (p) {
    var entry = PRODUCT_IMAGES[p.id];
    if (!entry || !entry.images || !entry.images.length) return;
    var urls = entry.images.filter(Boolean);
    if (!urls.length) return;

    // Flat fields (back-compat with product card + detail page)
    p.image  = urls[0] || '';
    p.image2 = urls[1] || '';
    p.image3 = urls[2] || '';
    p.image4 = urls[3] || '';
    p.image5 = urls[4] || '';
    p.image6 = urls[5] || '';

    // Full media array — drives the gallery carousel & lightbox
    p.media = urls.map(function (u) {
      return { url: u, type: 'image', thumb: u };
    });
    p.allImages = urls;
  });
});
