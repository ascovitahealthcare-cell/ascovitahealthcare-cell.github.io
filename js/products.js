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
setTimeout(() => {
  if (!sessionStorage.getItem('wa_shown')) {
    const popup = document.getElementById('waChatPopup');
    if (popup) popup.classList.add('open');
    sessionStorage.setItem('wa_shown', '1');
  }
}, 45000);

function submitB2BEnquiry() {
  const company = document.getElementById('b2bCompany')?.value.trim() || '';
  const name    = document.getElementById('b2bName')?.value.trim() || '';
  const phone   = document.getElementById('b2bPhone')?.value.trim() || '';
  const email   = document.getElementById('b2bEmail')?.value.trim() || '';
  const type    = document.getElementById('b2bType')?.value || '';
  const msg     = document.getElementById('b2bMsg')?.value.trim() || '';
  if (!name || !phone) { showToast('Please enter your name and phone number.'); return; }
  const waMsg = `Hello Ascovita! 🌿 B2B Enquiry\n\nCompany: ${company||'N/A'}\nContact: ${name}\nPhone: ${phone}\nEmail: ${email||'N/A'}\nPartnership Type: ${type||'General'}\n\nRequirements:\n${msg||'Please share details about your B2B programme.'}`;
  openWhatsApp(waMsg);
  showToast('Opening WhatsApp with your enquiry!');
}

// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════
const API_BASE = 'https://ascovitahealthcare-cell-github-io.onrender.com';
const PLACEHOLDER_IMG = 'https://placehold.co/400x400/EAF2E0/2D5016?text=Loading...';
const ERROR_IMG = 'https://placehold.co/400x400/EAF2E0/2D5016?text=Ascovita';
const ASCOVITA_LOGO = "https://static.wixstatic.com/media/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png/v1/fill/w_346,h_166,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png";
const SHIPROCKET_CONFIG = { trackingUrl: 'https://shiprocket.co/tracking/', pickup_location: 'Primary', apiBase: API_BASE };

// ═══════════════════════════════════════════════════════
// ✅ FULLY BACKEND-DRIVEN — no hardcoded products
// All products come from Supabase. Add in backoffice → shows here.
// ═══════════════════════════════════════════════════════
let PRODUCTS = [];

// Safe JSON array parser — handles corrupted/triple-encoded values from Supabase
function safeParseArr(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(v => typeof v === 'string' && !v.startsWith('['));
  if (typeof val !== 'string') return [];
  let v = val.trim();
  // Keep unwrapping until we get a flat string array or give up
  for (let i = 0; i < 5; i++) {
    if (!v.startsWith('[') && !v.startsWith('"')) break;
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        // If all items are plain strings (not nested JSON), we're done
        if (parsed.every(x => typeof x === 'string' && !x.startsWith('[') && !x.startsWith('"['))) {
          return parsed.filter(Boolean);
        }
        // Otherwise keep unwrapping the first item
        v = parsed[0] || '[]';
      } else if (typeof parsed === 'string') {
        v = parsed;
      } else break;
    } catch(e) {
      // Not valid JSON — split by comma as last resort
      return v.replace(/^\[|\]$/g, '').split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
  }
  return [];
}

