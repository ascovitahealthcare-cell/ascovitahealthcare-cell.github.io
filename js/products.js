// ═══════════════════════════════════════════════════════
// WHATSAPP INTEGRATION — +91 98985 82650
// ═══════════════════════════════════════════════════════
const WA_NUMBER = '919898582650';

function openWhatsApp(msg) {
  const encoded = encodeURIComponent(msg || 'Hello! I have a question about Ascovita.');
  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encoded, '_blank');
}

function toggleWAPopup() {
  const popup = document.getElementById('waChatPopup');
  if (popup) popup.classList.toggle('open');
}

// Auto-show WA popup after 45 seconds on first visit
setTimeout(() => {
  if (!sessionStorage.getItem('wa_shown')) {
    const popup = document.getElementById('waChatPopup');
    if (popup) popup.classList.add('open');
    sessionStorage.setItem('wa_shown', '1');
  }
}, 45000);

// B2B Enquiry form → opens WhatsApp with pre-filled message
function submitB2BEnquiry() {
  const company = document.getElementById('b2bCompany')?.value.trim() || '';
  const name    = document.getElementById('b2bName')?.value.trim() || '';
  const phone   = document.getElementById('b2bPhone')?.value.trim() || '';
  const email   = document.getElementById('b2bEmail')?.value.trim() || '';
  const type    = document.getElementById('b2bType')?.value || '';
  const msg     = document.getElementById('b2bMsg')?.value.trim() || '';

  if (!name || !phone) {
    showToast('Please enter your name and phone number.'); return;
  }

  const waMsg = `Hello Ascovita! 🌿 B2B Enquiry\n\n` +
    `Company: ${company || 'N/A'}\n` +
    `Contact: ${name}\n` +
    `Phone: ${phone}\n` +
    `Email: ${email || 'N/A'}\n` +
    `Partnership Type: ${type || 'General'}\n\n` +
    `Requirements:\n${msg || 'Please share details about your B2B programme.'}`;

  openWhatsApp(waMsg);
  showToast('Opening WhatsApp with your enquiry! ');
}

// ═══════════════════════════════════════════════════════
// ASCOVITA STORE — PRODUCT DATA & ENGINE
// ═══════════════════════════════════════════════════════

function makeSignal(ms) {
  var ctrl = new AbortController();
  var tid = setTimeout(function() { ctrl.abort(new DOMException('Timeout','TimeoutError')); }, ms);
  ctrl.signal.addEventListener('abort', function() { clearTimeout(tid); }, {once:true});
  return ctrl.signal;
}

// ══════════════════════════════════════════════════════════════
// ✅ FIX 1: CORRECT API BASE URL
// Use the URL from your server.js keep-alive config
// ══════════════════════════════════════════════════════════════
const API_BASE = 'https://ascovita-backend.onrender.com';

// ══════════════════════════════════════════════════════════════
// ✅ FIX 2: PLACEHOLDER IMAGE — shown while backend loads
// ══════════════════════════════════════════════════════════════
const PLACEHOLDER_IMG = 'https://placehold.co/400x400/EAF2E0/2D5016?text=Loading...';
const ERROR_IMG = 'https://placehold.co/400x400/EAF2E0/2D5016?text=Ascovita';

