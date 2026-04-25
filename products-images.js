// ═══════════════════════════════════════════════════════════════
// ASCOVITA — PRODUCT IMAGES
// Using direct Wix CDN URLs — no local image upload needed
// ═══════════════════════════════════════════════════════════════

const PRODUCT_IMAGES = {

  // ─── id: 1 — L-Glutathione Effervescent – Orange Flavour ───
  1: { images: [
    "https://static.wixstatic.com/media/f0adaf_0632dc96f8db425a9211154fc0a7ab6f~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/f0adaf_0632dc96f8db425a9211154fc0a7ab6f~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_1941bb90b67c4695adff8322175ac85c~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/f0adaf_1941bb90b67c4695adff8322175ac85c~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_f25a6346e3d04ee0ac0492c96829c529~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/f0adaf_f25a6346e3d04ee0ac0492c96829c529~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_277f592f7a2142158bdcfb21fa3e80fb~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/f0adaf_277f592f7a2142158bdcfb21fa3e80fb~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_749e86ddaf3046c7a7db6f606f29bb6f~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/f0adaf_749e86ddaf3046c7a7db6f606f29bb6f~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_9fc587da25294e7aac43a3eb6623cf27~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/f0adaf_9fc587da25294e7aac43a3eb6623cf27~mv2.jpg",
  ]},

  // ─── id: 2 — Apple Cider Vinegar + Moringa – Green Apple Flavour ───
  2: { images: [
    "https://static.wixstatic.com/media/f0adaf_1d97e722692a46cbb7e6701d688bdcda~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_1d97e722692a46cbb7e6701d688bdcda~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_a308af1a323b420d90910c096785fc75~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_a308af1a323b420d90910c096785fc75~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_0bf6f30975d547b9a7be2475c4bb8e60~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_0bf6f30975d547b9a7be2475c4bb8e60~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_54343dffc0d84c69972d96ce14c03645~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_54343dffc0d84c69972d96ce14c03645~mv2.jpg",
    "https://static.wixstatic.com/media/f0adaf_4f5f2853306542f4959d266a863e53c0~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_4f5f2853306542f4959d266a863e53c0~mv2.jpg",
  ]},

  // ─── id: 3 — L-Carnitine Effervescent – Orange Flavour ───
  3: { images: [] },

  // ─── id: 4 — B12 + Biotin Effervescent – Guava Flavour ───
  4: { images: [] },

  // ─── id: 5 — Vitamin C Effervescent – Orange Flavour ───
  5: { images: [] },

  // ─── id: 8 — Multidiata – Ascovita Premium Multivitamin ───
  8: { images: [
    "https://static.wixstatic.com/media/f0adaf_389d6b29ad5446bb81ad305de9756f17~mv2.jpg/v1/fill/w_1100,h_1100,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_389d6b29ad5446bb81ad305de9756f17~mv2.jpg",
  ]},

  // ─── id: 10 — VitaPlus B12 + D3 Vegan ───
  10: { images: [
    "https://static.wixstatic.com/media/f0adaf_902199f4d8c74178a5be5b997e4a2e4d~mv2.jpg/v1/fill/w_1570,h_1570,al_c,q_85,usm_0.66_1.00_0.01/f0adaf_902199f4d8c74178a5be5b997e4a2e4d~mv2.jpg",
  ]},

  // ─── id: 11 — MG+++ Magnesium ───
  11: { images: [] },

  // ─── id: 12 — CS++ + Iron++ ───
  12: { images: [
    "https://static.wixstatic.com/media/f0adaf_47e299a3e58344099976ed645c39442e~mv2.jpg/v1/fill/w_1100,h_1100,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_47e299a3e58344099976ed645c39442e~mv2.jpg",
  ]},

  // ─── id: 20 — Moringa Tablets ───
  20: { images: [
    "https://static.wixstatic.com/media/f0adaf_e51841f203d548248c371d2e4f93dbf0~mv2.jpg/v1/fill/w_1100,h_1100,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_e51841f203d548248c371d2e4f93dbf0~mv2.jpg",
  ]},

  // ─── id: 22 — Power Pro Tablets ───
  22: { images: [] },

};

// ── Auto-inject images into PRODUCTS array ──
(function injectProductImages() {
  if (typeof PRODUCTS === 'undefined') return;
  PRODUCTS.forEach(function (p) {
    var entry = PRODUCT_IMAGES[p.id];
    if (!entry || !entry.images || !entry.images.length) return;
    var urls = entry.images.filter(Boolean);
    if (!urls.length) return;
    p.image  = urls[0] || '';
    p.image2 = urls[1] || '';
    p.image3 = urls[2] || '';
    p.image4 = urls[3] || '';
    p.image5 = urls[4] || '';
    p.image6 = urls[5] || '';
    p.media = urls.map(function (u) {
      return { url: u, type: 'image', thumb: u };
    });
    p.allImages = urls;
  });
})();