// Convert a raw backend product into a clean frontend product object
function normaliseProduct(bp) {
  const id = parseInt(bp.id);

  // Collect all image URLs
  const imgUrls = [bp.image, bp.image2, bp.image3, bp.image4, bp.image5]
    .concat(safeParseArr(bp.images))
    .filter(u => u && typeof u === 'string' && u.startsWith('http'));
  const uniqueImgs = [...new Set(imgUrls)];

  // Parse tags — safe even if corrupted
  const tags = safeParseArr(bp.tags);

  // Parse tiers
  let backendTiers = null;
  try {
    const t = Array.isArray(bp.tiers) ? bp.tiers : JSON.parse(bp.tiers || 'null');
    if (Array.isArray(t) && t.length && t[0] && t[0].rate != null) backendTiers = t;
  } catch(e) {}

  return {
    id,
    name:        bp.name || 'Product',
    brand:       bp.brand || 'Ascovita',
    category:    (bp.category || 'other').toLowerCase(),
    tags,
    price:       bp.price != null ? parseFloat(bp.price) : null,
    salePrice:   bp.sale_price ? parseFloat(bp.sale_price) : null,
    offer:       bp.offer_text || bp.offer || null,
    image:       uniqueImgs[0] || '',
    image2:      uniqueImgs[1] || '',
    image3:      uniqueImgs[2] || '',
    image4:      uniqueImgs[3] || '',
    image5:      uniqueImgs[4] || '',
    allImages:   uniqueImgs,
    media:       uniqueImgs.map(u => ({ url: u, type: 'image', thumb: u })),
    rating:      parseFloat(bp.rating) || 4.5,
    reviews:     parseInt(bp.reviews) || 0,
    stock:       parseInt(bp.stock) || 0,
    badge:       bp.badge || '',
    description: bp.description || '',
    keyIngredients: safeParseArr(bp.key_ingredients),
    howToUse:    bp.how_to_use || '',
    hasTiers:    bp.has_tiers || false,
    _backendTiers: backendTiers,
    seoKeywords: safeParseArr(bp.seo_keywords),
    metaDescription: bp.meta_description || '',
    active:      bp.active !== false,
    _hidden:     bp.active === false,
  };
}

// QTY_TIERS: static fallback tiers (used if backend has none set)
const QTY_TIERS = {
  1:  [{tabs:15,mrp:899, rate:584, discountPct:35},{tabs:30,mrp:1798,rate:1078,discountPct:40},{tabs:45,mrp:2697,rate:1483,discountPct:45},{tabs:60,mrp:3596,rate:1798,discountPct:50}],
  2:  [{tabs:15,mrp:349, rate:299, discountPct:14},{tabs:30,mrp:698, rate:565, discountPct:19},{tabs:45,mrp:1047,rate:796, discountPct:24},{tabs:60,mrp:1396,rate:977, discountPct:30}],
  3:  [{tabs:15,mrp:469, rate:399, discountPct:15},{tabs:30,mrp:938, rate:750, discountPct:20},{tabs:45,mrp:1407,rate:1055,discountPct:25},{tabs:60,mrp:1876,rate:1219,discountPct:35}],
  4:  [{tabs:15,mrp:599, rate:449, discountPct:25},{tabs:30,mrp:1198,rate:862, discountPct:28},{tabs:45,mrp:1797,rate:1221,discountPct:32},{tabs:60,mrp:2396,rate:1557,discountPct:35}],
  5:  [{tabs:15,mrp:349, rate:249, discountPct:28},{tabs:30,mrp:698, rate:488, discountPct:30},{tabs:45,mrp:1047,rate:711, discountPct:32},{tabs:60,mrp:1396,rate:921, discountPct:34}],
};

// ═══════════════════════════════════════════════════════
// BACKEND SYNC — loads ALL products from Supabase
// ═══════════════════════════════════════════════════════
function makeSignal(ms) {
  var ctrl = new AbortController();
  var tid = setTimeout(function() { ctrl.abort(); }, ms);
  ctrl.signal.addEventListener('abort', function() { clearTimeout(tid); }, {once:true});
  return ctrl.signal;
}