// Merge backend product data over static product array — ALL fields synced
function mergeBackendProducts(backendProducts) {
  if (!backendProducts || !backendProducts.length) return;

  const parseArr = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') { try { return JSON.parse(val); } catch(e) { return val.split(',').map(s=>s.trim()).filter(Boolean); } }
    return [];
  };

  backendProducts.forEach(bp => {
    // ✅ FIX 3: Support both integer and string IDs from Supabase
    const bpId = parseInt(bp.id);
    const idx = PRODUCTS.findIndex(p => p.id === bpId);

    if (idx >= 0) {
      const p = PRODUCTS[idx];
      // Price & sale
      if (bp.price      != null) p.price     = parseFloat(bp.price);
      p.salePrice = bp.sale_price ? parseFloat(bp.sale_price) : null;
      // Stock & visibility
      if (bp.stock      != null) p.stock     = parseInt(bp.stock);
      if (bp.active     != null) p.active    = bp.active;
      if (bp.active === false)   p._hidden   = true; else p._hidden = false;
      // Text fields
      if (bp.name)        p.name        = bp.name;
      if (bp.brand)       p.brand       = bp.brand;
      if (bp.description) p.description = bp.description;
      if (bp.badge)       p.badge       = bp.badge;
      if (bp.offer_text !== undefined) p.offer = bp.offer_text || null;
      else if (bp.offer !== undefined)  p.offer = bp.offer || null;
      if (bp.category)    p.category    = bp.category;
      if (bp.how_to_use)  p.howToUse    = bp.how_to_use;
      // Rating
      if (bp.rating != null) p.rating   = parseFloat(bp.rating);
      if (bp.reviews != null) p.reviews = parseInt(bp.reviews);
      // Tags
      if (bp.tags) p.tags = parseArr(bp.tags);
      // ✅ FIX 4: Images — support all image fields from backend
      const mediaArr = parseArr(bp.media || bp.images);
      if (mediaArr.length) {
        p.media = mediaArr.slice(0, 10);
        p.image  = (mediaArr[0] && mediaArr[0].url) || mediaArr[0] || p.image;
        p.image2 = (mediaArr[1] && mediaArr[1].url) || mediaArr[1] || '';
        p.allImages = mediaArr.map(m => m.url || m).filter(Boolean);
      } else {
        // Use individual image fields from backend
        if (bp.image)  p.image  = bp.image;
        if (bp.image2) p.image2 = bp.image2;
        if (bp.image3) p.image3 = bp.image3;
        if (bp.image4) p.image4 = bp.image4;
        if (bp.image5) p.image5 = bp.image5;
        const legacyUrls = [bp.image,bp.image2,bp.image3,bp.image4,bp.image5].filter(Boolean);
        if (legacyUrls.length) {
          p.media = legacyUrls.map(u=>({url:u,type:'image',thumb:u}));
          p.allImages = legacyUrls;
        }
      }
      // Key Ingredients
      const ki = parseArr(bp.key_ingredients);
      if (ki.length) p.keyIngredients = ki;
      // SEO
      if (bp.seo_keywords) p.seoKeywords = parseArr(bp.seo_keywords);
      if (bp.meta_description) p.metaDescription = bp.meta_description;
      // Tiers flag
      if (bp.has_tiers != null) p.hasTiers = bp.has_tiers;
      if (bp.tiers) {
        try {
          const parsed = Array.isArray(bp.tiers) ? bp.tiers : JSON.parse(bp.tiers);
          if (Array.isArray(parsed) && parsed.length && parsed[0].rate != null) {
            p._backendTiers = parsed;
          }
        } catch(e) { console.warn('Tiers parse error for product', bp.id, e); }
      }
    } else if (bp.active !== false) {
      // ✅ FIX 5: NEW product from backoffice — add to store immediately
      const imgs = parseArr(bp.images);
      const ki   = parseArr(bp.key_ingredients);
      // Build media from all available image fields
      const allImgUrls = [
        bp.image, bp.image2, bp.image3, bp.image4, bp.image5,
        ...imgs
      ].filter(Boolean);
      const uniqueImgs = [...new Set(allImgUrls)];

      PRODUCTS.push({
        id:          parseInt(bp.id),
        name:        bp.name || 'New Product',
        brand:       bp.brand || 'Ascovita',
        category:    bp.category || 'effervescent',
        tags:        parseArr(bp.tags).length ? parseArr(bp.tags) : [],
        price:       bp.price != null ? parseFloat(bp.price) : null,
        salePrice:   bp.sale_price ? parseFloat(bp.sale_price) : null,
        offer:       bp.offer_text || bp.offer || null,
        media:       uniqueImgs.length
          ? uniqueImgs.slice(0,10).map(u=>({url:u,type:'image',thumb:u}))
          : [],
        image:       uniqueImgs[0] || '',
        image2:      uniqueImgs[1] || '',
        image3:      uniqueImgs[2] || '',
        image4:      uniqueImgs[3] || '',
        image5:      uniqueImgs[4] || '',
        allImages:   uniqueImgs,
        rating:      parseFloat(bp.rating) || 4.5,
        reviews:     parseInt(bp.reviews) || 0,
        stock:       parseInt(bp.stock) || 100,
        badge:       bp.badge || '',
        description: bp.description || '',
        keyIngredients: ki,
        howToUse:    bp.how_to_use || '',
        hasTiers:    bp.has_tiers || false,
        _backendTiers: (() => {
          try {
            const t = Array.isArray(bp.tiers) ? bp.tiers : JSON.parse(bp.tiers||'null');
            return (Array.isArray(t) && t.length && t[0].rate != null) ? t : null;
          } catch(e) { return null; }
        })(),
        seoKeywords: parseArr(bp.seo_keywords),
        active:      true,
        _hidden:     false,
        _fromBackend: true, // ✅ flag so we know this came live from backoffice
      });
    }
  });
}