async function syncProductsFromBackend() {
  // Step 1: Wake ping
  var serverAwake = false;
  try {
    var wr = await fetch(API_BASE + '/health', { method:'GET', mode:'cors', cache:'no-store' });
    serverAwake = wr.ok;
  } catch(e) {}

  if (!serverAwake) {
    console.log('[Ascovita] Server waking up — waiting 15s…');
    await new Promise(r => setTimeout(r, 15000));
  }

  // Step 2: Fetch — up to 3 attempts
  var DELAYS = [0, 8000, 10000];
  for (var attempt = 0; attempt < 3; attempt++) {
    if (DELAYS[attempt] > 0) await new Promise(r => setTimeout(r, DELAYS[attempt]));
    try {
      var r = await fetch(API_BASE + '/api/products?_t=' + Date.now(), {
        method:'GET', mode:'cors', cache:'no-store',
        headers: { 'Cache-Control':'no-cache', 'Pragma':'no-cache' }
      });
      if (!r.ok) { console.warn('[Ascovita] HTTP ' + r.status); continue; }

      var data = await r.json();
      var raw = data.data || data;
      if (!Array.isArray(raw) || !raw.length) { console.warn('[Ascovita] Empty list'); continue; }

      // ✅ Replace PRODUCTS entirely with fresh backend data
      PRODUCTS = raw
        .filter(bp => bp.active !== false && !bp.deleted_at)
        .map(normaliseProduct);

      console.log('[Ascovita] ✅ Loaded ' + PRODUCTS.length + ' products from backend');

      // Re-render everything
      try { renderFeatured(); } catch(e) {}
      try { renderNewArrivals(); } catch(e) {}
      try { if (document.getElementById('shopGrid')) renderShopGrid(); } catch(e) {}
      try { updateAllProductCards(); } catch(e) {}
      try {
        var pp = document.getElementById('page-product');
        if (pp && pp.style.display !== 'none' && window._currentProductId) {
          var cp = PRODUCTS.find(p => p.id === window._currentProductId);
          if (cp) buildProductPage(cp);
        }
      } catch(e) {}
      return;

    } catch(e) {
      console.warn('[Ascovita] Attempt ' + (attempt+1) + ' failed: ' + e.message);
    }
  }
  console.warn('[Ascovita] ⚠️ All sync attempts failed');
}

async function validateCouponWithBackend(code, subtotal) {
  try {
    const r = await fetch(`${API_BASE}/api/coupons/validate`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({code, subtotal}), signal: makeSignal(5000)
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.valid ? d : null;
  } catch(e) { return null; }
}

// Render helpers
function renderFeatured() {
  const fg = document.getElementById('featuredGrid');
  if (!fg) return;
  const feat = PRODUCTS.filter(p => !p._hidden).slice(0, 8);
  fg.innerHTML = feat.map(p => renderProductCard(p)).join('');
}
function renderNewArrivals() {
  const nag = document.getElementById('newArrivalsGrid');
  if (!nag) return;
  const newP = PRODUCTS.filter(p => !p._hidden && (p.tags.includes('new') || p.badge === 'New')).slice(0, 4);
  nag.innerHTML = newP.map(p => renderProductCard(p)).join('');
}
function renderShopGrid() { try { applyFilters(); } catch(e) {} }
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

// ═══════════════════════════════════════════════════════
// REVIEWS — auto-generated per product
// ═══════════════════════════════════════════════════════
const REVIEWS = {};
function getReviews(id) {
  if (!REVIEWS[id]) {
    const p = PRODUCTS.find(x => x.id === id);
    REVIEWS[id] = [
      {user:"Verified Buyer", rating: p ? Math.round(p.rating) : 5, text: p ? `${p.name} is exactly as described. Great quality from Ascovita.` : 'Great product!', date:"Jan 2025", verified:true},
      {user:"Happy Customer", rating:5, text:"Ascovita products are genuine and effective.", date:"Feb 2025", verified:true}
    ];
  }
  return REVIEWS[id];
}

// ═══════════════════════════════════════════════════════
// STORE — cart & wishlist
// ═══════════════════════════════════════════════════════
const STORE = {
  cart:[], wishlist:[],
  init(){
    try{this.cart=JSON.parse(localStorage.getItem('asc_cart')||'[]');}catch(e){this.cart=[];}
    try{this.wishlist=JSON.parse(localStorage.getItem('asc_wish')||'[]');}catch(e){this.wishlist=[];}
    this.updateCartUI();
  },
  save(){
    try{localStorage.setItem('asc_cart',JSON.stringify(this.cart));localStorage.setItem('asc_wish',JSON.stringify(this.wishlist));}catch(e){}
    this.updateCartUI();
  },
  addToCart(id,qty=1){
    const p=PRODUCTS.find(p=>p.id===id);if(!p)return;
    const ex=this.cart.find(i=>i.id===id);
    if(ex)ex.qty+=qty;else this.cart.push({id,qty});
    this.save();
    window._trackAddToCart&&window._trackAddToCart(p,qty);
    showToast(`${p.name} added to cart! 🌿`);
  },
  removeFromCart(id){this.cart=this.cart.filter(i=>i.id!==id);this.save();},
  updateQty(id,qty){const item=this.cart.find(i=>i.id===id);if(item){item.qty=Math.max(1,qty);this.save();}},
  getSubtotal(){return this.cart.reduce((s,i)=>{const p=PRODUCTS.find(p=>p.id===i.id);return s+(p?((p.salePrice||p.price)||0)*i.qty:0);},0);},
  applyCode(code){return null;},
  updateCartUI(){
    const count=this.cart.reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('.cart-badge').forEach(el=>{el.textContent=count;el.style.display=count>0?'flex':'none';});
  },
  toggleWishlist(id){
    const idx=this.wishlist.indexOf(id);
    if(idx>-1){this.wishlist.splice(idx,1);showToast('Removed from wishlist');}
    else{this.wishlist.push(id);showToast('Added to wishlist! 💚');}
    this.save();
  }
};

// ═══════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════
function fmt(p){return '₹'+p.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});}
function stars(r){const f=Math.floor(r),h=r%1>=0.5;return '<span class="stars">'+'★'.repeat(f)+(h?'☆':'')+'</span><span class="rating-n">'+r+'</span>';}
function showToast(msg,type=''){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},3200);}