// Live coupon validation against backend
async function validateCouponWithBackend(code, subtotal) {
  try {
    const r = await fetch(`${API_BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({code, subtotal}),
      signal: makeSignal(5000)
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.valid ? d : null;
  } catch(e) { return null; }
}

// ══════════════════════════════════════════════════════════════
// ✅ FIX 6: IMPROVED syncProductsFromBackend
// - Correct URL
// - Shows loading state
// - Re-renders ALL grids including new products
// ══════════════════════════════════════════════════════════════
async function syncProductsFromBackend() {
  // Step 1: Wake ping
  var serverAwake = false;
  try {
    var wakeResp = await fetch(API_BASE + '/health', {
      method: 'GET', mode: 'cors', cache: 'no-store'
    });
    serverAwake = wakeResp.ok;
  } catch(e) { /* cold-starting — expected */ }

  if (!serverAwake) {
    console.log('[Ascovita] Server waking up — waiting 15s before product sync…');
    await new Promise(function(r) { setTimeout(r, 15000); });
  }

  // Step 2: Fetch products — up to 3 attempts
  var DELAYS = [0, 8000, 10000];
  for (var attempt = 0; attempt < 3; attempt++) {
    if (DELAYS[attempt] > 0) {
      await new Promise(function(r) { setTimeout(r, DELAYS[attempt]); });
    }
    try {
      var r = await fetch(API_BASE + '/api/products?_t=' + Date.now(), {
        method: 'GET', mode: 'cors', cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      if (!r.ok) {
        console.warn('[Ascovita] ⚠️ Sync attempt ' + (attempt+1) + ' — HTTP ' + r.status);
        continue;
      }

      var data = await r.json();
      var products = data.data || data;
      if (!Array.isArray(products) || !products.length) {
        console.warn('[Ascovita] ⚠️ Sync attempt ' + (attempt+1) + ' — empty list');
        continue;
      }

      mergeBackendProducts(products);

      // ✅ Re-render ALL grids after merge
      try { renderFeatured(); } catch(e){}
      try { renderNewArrivals(); } catch(e){}
      try { if (document.getElementById('shopGrid')) renderShopGrid(); } catch(e){}
      try { updateAllProductCards(); } catch(e){}
      try {
        var prodPage = document.getElementById('page-product');
        if (prodPage && prodPage.style.display !== 'none' && window._currentProductId) {
          var cp = PRODUCTS.find(function(p){ return p.id === window._currentProductId; });
          if (cp) buildProductPage(cp);
        }
      } catch(e) {}
      try { pushLocalTiersToBackend(products); } catch(e) {}
      console.log('[Ascovita] ✅ Backend sync OK — ' + products.length + ' products loaded');
      return;

    } catch(e) {
      console.warn('[Ascovita] ⚠️ Sync attempt ' + (attempt+1) + ' failed: ' + e.message);
    }
  }
  console.warn('[Ascovita] ⚠️ Sync gave up after 3 attempts — showing static product data');
}

// Push local QTY_TIERS to backend for products that have no tiers set in DB
async function pushLocalTiersToBackend(backendProducts) {
  const productsWithoutTiers = backendProducts.filter(bp => {
    if (!bp.has_tiers && !bp.tiers) {
      const lt = QTY_TIERS[parseInt(bp.id)];
      return lt && lt.length > 0 && lt[0].rate != null;
    }
    return false;
  });
  if (!productsWithoutTiers.length) return;
  for (const bp of productsWithoutTiers) {
    try {
      const lt = QTY_TIERS[parseInt(bp.id)];
      await fetch(`${API_BASE}/api/products/${bp.id}`, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({has_tiers:true, tiers:JSON.stringify(lt)})
      });
    } catch(e) {}
  }
}

// ✅ Standalone render functions used after backend sync
function renderFeatured() {
  const visible = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  const feat = visible.filter(p => p.tags.includes('featured')).slice(0,8);
  const fg = document.getElementById('featuredGrid');
  if (fg) fg.innerHTML = feat.map(p => renderProductCard(p)).join('');
}
function renderNewArrivals() {
  const visible = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  const newP = visible.filter(p => p.tags.includes('new')).slice(0,4);
  const nag = document.getElementById('newArrivalsGrid');
  if (nag) nag.innerHTML = newP.map(p => renderProductCard(p)).join('');
}
function renderShopGrid() { applyFilters(); }

// Re-render all visible product cards after backend sync
function updateAllProductCards() {
  document.querySelectorAll('[data-product-id]').forEach(card => {
    const id = parseInt(card.dataset.productId);
    const p = PRODUCTS.find(x => x.id === id);
    if (!p || !card.parentNode) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = renderProductCard(p);
    const nc = tmp.firstElementChild;
    if (nc) card.parentNode.replaceChild(nc, card);
  });
}

const ASCOVITA_LOGO = "https://static.wixstatic.com/media/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png/v1/fill/w_346,h_166,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png";

const SHIPROCKET_CONFIG = {
  trackingUrl: 'https://shiprocket.co/tracking/',
  pickup_location: 'Primary',
  apiBase: API_BASE,
};

// ── QTY_TIERS: fallback static tiers (overridden by backend tiers if set in admin) ──
const QTY_TIERS = {
  1:  [{tabs:15,mrp:899, rate:584, discountPct:35},{tabs:30,mrp:1798,rate:1078,discountPct:40},{tabs:45,mrp:2697,rate:1483,discountPct:45},{tabs:60,mrp:3596,rate:1798,discountPct:50}],
  2:  [{tabs:15,mrp:349, rate:299, discountPct:14},{tabs:30,mrp:698, rate:565, discountPct:19},{tabs:45,mrp:1047,rate:796, discountPct:24},{tabs:60,mrp:1396,rate:977, discountPct:30}],
  3:  [{tabs:15,mrp:469, rate:399, discountPct:15},{tabs:30,mrp:938, rate:750, discountPct:20},{tabs:45,mrp:1407,rate:1055,discountPct:25},{tabs:60,mrp:1876,rate:1219,discountPct:35}],
  4:  [{tabs:15,mrp:599, rate:449, discountPct:25},{tabs:30,mrp:1198,rate:862, discountPct:28},{tabs:45,mrp:1797,rate:1221,discountPct:32},{tabs:60,mrp:2396,rate:1557,discountPct:35}],
  5:  [{tabs:15,mrp:349, rate:249, discountPct:28},{tabs:30,mrp:698, rate:488, discountPct:30},{tabs:45,mrp:1047,rate:711, discountPct:32},{tabs:60,mrp:1396,rate:921, discountPct:34}],
  8:  [{tabs:30,mrp:150, rate:120, discountPct:20},{tabs:60,mrp:289, rate:231, discountPct:20}],
  10: [{tabs:60,mrp:499, rate:399, discountPct:20}],
  11: [{tabs:60,mrp:459, rate:367, discountPct:20}],
  12: [{tabs:60,mrp:479, rate:383, discountPct:20}],
  20: [{tabs:60,mrp:249, rate:249, discountPct:0}],
  22: [{tabs:60,mrp:null, rate:null, discountPct:0}],
};

// ✅ FIX 7: Static products — image fields will be filled by backend sync
// These are your base/fallback products. Images come from Supabase via backend.
const PRODUCTS = [

  // ─── CATEGORY: PREMIUM MULTIVITAMIN ───
  {id:8, name:"Multidiata – Ascovita Premium Multivitamin", brand:"Ascovita Premium", category:"premium", tags:["featured","bestseller","immunity","premium"],
   price:120, salePrice:null, offer:"Box Pack 30 Tabs ₹120 | Bottle Pack 60 Tabs ₹231",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.8, reviews:567, stock:200, badge:"🏆 Premium",
   hasTiers:true,
   seoKeywords:["multivitamin India","best multivitamin India","daily multivitamin"],
   description:"Complete daily multivitamin for immunity, energy, and overall health. Multidiata is Ascovita's flagship precision-crafted multivitamin — a comprehensive formula delivering essential vitamins and minerals in one daily tablet. Formulated to address India's most common nutritional gaps with Vitamin D3, B12, Iron, and Zinc.",
   keyIngredients:["Vitamin C 80mg","Vitamin B3 (Niacin) 18mg","Zinc 10mg","Vitamin E 10mg","Magnesium 3.6mg","Vitamin B2 (Riboflavin) 3.5mg","Vitamin B6 2.4mg","Vitamin B1 (Thiamine) 1.8mg","Folic Acid 150mcg","Biotin 30mcg","Vitamin D3 5mcg","Vitamin A 1000IU"],
   howToUse:"Take 1 tablet daily with breakfast or as directed by healthcare professional."},

  // ─── CATEGORY: EFFERVESCENT TABLETS ───
  {id:1, name:"L-Glutathione Effervescent – Orange Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","premium","skin","bestseller","new"],
   price:584, salePrice:null, offer:"Up to 50% OFF on larger packs",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.9, reviews:312, stock:45, badge:"🔥 Best Seller",
   hasTiers:true,
   seoKeywords:["glutathione tablets India","effervescent tablets India","skin whitening glutathione","L-Glutathione effervescent"],
   description:"The master antioxidant supplement for radiant skin. Fights free radical damage, brightens complexion, detoxifies the liver, and boosts immunity. Each tablet contains 650mg Glutathione with L-Cysteine, Vitamin C, and Astaxanthin for maximum glow, detox, and defense. Vegan. No Added Colour. Sugar Free.",
   keyIngredients:["L-Glutathione (Reduced) 650mg","L-Cysteine 250mg","Vitamin C (Ascorbic Acid) 40mg","Astaxanthin 4mg","Iron (from Ferrous Fumarate) 4.6mg","Zinc (from Zinc Sulphate) 2.3mg","Magnesium (Magnesium Gluconate) 14mg","Vitamin B12 1.5mcg","Biotin 30mcg","Folic Acid 200mcg"],
   howToUse:"Dissolve 1 tablet in 200ml water. Consume before lunch or before dinner. Do not consume the tablet directly. Enjoy it before the fizz ends."},

  {id:2, name:"Apple Cider Vinegar + Moringa – Green Apple Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","new","weight","effervescent"],
   price:299, salePrice:null, offer:"Up to 30% OFF on larger packs",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.7, reviews:198, stock:80, badge:"New",
   hasTiers:true,
   seoKeywords:["apple cider vinegar tablets India","ACV moringa effervescent","weight management supplement India"],
   description:"ACV + Moringa Effervescent combines Apple Cider Vinegar (750mg), Moringa Leaf Extract (500mg), and Garcinia Cambogia for weight management, metabolic wellness, and energy support. Green Apple flavour. Vegan. Sugar Free.",
   keyIngredients:["Apple Cider Vinegar Powder 750mg (6% Acetic Acid)","Moringa Leaf Extract 500mg","Garcinia Extract 200mg","Vitamin C 40mg","Vitamin B12 1mcg","Vitamin B6 1mg","Zinc 10mg","Potassium 440mg"],
   howToUse:"Dissolve 1 tablet in 200ml water. Take 1 tablet before lunch or before dinner. Do not consume the tablet directly."},

  {id:3, name:"L-Carnitine Effervescent – Orange Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","weight","energy","effervescent"],
   price:399, salePrice:null, offer:"Up to 35% OFF on larger packs",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.6, reviews:154, stock:70, badge:"On Sale",
   hasTiers:true,
   seoKeywords:["L-Carnitine effervescent India","L-Carnitine supplement India","weight management effervescent"],
   description:"L-Carnitine Effervescent in refreshing Orange flavour. Supports fat metabolism, energy production, and physical performance. With Moringa superfood, multivitamins, and multiminerals for overall health & energy. Vegan. Sugar Free. Fast Absorption.",
   keyIngredients:["L-Carnitine (Orange)","Moringa (Superfood)","Multivitamins","Zinc (Zn)","Magnesium (Mg)","Beet Root Extract 25mg","Vitamin B12 1mcg","Vitamin B6 1.3mg"],
   howToUse:"Dissolve 1 tablet in 150–200ml water. Consume once daily before a meal. Allow the tablet to fully fizz and dissolve before drinking."},

  {id:4, name:"B12 + Biotin Effervescent – Guava Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","skin","energy","effervescent"],
   price:449, salePrice:null, offer:"Up to 35% OFF on larger packs",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.9, reviews:389, stock:95, badge:"Bestseller",
   hasTiers:true,
   seoKeywords:["biotin effervescent India","B12 biotin tablet India","biotin for hair growth India"],
   description:"B12 + Biotin Effervescent in delicious Guava flavour — hair, skin, and nail powerhouse. Vitamin B12 supports energy & vitality and helps boost metabolism. Biotin promotes healthy hair, skin & nails and supports stronger & thicker hair growth. Sugar Free. Fast Absorption. Vegan.",
   keyIngredients:["Vitamin B12 (Cyanocobalamin)","Biotin (D-Biotin)","L-Glutathione (Reduced) 650mg","L-Cysteine 500mg","Astaxanthin 4mg","Vitamin C","Vitamin E","Niacinamide","Riboflavin","Vitamin B6","Beet Root Extract"],
   howToUse:"Dissolve 1 tablet in 200ml water. Take 1 tablet before lunch and 1 tablet before dinner. Do not chew or swallow whole."},

  {id:5, name:"Vitamin C Effervescent – Orange Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","bestseller","immunity","effervescent"],
   price:249, salePrice:null, offer:"Up to 34% OFF on larger packs",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.8, reviews:334, stock:180, badge:"Bestseller",
   hasTiers:true,
   seoKeywords:["vitamin C effervescent India","immunity booster supplement India","Vitamin C tablet India"],
   description:"Vitamin C Effervescent with Moringa, multivitamins and multiminerals. Delivers Vitamin C power in a refreshing orange fizzy drink. Moringa superfood provides rich antioxidants, vitamins & minerals. Ensures optimal body functions with Zinc and Magnesium. Sugar Free. Vegan. Fast Absorption.",
   keyIngredients:["Vitamin C (Ascorbic Acid) 40mg","Moringa Leaf Extract","Zinc (Zn)","Magnesium (Mg)","L-Glutathione (Reduced) 650mg","L-Cysteine 500mg","Vitamin B12 1mcg","Vitamin B6 1.3mg","Beet Root Extract 25mg","Astaxanthin 4mg"],
   howToUse:"Dissolve 1 tablet in 150–200ml water. Consume once daily before lunch or dinner. Allow full fizz before drinking."},

  // ─── CATEGORY: SPIRULINA VITAMINS ───
  {id:10, name:"VitaPlus B12 + D3 Vegan – with Certified Organic Spirulina", brand:"Ascovita Spirulina", category:"spirulina", tags:["featured","new","immunity","energy","spirulina"],
   price:399, salePrice:null, offer:"20% OFF – Introductory Price",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.7, reviews:89, stock:120, badge:"New",
   hasTiers:true,
   seoKeywords:["spirulina B12 D3 tablet India","spirulina vegan vitamin","spirulina capsules India"],
   description:"VitaPlus B12 + D3 Vegan combines the extraordinary power of Certified Organic Spirulina with essential Vitamin B12 and Vitamin D3 (Plant Based). Spirulina is a nutrient-dense superfood with high-quality protein, essential amino acids, and important minerals including iron. FSSAI Approved. In-house grown India Certified Spirulina.",
   keyIngredients:["Organic Spirulina platensis","Vitamin B12 (Plant Based)","Vitamin D3 (Plant Based)","Multivitamins","Microcrystalline Minerals","Magnesium Stearate"],
   howToUse:"Adults: Take 2 tablets per day. Children (8–12 years): 1 tablet twice per day. Take in the morning with water or milk."},

  {id:11, name:"MG+++ Magnesium – B12 + D3 with Magnesium", brand:"Ascovita Spirulina", category:"spirulina", tags:["featured","new","energy","spirulina"],
   price:367, salePrice:null, offer:"20% OFF – Introductory Price",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.5, reviews:56, stock:85, badge:"New",
   hasTiers:true,
   seoKeywords:["spirulina magnesium supplement India","magnesium B12 tablet India","spirulina muscle support"],
   description:"MG+++ combines Certified Organic Spirulina with MG Citrate, MG Gluconate, MG Oxide, Vitamin D3 and Vitamin B12. Magnesium contributes to muscle and nerve function, works with calcium and Vitamin D to maintain bone density. In-house grown India Certified Spirulina.",
   keyIngredients:["Organic Spirulina platensis Powder","MG Citrate","MG Gluconate","MG Oxide","Vitamin D3 (Plant Based)","Vitamin B12","Microcrystalline Minerals"],
   howToUse:"Adults: Take 2 tablets per day. Children (8–12 years): 1 tablet twice per day. Take in the morning with water or milk."},

  {id:12, name:"CS++ + Iron++ – Calcium + Iron with B12+D3", brand:"Ascovita Spirulina", category:"spirulina", tags:["featured","new","immunity","spirulina"],
   price:383, salePrice:null, offer:"20% OFF – Introductory Price",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.6, reviews:44, stock:100, badge:"New",
   hasTiers:true,
   seoKeywords:["spirulina calcium iron tablet India","spirulina bone health","iron supplement spirulina India"],
   description:"CA++ & Iron++ combines Certified Organic Spirulina with Calcium Citrate Malate, Vitamin K, Zinc, Iron, Magnesium, Vitamin D3 and B12 for complete bone and blood health. In-house grown India Certified Spirulina.",
   keyIngredients:["Organic Spirulina platensis Powder","Calcium Citrate Malate","Vitamin K","Zinc","Iron","Magnesium","Vitamin D3 (Plant Based)","Vitamin B12"],
   howToUse:"Adults: Take 2 tablets per day. Children (8–12 years): 1 tablet per day. Take in the morning with water or milk."},

  // ─── CATEGORY: AYURVEDIC ───
  {id:20, name:"Moringa Tablets", brand:"Ascovita Ayurvedic", category:"ayurvedic", tags:["featured","new","immunity","energy","ayurvedic"],
   price:249, salePrice:null, offer:"Price to be updated",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.7, reviews:156, stock:100, badge:"Ayurvedic",
   hasTiers:false,
   seoKeywords:["moringa tablets India","moringa oleifera supplement India","moringa veggie tablets"],
   description:"Pure Organic Moringa Tablets — the miracle tree in its most potent form. Boosts energy levels, improves digestive system, increases metabolism, and builds up stamina. Each 750mg tablet provides Moringa's full spectrum of nutrients. FSSAI Approved. Vegan. Dietary Supplement.",
   keyIngredients:["Organic Moringa (Moringa oleifera) 750mg per tablet","Acaciaegum (binder)"],
   howToUse:"Take 2 moringa tablets in the morning and 2 tablets in the evening. Children (8–12 years): 1 moringa tablet twice per day. Store in a cool & dry place."},

  // ─── CATEGORY: IMMUNITY ───
  {id:22, name:"Power Pro Tablets", brand:"Ascovita Immunity", category:"immunity", tags:["featured","new","immunity","energy"],
   price:null, salePrice:null, offer:"Price coming soon",
   image:"", image2:"", image3:"", image4:"", image5:"", allImages:[],
   rating:4.7, reviews:34, stock:60, badge:"Coming Soon",
   hasTiers:false,
   seoKeywords:["immunity booster India","power pro tablet India","stamina supplement India","ashwagandha immunity"],
   description:"Energy Pro+ for Vigour, Vitality & Stamina. Enhances Stamina & Physical Performance. Inhibits Fatigue & Stress. Promotes a Healthy Immune Response. Power | Strength | Stamina.",
   keyIngredients:["Withania somnifera (Ashwagandha) 250mg","Emblica officinalis 75mg","Mucuna pruriens 50mg","Tribulus terrestris 50mg","Purified Shilajit Extract 50mg","Astaxanthin 4mg","Asparagus racemosus 59mg","Chlorophytum borivilianum 59mg"],
   howToUse:"Adults: Take 1 tablet per day after a meal or as directed by healthcare professional. Keep out of reach of children."},
];

const REVIEWS = {
  1:[{user:"Sneha Joshi",rating:5,text:"Noticed brighter skin in 4 weeks. The orange flavour is so refreshing to drink every day!",date:"Feb 2025",verified:true},{user:"Meera Sharma",rating:4,text:"Premium Glutathione product, quality is evident. Genuine L-Glutathione 650mg.",date:"Jan 2025",verified:true}],
  2:[{user:"Pooja Jain",rating:5,text:"ACV + Moringa Green Apple is amazing! Feel the difference in energy and digestion in 2 weeks.",date:"Mar 2025",verified:true},{user:"Vikram Singh",rating:5,text:"Love this product. Cravings have reduced a lot. Great for weight management.",date:"Feb 2025",verified:true}],
  3:[{user:"Sanya Mishra",rating:5,text:"L-Carnitine Orange is so refreshing! My energy during workouts has visibly improved.",date:"Mar 2025",verified:true},{user:"Rohan Gupta",rating:4,text:"Great for fat burning support. Can feel the sustained energy throughout the day.",date:"Feb 2025",verified:true}],
  4:[{user:"Deepa Menon",rating:5,text:"Hair fall reduced significantly in 6 weeks! The guava taste is absolutely delicious.",date:"Feb 2025",verified:true},{user:"Priya Nair",rating:5,text:"B12 + Biotin combo is incredible. Nails stopped breaking and skin is glowing!",date:"Jan 2025",verified:true}],
  5:[{user:"Kavya Patel",rating:5,text:"Vitamin C fizz is so good! My immunity is definitely stronger this season.",date:"Feb 2025",verified:true},{user:"Ritika Desai",rating:5,text:"Best Vitamin C supplement I've tried. Love the moringa addition.",date:"Jan 2025",verified:true}],
  8:[{user:"Ramesh Kumar",rating:5,text:"Best multivitamin at this price. Complete nutrition in one tablet!",date:"Feb 2025",verified:true},{user:"Anjali Mehta",rating:5,text:"Doctor recommended and I'm glad. B12 deficiency improved in 2 months.",date:"Feb 2025",verified:true}],
  10:[{user:"Sunita Rao",rating:5,text:"VitaPlus B12+D3 is fantastic. No fishy smell, easy to swallow, great energy.",date:"Feb 2025",verified:true},{user:"Geeta Iyer",rating:5,text:"Spirulina quality is excellent. Certified organic and made in India!",date:"Jan 2025",verified:true}],
  20:[{user:"Arjun Sharma",rating:5,text:"Moringa tablets are incredible! Energy levels have gone up noticeably.",date:"Mar 2025",verified:true},{user:"Nikhil Patel",rating:4,text:"Pure moringa, no filler. Good stamina and digestion improvement.",date:"Feb 2025",verified:true}],
};
PRODUCTS.forEach(p => {
  if (!REVIEWS[p.id]) REVIEWS[p.id] = [{user:"Verified Buyer",rating:Math.round(p.rating),text:`${p.name} is exactly as described. Great quality from Ascovita.`,date:"Jan 2025",verified:true},{user:"Happy Customer",rating:5,text:"Ascovita products are genuine and effective.",date:"Feb 2025",verified:true}];
});

const STORE = {
  cart:[], wishlist:[],
  init(){try{this.cart=JSON.parse(localStorage.getItem('asc_cart')||'[]');}catch(e){this.cart=[];}try{this.wishlist=JSON.parse(localStorage.getItem('asc_wish')||'[]');}catch(e){this.wishlist=[];}this.updateCartUI();},
  save(){try{localStorage.setItem('asc_cart',JSON.stringify(this.cart));localStorage.setItem('asc_wish',JSON.stringify(this.wishlist));}catch(e){}this.updateCartUI();},
  addToCart(id,qty=1){const p=PRODUCTS.find(p=>p.id===id);if(!p)return;const ex=this.cart.find(i=>i.id===id);if(ex)ex.qty+=qty;else this.cart.push({id,qty});this.save();window._trackAddToCart&&window._trackAddToCart(p,qty);showToast(`${p.name} added to cart! 🌿`);},
  removeFromCart(id){this.cart=this.cart.filter(i=>i.id!==id);this.save();},
  updateQty(id,qty){const item=this.cart.find(i=>i.id===id);if(item){item.qty=Math.max(1,qty);this.save();}},
  getSubtotal(){return this.cart.reduce((s,i)=>{const p=PRODUCTS.find(p=>p.id===i.id);return s+(p?((p.salePrice||p.price)||0)*i.qty:0);},0);},
  applyCode(code){return null;},
  updateCartUI(){const count=this.cart.reduce((s,i)=>s+i.qty,0);document.querySelectorAll('.cart-badge').forEach(el=>{el.textContent=count;el.style.display=count>0?'flex':'none';});},
  toggleWishlist(id){const idx=this.wishlist.indexOf(id);if(idx>-1){this.wishlist.splice(idx,1);showToast('Removed from wishlist');}else{this.wishlist.push(id);showToast('Added to wishlist! 💚');}this.save();}
};

function fmt(p){return '₹'+p.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});}
function stars(r){const f=Math.floor(r),h=r%1>=0.5;return '<span class="stars">'+'★'.repeat(f)+(h?'☆':'')+'</span><span class="rating-n">'+r+'</span>';}
function showToast(msg,type=''){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},3200);}

function renderProductCard(p){
  const disc=p.salePrice&&p.price?Math.round((1-p.salePrice/p.price)*100):0;
  const rawTiers=p._backendTiers||QTY_TIERS[p.id];
  const tiers=rawTiers&&rawTiers.filter(t=>t.rate!=null&&t.mrp!=null).length?rawTiers.filter(t=>t.rate!=null&&t.mrp!=null):null;
  const maxDisc=tiers?Math.max(...tiers.map(t=>t.discountPct||0)):disc;
  const baseRate=tiers?tiers[0].rate:(p.salePrice||p.price);
  const baseMRP=tiers?tiers[0].mrp:p.price;
  const priceDisplay=(baseRate==null)?'<em style="font-size:0.8rem;color:#b8860b">Price Coming Soon</em>':'\u20B9'+baseRate.toLocaleString('en-IN');
  // ✅ FIX 8: Use PLACEHOLDER_IMG when image is empty, ERROR_IMG on load error
  const imgSrc = p.image || PLACEHOLDER_IMG;
  return `<div class="product-card" data-product-id="${p.id}" onclick="openProduct(${p.id})"><div class="p-img-wrap"><img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${ERROR_IMG}'">${p.badge?`<span class="p-badge">${p.badge}</span>`:''} ${maxDisc>0?`<span class="p-disc-badge">${tiers?'Up to ':'-'}${maxDisc}%</span>`:''}<div class="p-actions"><button class="btn-wishlist" onclick="event.stopPropagation();STORE.toggleWishlist(${p.id})" title="Wishlist">♡</button><button class="btn-qadd" onclick="event.stopPropagation();${tiers?`openProduct(${p.id})`:`STORE.addToCart(${p.id})`}">${tiers?'Choose Pack':'Add to Cart'}</button></div></div><div class="p-info"><div class="p-brand">${p.brand}</div><div class="p-name">${p.name}</div><div class="p-rating">${stars(p.rating)} <span class="review-ct">(${p.reviews})</span></div><div class="p-price"><span class="sale-price">${priceDisplay}</span>${(baseMRP&&baseMRP!==baseRate)?`<span class="orig-price">₹${baseMRP.toLocaleString('en-IN')}</span>`:''}</div>${tiers?`<div class="tier-offer-tag">⚡ Up to ${maxDisc}% OFF on larger packs</div>`:(p.offer?`<span class="offer-tag" style="margin-top:4px;display:inline-block">${p.offer}</span>`:'')}</div></div>`;
}