function renderProductCard(p) {
  const rawTiers = p._backendTiers || QTY_TIERS[p.id];
  const tiers = rawTiers && rawTiers.filter(t=>t.rate!=null&&t.mrp!=null).length ? rawTiers.filter(t=>t.rate!=null&&t.mrp!=null) : null;
  const disc = p.salePrice && p.price ? Math.round((1 - p.salePrice/p.price)*100) : 0;
  const maxDisc = tiers ? Math.max(...tiers.map(t=>t.discountPct||0)) : disc;
  const baseRate = tiers ? tiers[0].rate : (p.salePrice || p.price);
  const baseMRP  = tiers ? tiers[0].mrp : p.price;
  const priceDisplay = (baseRate == null)
    ? '<em style="font-size:0.8rem;color:#b8860b">Price Coming Soon</em>'
    : '\u20B9' + baseRate.toLocaleString('en-IN');
  const imgSrc = p.image || PLACEHOLDER_IMG;
  return `<div class="product-card" data-product-id="${p.id}" onclick="openProduct(${p.id})">
    <div class="p-img-wrap">
      <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${ERROR_IMG}'">
      ${p.badge ? `<span class="p-badge">${p.badge}</span>` : ''}
      ${maxDisc > 0 ? `<span class="p-disc-badge">${tiers?'Up to ':'-'}${maxDisc}%</span>` : ''}
      <div class="p-actions">
        <button class="btn-wishlist" onclick="event.stopPropagation();STORE.toggleWishlist(${p.id})" title="Wishlist">♡</button>
        <button class="btn-qadd" onclick="event.stopPropagation();${tiers?`openProduct(${p.id})`:`STORE.addToCart(${p.id})`}">${tiers?'Choose Pack':'Add to Cart'}</button>
      </div>
    </div>
    <div class="p-info">
      <div class="p-brand">${p.brand}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-rating">${stars(p.rating)} <span class="review-ct">(${p.reviews})</span></div>
      <div class="p-price">
        <span class="sale-price">${priceDisplay}</span>
        ${(baseMRP && baseMRP !== baseRate) ? `<span class="orig-price">₹${baseMRP.toLocaleString('en-IN')}</span>` : ''}
      </div>
      ${tiers ? `<div class="tier-offer-tag">⚡ Up to ${maxDisc}% OFF on larger packs</div>` : (p.offer ? `<span class="offer-tag" style="margin-top:4px;display:inline-block">${p.offer}</span>` : '')}
    </div>
  </div>`;
}
