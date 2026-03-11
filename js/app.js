// ═══════════════════════════════════════════════════════
// ASCOVITA STORE — APP LOGIC
// ═══════════════════════════════════════════════════════
// Ascovita – Main Application

// ── BLOG DATA ──
const BLOGS = [
  { id:1, tag:"Moringa Benefits", title:"Why Moringa is Called the Miracle Tree – And Why You Need It Daily", excerpt:"Moringa Oleifera has 92 nutrients, 46 antioxidants and all 9 essential amino acids. Here's why every Indian should add it to their routine.", img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80", date:"Feb 18, 2025", readTime:"5 min read", author:"Dr. Sanjay Mehta" },
  { id:2, tag:"Spirulina Guide", title:"Spirulina: The Superfood That Could Replace Your Entire Supplement Stack", excerpt:"One gram of spirulina provides more nutrition than 1000 grams of most vegetables. We break down the science.", img:"https://images.unsplash.com/photo-1622203714616-9c1e3b7d7f3c?w=500&q=80", date:"Feb 10, 2025", readTime:"7 min read", author:"Nutritionist Priya Rao" },
  { id:3, tag:"Skin & Hair", title:"Biotin at 10,000mcg: Does Higher Dose Really Mean Better Hair Growth?", excerpt:"The research on high-dose biotin and hair growth — what works, what doesn't, and what dosage is right for you.", img:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80", date:"Feb 3, 2025", readTime:"6 min read", author:"Dr. Kavita Sharma" },
  { id:4, tag:"Antioxidants", title:"Glutathione: India's Fastest Growing Wellness Supplement Explained", excerpt:"Glutathione supplements are everywhere. But what does the master antioxidant actually do? We asked a dermatologist.", img:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80", date:"Jan 25, 2025", readTime:"8 min read", author:"Dr. Ananya Gupta" },
  { id:5, tag:"Nutrition Tips", title:"The 7 Most Common Nutrient Deficiencies in India (And How to Fix Them)", excerpt:"Iron, Vitamin D, B12 and calcium deficiencies affect over 70% of Indians. A comprehensive guide to testing and treating them.", img:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80", date:"Jan 18, 2025", readTime:"9 min read", author:"Wellness Expert Rahul Verma" },
  { id:6, tag:"Wellness Routine", title:"How to Build a Morning Supplement Routine That Actually Works", excerpt:"Timing, sequencing, and food pairing make a huge difference to how well your supplements are absorbed.", img:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80", date:"Jan 10, 2025", readTime:"5 min read", author:"Nutritionist Meera Iyer" },
];

// ── FAQ DATA ──
const FAQS = [
  { q:"How long does delivery take?", a:"Standard delivery across India takes 3–5 business days. Express delivery in major cities (Mumbai, Delhi, Bangalore, Hyderabad, Ahmedabad, Chennai) takes 1–2 business days. Free shipping on all orders above ₹599.", cat:"Shipping" },
  { q:"What payment methods do you accept?", a:"We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking for all major banks, and No-Cost EMI options via Cashfree. COD is not available — online payments only.", cat:"Payment" },
  { q:'What does "Buy 4 Get 50% OFF" mean?', a:"When you add 4 or more units of any eligible product (marked with the offer) to your cart, the 50% discount is automatically applied to all those units at checkout. This is our way of rewarding customers who stock up!", cat:"Offers" },
  { q:"Are Ascovita products FSSAI approved?", a:"Yes. All Ascovita products are manufactured in FSSAI-licensed GMP-compliant facilities and meet all regulatory requirements for food supplements in India. Product licenses are available on request.", cat:"Products" },
  { q:"Can I take multiple supplements together?", a:"Generally yes, but we recommend checking with your doctor if you're on medications. Ascovita supplements are designed to be safe when combined. Our Combo Kits are specifically curated for safe, effective multi-supplement use.", cat:"Products" },
  { q:"How do I track my order?", a:"After dispatch, you'll receive an SMS and email with a tracking link from our shipping partner (Shiprocket). Track directly at shiprocket.in/shipment-tracking or via the link in your confirmation email.", cat:"Shipping" },
  { q:"Is COD available? Any extra charges?", a:"Yes, COD is not available. We accept UPI, Cards, Net Banking and EMI across India. A nominal COD convenience fee of ₹40 applies. No COD for orders above ₹5,000.", cat:"Payment" },
  { q:"Can I return or exchange products?", a:"We offer a 7-day return policy for sealed, unused products. If you receive a damaged or wrong product, we will replace it at no cost. Contact ascovitahealthcare@gmail.com with your order details and photo.", cat:"Returns" },
  { q:"How should I store the products?", a:"Store all Ascovita products in a cool, dry place below 30°C. Keep away from direct sunlight and moisture. After opening effervescent tablet tubes, seal tightly and use within 30 days.", cat:"Products" },
  { q:"Are these suitable for vegetarians/vegans?", a:"All Ascovita supplements are 100% vegetarian. The spirulina products are also vegan. Glutathione and B1+Biotin are vegetarian but check if vegan-strict, as some capsule shells may vary.", cat:"Products" },
  { q:"How do I apply a discount code?", a:"At checkout, enter your promo code in the 'Apply Coupon' field and click Apply. Valid promo codes are shared on our Instagram, WhatsApp channel, and promotional emails.", cat:"Offers" },
  { q:"Do you offer bulk/wholesale pricing?", a:"Yes! For bulk orders of 50+ units or wholesale partnerships, contact us at ascovitahealthcare@gmail.com or call +91 9898 582 650. We offer attractive pricing for distributors, pharmacies, and gyms.", cat:"Orders" },
];

// ── APP STATE ──
let currentPage = 'home';
let currentProduct = null;
let currentCat = 'all';
let priceMax = 2000;
let carouselIdx = 0;
let pQty = 1;
let selectedRating = 0;
let appliedDiscount = null;

// ── PAGE NAV ──
function showPage(pg) {
  document.getElementById('codOverlay')?.remove();
  // Update URL to clean path (e.g. ascovita.com/about) — no hash
  try {
    const cleanPath = (pg && pg !== 'home') ? '/' + pg : '/';
    history.pushState({ page: pg }, '', cleanPath);
  } catch(e) { /* suppressed: sandboxed iframe preview */ }
  // Track page view in GA
  window._trackPage && window._trackPage(pg);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pg);
  if (!el) return;
  el.classList.add('active');
  window.scrollTo({ top:0, behavior:'smooth' });
  currentPage = pg;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pg);
  });
  if (pg === 'shop') initShop();
  if (pg === 'cart') {
    renderCart();
    try {
      const items = STORE.cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return{id:i.id,name:p?.name||'',price:p?.salePrice||p?.price||0,qty:i.qty};});
      const tot = items.reduce((s,i)=>s+i.price*i.qty,0);
      window._trackViewCart && window._trackViewCart(items, tot);
    } catch(e){}
  }
  if (pg === 'checkout') {
    renderCheckoutSummary();
    try {
      const items = STORE.cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return{id:i.id,name:p?.name||'',price:p?.salePrice||p?.price||0,qty:i.qty};});
      const tot = items.reduce((s,i)=>s+i.price*i.qty,0);
      window._trackBeginCheckout && window._trackBeginCheckout(items, tot);
    } catch(e){}
  }
  if (pg === 'blog') renderFullBlog();
  if (pg === 'faq') renderFullFaq();

  // Footer: hide on transactional/fullscreen pages
  const noFooterPages = ['checkout', 'thankyou', 'account', 'login'];
  const footer = document.getElementById('siteFooter');
  if (footer) {
    footer.style.display = noFooterPages.includes(pg) ? 'none' : '';
  }

  // Sticky cart bar: ONLY show on product page, hide everywhere else
  const stickyCart = document.getElementById('stickyCart');
  if (stickyCart) {
    if (pg !== 'product') {
      stickyCart.style.display = 'none';
      stickyCart.style.transform = 'translateY(100%)';
    }
  }
}

function showShop(cat) {
  currentCat = cat || 'all';
  showPage('shop');
  setTimeout(() => filterCat(currentCat, document.querySelector(`.cpill[data-cat="${currentCat}"]`)), 30);
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function openProduct(id) {
  currentProduct = PRODUCTS.find(p => p.id === id);
  window._currentProductId = id; // track for backend sync re-render
  if (currentProduct) window._trackViewItem && window._trackViewItem(currentProduct);
  if (!currentProduct) return;
  pQty = 1;
  buildProductPage(currentProduct);
  setTimeout(()=>document.dispatchEvent(new CustomEvent('productPageShown',{detail:currentProduct})),100);
  // Push clean URL: /product/glutathione-effervescent
  try {
    const slug = slugify(currentProduct.name);
    history.pushState({ page: 'product', id: id }, '', '/product/' + slug);
  } catch(e) {}
  // Update page title + meta for SEO
  const disc = currentProduct.salePrice ? Math.round((1 - currentProduct.salePrice/currentProduct.price)*100) : 0;
  const discText = disc > 0 ? ` – ${disc}% OFF` : '';
  document.title = currentProduct.name + discText + ' | Ascovita';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content',
    'Buy ' + currentProduct.name + ' at ₹' + (currentProduct.salePrice||currentProduct.price) + discText + '. ' + (currentProduct.description||'').slice(0,120) + ' Free shipping above ₹599.'
  );
  // Show the page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-product');
  if (el) { el.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  currentPage = 'product';
  const bc=document.getElementById('prodBCName'); if(bc) bc.textContent = currentProduct.name;
}

// ── MOBILE MENU ──
function toggleMobile() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ── HOME INIT ──
function initHome() {
  // ✅ FIX 2: Filter out _hidden (active:false) products from all grids
  const visibleProducts = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  // Featured
  const feat = visibleProducts.filter(p => p.tags.includes('featured')).slice(0,8);
  const fg=document.getElementById('featuredGrid'); if(fg) fg.innerHTML = feat.map(p => renderProductCard(p)).join('');
  // New arrivals
  const newP = visibleProducts.filter(p => p.tags.includes('new')).slice(0,4);
  const nag=document.getElementById('newArrivalsGrid'); if(nag) nag.innerHTML = newP.map(p => renderProductCard(p)).join('');
  // Blog
  const hbg=document.getElementById('homeBlogGrid'); if(hbg) hbg.innerHTML = BLOGS.slice(0,3).map(renderBlogCard).join('');
  // FAQ
  const hfw=document.getElementById('homeFaqWrap'); if(hfw) hfw.innerHTML = FAQS.slice(0,5).map(renderFaqItem).join('');
  // Testimonials
  const tg=document.getElementById('testiGrid'); if(tg) tg.innerHTML = renderTestimonials();
  STORE.updateCartUI();
}

// ── SHOP ──
function initShop() { applyFilters(); }

function filterCat(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.cpill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilters();
  const titles = {
    all:'All Products', premium:'🏆 Ascovita Premium', spirulina:'🌊 Spirulina Range',
    effervescent:'🫧 Effervescent Range', ayurvedic:'🌿 Ayurvedic Wellness', energy:'⚡ Energy & Performance',
    combos:'🎁 Combos & Bundles', bestsellers:'🔥 Best Sellers', sale:'💰 On Sale', new:'🆕 New Launch',
    skin:'⭐ Skin & Glow', immunity:'💪 Immunity Boosters', brain:'🧠 Brain & Focus', weight:'🏋 Weight Management',
    moringa:'🌿 Moringa', vitamins:'💊 Vitamins', specialty:'⭐ Specialty'
  };
  const t = document.getElementById('shopTitle');
  if (t) t.textContent = titles[cat] || 'All Products';
}

function applyFilters() {
  // ✅ FIX 2: Never show hidden/inactive products in shop
  let prods = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  const goalTags = ['skin','immunity','energy','brain','weight'];
  if (currentCat === 'bestsellers') prods = prods.filter(p => p.tags.includes('bestseller'));
  else if (currentCat === 'sale') prods = prods.filter(p => p.salePrice || (p.tags && p.tags.includes('sale')));
  else if (currentCat === 'new') prods = prods.filter(p => p.tags.includes('new'));
  else if (goalTags.includes(currentCat)) prods = prods.filter(p => p.tags.includes(currentCat) || p.category === currentCat);
  else if (currentCat !== 'all') prods = prods.filter(p => p.category === currentCat);

  prods = prods.filter(p => { var px = p.salePrice || p.price; return px == null || px <= priceMax; });

  const rChecks = [...document.querySelectorAll('[id^=fr]:checked')].map(c => +c.value);
  if (rChecks.length) { const min = Math.min(...rChecks); prods = prods.filter(p => p.rating >= min); }
  if (document.getElementById('fSale')?.checked) prods = prods.filter(p => p.salePrice);
  if (document.getElementById('fNew')?.checked) prods = prods.filter(p => p.tags.includes('new'));
  if (document.getElementById('fBest')?.checked) prods = prods.filter(p => p.tags.includes('bestseller'));

  const sort = document.getElementById('sortSel')?.value;
  if (sort === 'plo') prods.sort((a,b) => (a.salePrice||a.price)-(b.salePrice||b.price));
  else if (sort === 'phi') prods.sort((a,b) => (b.salePrice||b.price)-(a.salePrice||a.price));
  else if (sort === 'rat') prods.sort((a,b) => b.rating-a.rating);

  const grid = document.getElementById('shopGrid');
  const empty = document.getElementById('shopEmpty');
  const cnt = document.getElementById('shopCount');
  if (!grid) return;
  grid.innerHTML = prods.length ? prods.map(p => renderProductCard(p)).join('') : '';
  if (empty) empty.style.display = prods.length ? 'none' : 'block';
  if (cnt) cnt.textContent = `Showing ${prods.length} product${prods.length!==1?'s':''}`;
}

function updatePrice(v) {
  priceMax = +v;
  const pd=document.getElementById('priceDisp'); if(pd) pd.textContent = v >= 2000 ? 'Any price' : `Up to ${fmt(+v)}`;
  applyFilters();
}

function clearFilters() {
  const pr=document.getElementById('priceRange'); if(pr) pr.value = 2000;
  priceMax = 2000;
  const pd2=document.getElementById('priceDisp'); if(pd2) pd2.textContent = 'Any price';
  document.querySelectorAll('[id^=fr], #fSale, #fNew, #fBest').forEach(c => { if(c) c.checked=false; });
  const ss=document.getElementById('sortSel'); if(ss) ss.value = 'def';
  currentCat = 'all';
  document.querySelectorAll('.cpill').forEach(p => p.classList.remove('active'));
  document.querySelector('.cpill[data-cat="all"]')?.classList.add('active');
  applyFilters();
}

// ── QUANTITY DISCOUNT WIDGET ──
// Tracks which tier is selected per product (productId → tierIndex)
const selectedTiers = {};

function buildTierWidget(p) {
  const tiers = p._backendTiers || QTY_TIERS[p.id];
  if (!tiers) return '';            // no tiers for this product
  const sel = selectedTiers[p.id] !== undefined ? selectedTiers[p.id] : 0;
  const t = tiers[sel];
  const saving = t.mrp - t.rate;

  return `
    <div class="qty-discount-wrap" id="tierWidget_${p.id}">
      <div class="qty-discount-header">
        <span class="spark">⚡</span>
        Buy More, Save More — Choose Your Pack Size
      </div>
      <div class="qty-tiers-grid">
        ${tiers.map((tier, i) => {
          const isSel = i === sel;
          const isBest = tier.discountPct === Math.max(...tiers.map(t=>t.discountPct));
          return `
          <div class="qty-tier${isSel ? ' selected' : ''}${isBest ? ' best-value' : ''}"
               onclick="selectTier(${p.id}, ${i})">
            <div class="tier-tabs">${tier.tabs}</div>
            <span class="tier-tabs-label">Tablets</span>
            <span class="tier-units-label" style="font-size:.62rem;color:rgba(255,255,255,.5);font-weight:500;margin-top:1px">${tier.tabs===15?'1 Pack':tier.tabs===30?'2 Packs':tier.tabs===45?'3 Packs':'4 Packs'}</span>
            <span class="tier-disc">${tier.discountPct}% OFF</span>
            <span class="tier-rate">₹${tier.rate.toLocaleString('en-IN')}</span>
            <span class="tier-mrp">₹${tier.mrp.toLocaleString('en-IN')}</span>
            <span class="tier-save-label">Save ₹${(tier.mrp-tier.rate).toLocaleString('en-IN')}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="qty-discount-footer">
        <span class="selected-summary">
          <strong>${t.tabs} Tablets</strong> for <strong>₹${t.rate.toLocaleString('en-IN')}</strong>
          (MRP ₹${t.mrp.toLocaleString('en-IN')})
        </span>
        <span class="savings-pill">You Save ₹${saving.toLocaleString('en-IN')}!</span>
      </div>
    </div>`;
}

function selectTier(productId, tierIdx) {
  selectedTiers[productId] = tierIdx;
  const p2 = PRODUCTS.find(p => p.id === productId);
  const tiers = (p2 && p2._backendTiers) || QTY_TIERS[productId];
  if (!tiers) return;
  const t = tiers[tierIdx];

  // Rebuild widget in place
  const widget = document.getElementById(`tierWidget_${productId}`);
  if (widget) {
    const p = PRODUCTS.find(p => p.id === productId);
    widget.outerHTML = buildTierWidget(p);
  }
  // Re-register after DOM replace
  // Also update the displayed price
  updatePriceDisplay(productId, tierIdx);
}

function updatePriceDisplay(productId, tierIdx) {
  const p3 = PRODUCTS.find(p => p.id === productId);
  const tiers = (p3 && p3._backendTiers) || QTY_TIERS[productId];
  if (!tiers) return;
  const t = tiers[tierIdx];
  const disc = Math.round((1 - t.rate / t.mrp) * 100);

  const salePriceEl = document.getElementById('dynSalePrice');
  const origPriceEl = document.getElementById('dynOrigPrice');
  const discTagEl   = document.getElementById('dynDiscTag');
  const savingEl    = document.getElementById('dynSaving');

  if (salePriceEl) {
    salePriceEl.textContent = `₹${t.rate.toLocaleString('en-IN')}`;
    salePriceEl.classList.remove('price-updated');
    void salePriceEl.offsetWidth; // reflow
    salePriceEl.classList.add('price-updated');
  }
  if (origPriceEl) origPriceEl.textContent = `₹${t.mrp.toLocaleString('en-IN')}`;
  if (discTagEl)   discTagEl.textContent = `Save ${disc}%`;
  if (savingEl)    savingEl.textContent  = `You save ₹${(t.mrp - t.rate).toLocaleString('en-IN')} on this pack!`;

  // Update Add to Cart button label
  const addBtn = document.getElementById('addCartBtn');
  if (addBtn) addBtn.dataset.tier = tierIdx;
}

// ── PRODUCT PAGE ──
function buildProductPage(p) {
  const rvs = REVIEWS[p.id] || [];
  const avg = rvs.reduce((s,r)=>s+r.rating,0)/rvs.length || p.rating;
  const related = PRODUCTS.filter(r=>r.category===p.category&&r.id!==p.id).slice(0,4);
  const rg=document.getElementById('relatedGrid'); if(rg) rg.innerHTML = related.map(r=>renderProductCard(r)).join('');

  // Determine tier for display
  const tiers = p._backendTiers || QTY_TIERS[p.id];
  const tierIdx = selectedTiers[p.id] !== undefined ? selectedTiers[p.id] : 0;
  const activeTier = tiers ? tiers[tierIdx] : null;
  const displayRate = activeTier ? activeTier.rate : (p.salePrice || p.price);
  const displayMRP  = activeTier ? activeTier.mrp  : p.price;
  const displayDisc = Math.round((1 - displayRate / displayMRP) * 100);
  const displaySaving = displayMRP - displayRate;

  const pdEl=document.getElementById('productDetail'); if(pdEl) pdEl.innerHTML = `
    ${buildMediaGallery(p)}
    <div>
      <div class="prod-brand">${p.brand}</div>
      <h1 class="prod-title">${p.name}</h1>
      <div class="prod-rating-row">${stars(avg)} <span class="review-ct">(${rvs.length + p.reviews} reviews)</span> <span class="write-rv" onclick="document.getElementById('rvFormWrap').scrollIntoView({behavior:'smooth'})">Write a Review</span></div>
      <div class="prod-price-block">
        <span class="prod-sale" id="dynSalePrice">&#x20B9;${displayRate.toLocaleString('en-IN')}</span>
        <span class="prod-orig" id="dynOrigPrice">&#x20B9;${displayMRP.toLocaleString('en-IN')}</span>
        ${displayDisc > 0 ? `<span class="prod-disc-tag" id="dynDiscTag">Save ${displayDisc}%</span>` : ''}
      </div>
      <div id="dynSaving" style="font-size:.8rem;color:var(--success);font-weight:600;margin-bottom:${tiers?'4px':'16px'}">
        ${displaySaving > 0 ? `&#x1F389; You save &#x20B9;${displaySaving.toLocaleString('en-IN')} on this pack!` : ''}
      </div>
      ${tiers ? buildTierWidget(p) : (p.offer ? `<div class="prod-offer-line">&#x1F389; ${p.offer}</div>` : '')}
      <div class="prod-stock">&#x2705; In Stock (${p.stock} units)</div>
      <p style="font-size:.88rem;color:var(--gray);line-height:1.8;margin-bottom:20px;">${p.description}</p>
      ${!tiers ? `<div class="qty-wrap"><button class="qty-btn" onclick="chQty(-1)">&#x2212;</button><span class="qty-num" id="pQtyDisp">1</span><button class="qty-btn" onclick="chQty(1)">+</button></div>` : ''}
      <button class="add-cart-btn" id="addCartBtn" data-tier="${tierIdx}" onclick="addToCartWithTier(${p.id})">&#x1F6D2; Add to Cart</button>
      <div class="stock-urgency" id="stockUrgency"></div>
      <div class="live-viewers"><span class="lv-dot"></span><span id="liveViewerCount">12</span> people viewing this right now</div>
      <button class="buy-now-btn" onclick="addToCartWithTier(${p.id});showPage('checkout')">&#x26A1; Buy Now</button>
      <div class="prod-features">
        <div class="feat-item"><span class="feat-ico">&#x1F331;</span>100% Organic</div>
        <div class="feat-item"><span class="feat-ico">&#x1F52C;</span>Lab Tested</div>
        <div class="feat-item"><span class="feat-ico">&#x2705;</span>FSSAI Approved</div>
        <div class="feat-item"><span class="feat-ico">&#x1F1EE;&#x1F1F3;</span>Made in India</div>
        <div class="feat-item"><span class="feat-ico">&#x21A9;&#xFE0F;</span>7-Day Returns</div>
        <div class="feat-item"><span class="feat-ico">&#x1F69A;</span>Free Ship &#x20B9;599+</div>
      </div>
      <div class="tabs">
        <button class="tab active" onclick="switchTab(this,'desc')">Description</button>
        <button class="tab" onclick="switchTab(this,'ingr')">Ingredients</button>
        <button class="tab" onclick="switchTab(this,'rvs')">Reviews (${rvs.length})</button>
        ${tiers ? `<button class="tab" onclick="switchTab(this,'pricing')">&#x1F4CB; Pricing</button>` : ''}
      </div>
      <div class="tab-content active" id="tab-desc">
        <p style="font-size:.88rem;color:#444;line-height:1.8;">${p.description}</p>
        <div style="background:var(--green-wash);border-radius:10px;padding:18px;margin-top:16px;"><div style="font-weight:700;font-size:.88rem;margin-bottom:10px;">&#x1F4CB; How to Use</div><p style="font-size:.83rem;color:var(--gray);line-height:1.75;">${p.howToUse}</p></div>
      </div>
      <div class="tab-content" id="tab-ingr">
        <div style="font-size:.88rem;line-height:1.8;color:#444;">
          <p style="margin-bottom:12px;font-weight:600;">Key Ingredients:</p>
          <ul style="margin-left:18px;color:var(--gray);">${(p.keyIngredients||[]).map(i=>`<li style="margin-bottom:7px;">${i}</li>`).join('')}</ul>
          <div style="margin-top:16px;padding:12px;background:var(--gold-pale);border-radius:9px;font-size:.78rem;color:var(--gold)">&#x26A0;&#xFE0F; Free from: Artificial colours, flavours, preservatives, heavy metals. 100% Natural.</div>
        </div>
      </div>
      <div class="tab-content" id="tab-rvs">
        <div class="rv-summary">
          <div class="rating-big"><div class="rv-big-num">${avg.toFixed(1)}</div><div class="rv-big-stars">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div><div style="font-size:.72rem;color:var(--gray)">${rvs.length} reviews</div></div>
          <div style="flex:1">${[5,4,3,2,1].map(s=>{const c=rvs.filter(r=>Math.round(r.rating)===s).length;const pct=rvs.length?(c/rvs.length)*100:(s===5?70:s===4?20:10);return`<div class="rv-bar-row"><span style="width:14px">${s}&#x2605;</span><div class="rv-bar-track"><div class="rv-bar-fill" style="width:${pct}%"></div></div><span>${Math.round(pct)}%</span></div>`;}).join('')}</div>
        </div>
        ${rvs.map(r=>`<div class="rv-card"><div class="rv-hdr"><div><span class="rv-name">${r.user}</span>${r.verified?'<span class="rv-verified">&#x2713; Verified</span>':''}</div><span class="rv-date">${r.date}</span></div><div class="rv-stars">${'&#x2605;'.repeat(r.rating)}${'&#x2606;'.repeat(5-r.rating)}</div><p class="rv-text">${r.text}</p></div>`).join('')}
        <div class="rv-form" id="rvFormWrap">
          <h3>Write a Review</h3>
          <div class="star-picker" id="starPicker">${[1,2,3,4,5].map(s=>`<span onclick="setRating(${s})" data-s="${s}">&#x2605;</span>`).join('')}</div>
          <input class="form-input" type="text" placeholder="Your name" id="rvName">
          <textarea class="form-input" placeholder="Share your experience with this product..." id="rvText"></textarea>
          <button class="btn-primary" style="width:100%;justify-content:center" onclick="submitReview()">Submit Review &#x1F331;</button>
        </div>
      </div>
      ${tiers ? `
      <div class="tab-content" id="tab-pricing">
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.85rem">
            <thead><tr style="background:var(--green);color:white">
              <th style="padding:12px 16px;text-align:left;border-radius:8px 0 0 0">Pack Size</th>
              <th style="padding:12px 16px;text-align:right">MRP (&#x20B9;)</th>
              <th style="padding:12px 16px;text-align:right">Your Price (&#x20B9;)</th>
              <th style="padding:12px 16px;text-align:right">Discount</th>
              <th style="padding:12px 16px;text-align:right;border-radius:0 8px 0 0">You Save</th>
            </tr></thead>
            <tbody>
              ${tiers.map((t,i)=>{const isBest=t.discountPct===Math.max(...tiers.map(x=>x.discountPct));return`<tr style="background:${isBest?'var(--gold-pale)':i%2?'var(--green-wash)':'white'};cursor:pointer" onclick="selectTier(${p.id},${i})"><td style="padding:12px 16px;font-weight:700">${t.tabs} Tabs${isBest?' <span style="background:var(--gold);color:white;font-size:.6rem;padding:2px 7px;border-radius:100px;font-weight:800;vertical-align:middle">BEST VALUE</span>':''}</td><td style="padding:12px 16px;text-align:right;text-decoration:line-through;color:var(--gray)">&#x20B9;${t.mrp.toLocaleString('en-IN')}</td><td style="padding:12px 16px;text-align:right;font-weight:800;color:var(--green)">&#x20B9;${t.rate.toLocaleString('en-IN')}</td><td style="padding:12px 16px;text-align:right"><span style="background:${isBest?'var(--gold)':'var(--gold-pale)'};color:${isBest?'white':'var(--gold)'};padding:3px 9px;border-radius:100px;font-weight:700;font-size:.78rem">${t.discountPct}% OFF</span></td><td style="padding:12px 16px;text-align:right;color:var(--success);font-weight:700">&#x20B9;${(t.mrp-t.rate).toLocaleString('en-IN')}</td></tr>`;}).join('')}
            </tbody>
          </table>
          <p style="font-size:.76rem;color:var(--gray);margin-top:12px">Click any row to select that pack. All prices incl. taxes.</p>
        </div>
      </div>` : ''}
    </div>
  `;
}

// Adds a tiered product to cart, recording which tier (pack size) was chosen
function addToCartWithTier(productId) {
  const p0 = PRODUCTS.find(p => p.id === productId);
  const tiers = (p0 && p0._backendTiers) || QTY_TIERS[productId];
  if (!tiers) {
    // No tier system — standard add to cart
    STORE.addToCart(productId, pQty);
    return;
  }
  const tierIdx = selectedTiers[productId] !== undefined ? selectedTiers[productId] : 0;
  const tier = tiers[tierIdx];
  const p = PRODUCTS.find(p => p.id === productId);

  // Physical packs: 15 tabs = 1 pack, 30 = 2, 45 = 3, 60 = 4
  const physicalPacks = tier.tabs / 15;
  // qty = number of BUNDLES (1 bundle = physicalPacks physical packs)
  const ex = STORE.cart.find(i => i.id === productId && i.tierIdx === tierIdx);
  if (ex) {
    ex.qty += 1; // add 1 more bundle
  } else {
    STORE.cart.push({
      id: productId,
      qty: 1, // 1 bundle
      tierIdx,
      tierTabs: tier.tabs,
      tierRate: tier.rate,         // total price for this pack bundle
      tierMRP:  tier.mrp,
      tierDisc: tier.discountPct,
      isBundle: physicalPacks > 1, // flag for cart display
    });
  }
  STORE.save();
  const packLabel = physicalPacks === 1 ? '1 Pack (15 tabs)' : `${physicalPacks} Packs (${tier.tabs} tabs)`;
  showToast(`${p.name} — ${packLabel} added to cart!`);

}


// ── 10-Media Gallery ──────────────────────────────────────────
var _galleryMedia = [];  // [{url, type, thumb}]
var _galleryIdx   = 0;

function buildMediaGallery(p) {
  // Build media array from p.media or fallback to flat fields
  var media = [];
  if (p.media && p.media.length) {
    media = p.media.slice(0, 10);
  } else {
    var urls = [p.image, p.image2, p.image3, p.image4, p.image5].filter(Boolean);
    media = urls.map(function(u) { return {url: u, type: 'image', thumb: u}; });
  }
  if (!media.length) media = [{url:'', type:'image', thumb:''}];
  // Normalize
  media = media.map(function(m) {
    if (typeof m === 'string') return {url:m, type:'image', thumb:m};
    return {url: m.url||m.src||'', type: m.type||'image', thumb: m.thumb||m.url||m.src||''};
  });
  _galleryMedia = media;
  _galleryIdx = 0;

  var mainHtml = renderGalleryMain(media[0], 0, media.length);
  var thumbsHtml = media.map(function(m, i) {
    var isVid = m.type === 'video';
    return '<div class="thumb' + (i===0?' active':'') + '" onclick="galleryGoto(' + i + ')" title="' + (i+1) + ' of ' + media.length + '">'
      + (isVid
        ? '<video src="' + m.url + '" muted preload="metadata" style="pointer-events:none"></video><span class="vid-play-ico">▶</span>'
        : '<img src="' + (m.thumb||m.url) + '" onerror="this.src=\'https://via.placeholder.com/62x62/EAF2E0/2D5016?text=+\'">')
      + '</div>';
  }).join('');

  return '<div class="prod-images media-gallery">'
    + '<div class="gallery-main" id="galleryMain" ondblclick="openLightbox(_galleryIdx)">'
    + mainHtml
    + (media.length > 1 ? '<button class="gallery-nav prev" onclick="event.stopPropagation();galleryStep(-1)">&#8249;</button><button class="gallery-nav next" onclick="event.stopPropagation();galleryStep(1)">&#8250;</button>' : '')
    + '</div>'
    + '<div class="thumb-strip">' + thumbsHtml + '</div>'
    + '</div>';
}

function renderGalleryMain(m, idx, total) {
  if (!m) return '';
  var isVid = m.type === 'video';
  var counter = total > 1 ? '<span style="position:absolute;bottom:8px;right:10px;background:rgba(0,0,0,0.45);color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:12px;">' + (idx+1) + '/' + total + '</span>' : '';
  if (isVid) {
    return '<video src="' + m.url + '" controls preload="metadata" playsinline style="width:100%;height:100%;object-fit:contain;border-radius:var(--radius)"></video>'
      + '<span class="vid-badge">▶ Video</span>' + counter;
  }
  return '<img src="' + (m.url||'https://via.placeholder.com/500x500/EAF2E0/2D5016?text=Ascovita') + '" id="mainImg" alt="Product" onclick="openLightbox(_galleryIdx)" onerror="this.src=\'https://via.placeholder.com/500x500/EAF2E0/2D5016?text=Ascovita\'">' + counter;
}

function galleryGoto(i) {
  if (!_galleryMedia.length) return;
  i = ((i % _galleryMedia.length) + _galleryMedia.length) % _galleryMedia.length;
  _galleryIdx = i;
  var gm = document.getElementById('galleryMain');
  if (!gm) return;
  var navs = gm.querySelectorAll('.gallery-nav');
  gm.innerHTML = renderGalleryMain(_galleryMedia[i], i, _galleryMedia.length);
  if (_galleryMedia.length > 1) {
    gm.innerHTML += '<button class="gallery-nav prev" onclick="event.stopPropagation();galleryStep(-1)">&#8249;</button><button class="gallery-nav next" onclick="event.stopPropagation();galleryStep(1)">&#8250;</button>';
    gm.querySelector('img') && (gm.querySelector('img').onclick = function(){ openLightbox(_galleryIdx); });
  }
  document.querySelectorAll('.thumb-strip .thumb').forEach(function(t,j){ t.classList.toggle('active', j===i); });
}

function galleryStep(dir) {
  galleryGoto(_galleryIdx + dir);
}

// Lightbox
function openLightbox(idx) {
  var lb = document.getElementById('galleryLightbox');
  if (!lb) return;
  lb.classList.add('open');
  lbShow(idx);
}
function closeLightbox() {
  var lb = document.getElementById('galleryLightbox');
  if (lb) lb.classList.remove('open');
}
function lbShow(i) {
  i = ((i % _galleryMedia.length) + _galleryMedia.length) % _galleryMedia.length;
  _galleryIdx = i;
  var m = _galleryMedia[i];
  var lbContent = document.getElementById('lbContent');
  if (!lbContent) return;
  var isVid = m && m.type === 'video';
  lbContent.innerHTML = isVid
    ? '<video src="' + m.url + '" controls autoplay playsinline style="max-width:92vw;max-height:88vh;border-radius:10px"></video>'
    : '<img src="' + (m ? m.url : '') + '" style="max-width:92vw;max-height:88vh;object-fit:contain;border-radius:10px" onerror="this.src=\'https://via.placeholder.com/600x600?text=Ascovita\'">';
  var lbCtr = document.getElementById('lbCounter');
  if (lbCtr) lbCtr.textContent = (i+1) + ' / ' + _galleryMedia.length;
}
function lbStep(dir) {
  lbShow(_galleryIdx + dir);
}
// Close lightbox on background click
document.addEventListener('DOMContentLoaded', function(){
  var lb = document.getElementById('galleryLightbox');
  if(lb) lb.addEventListener('click', function(e){ if(e.target===lb) closeLightbox(); });
  // Keyboard navigation
  document.addEventListener('keydown', function(e){
    var lb = document.getElementById('galleryLightbox');
    if(!lb || !lb.classList.contains('open')) return;
    if(e.key==='ArrowLeft') lbStep(-1);
    if(e.key==='ArrowRight') lbStep(1);
    if(e.key==='Escape') closeLightbox();
  });
});

function chQty(d) { pQty = Math.max(1, pQty + d); document.getElementById('pQtyDisp').textContent = pQty; }
function switchTab(btn, id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id)?.classList.add('active');
}
function setRating(v) {
  selectedRating = v;
  document.querySelectorAll('#starPicker span').forEach((s,i) => s.classList.toggle('lit', i < v));
}
function submitReview() {
  const name = document.getElementById('rvName')?.value.trim();
  const text = document.getElementById('rvText')?.value.trim();
  if (!name || !text || !selectedRating) { showToast('Please fill all fields and select a rating!','error'); return; }
  if (currentProduct) {
    REVIEWS[currentProduct.id] = REVIEWS[currentProduct.id]||[];
    REVIEWS[currentProduct.id].unshift({ user:name, rating:selectedRating, text, date:'Just now', verified:false });
    showToast('Review submitted! Thank you 🌿');
    buildProductPage(currentProduct);
    switchTab(document.querySelectorAll('.tab')[2], 'rvs');
  }
}

// ── CART ──
function renderCart() {
  const el = document.getElementById('cartContent');
  if (!el) return;
  if (STORE.cart.length === 0) {
    el.innerHTML = `<div class="empty-cart"><div style="font-size:4rem;margin-bottom:20px">🛒</div><h2>Your cart is empty</h2><p style="color:var(--gray);margin:10px 0 24px">Discover Ascovita's organic supplement range</p><button class="btn-primary" onclick="showPage('shop')">Shop Now →</button><div style="margin-top:28px;background:var(--green-wash);border-radius:var(--radius);padding:20px;max-width:340px;margin:28px auto 0;"><div style="font-weight:700;font-size:.88rem;margin-bottom:6px">⚡ Buy More, Save More!</div><p style="font-size:.8rem;color:var(--gray)">Select a larger pack size on any product page to unlock bigger discounts — up to 50% OFF.</p></div></div>`;
    return;
  }

  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);

  // Unified discount — check both activePromoCode and appliedDiscount
  let disc = 0, discLabel = '';
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    if (activePromoCode.type === 'pct') disc = Math.round(sub * activePromoCode.value / 100);
    else if (activePromoCode.type === 'flat') disc = Math.min(activePromoCode.value, sub);
    discLabel = activePromoCode.label || '';
  } else if (typeof appliedDiscount !== 'undefined' && appliedDiscount) {
    disc = appliedDiscount.type === 'percent' ? Math.round(sub * appliedDiscount.value / 100) : appliedDiscount.value;
    discLabel = appliedDiscount.label || '';
  }

  const ship = 0; // Free shipping online
  const total = sub - disc + ship;

  // Count total physical packs for display
  const totalPacks = STORE.cart.reduce((s, item) => {
    if (item.tierTabs) return s + (item.tierTabs / 15) * item.qty;
    return s + item.qty;
  }, 0);

  el.innerHTML = `
    <div class="cart-layout">
      <div>
        <div class="cart-items-box">
          ${STORE.cart.map(item => {
            const p = PRODUCTS.find(p => p.id === item.id);
            if (!p) return '';
            const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
            const unitMRP   = item.tierMRP  !== undefined ? item.tierMRP  : p.price;
            const discPct   = item.tierDisc !== undefined ? item.tierDisc : (p.salePrice ? Math.round((1-p.salePrice/p.price)*100) : 0);

            // Build a clear pack label: e.g. "4 Pack · 60 tabs · 35% OFF"
            let packLabel = '';
            if (item.tierTabs !== undefined) {
              const numPacks = item.tierTabs / 15;
              packLabel = `${numPacks} Pack${numPacks > 1 ? 's' : ''} · ${item.tierTabs} tabs${discPct > 0 ? ' · ' + discPct + '% OFF' : ''}`;
            }

            return `<div class="cart-row">
              <img class="cart-img" src="${p.image}" alt="${p.name}" onclick="openProduct(${p.id})" style="cursor:pointer" onerror="this.src='https://via.placeholder.com/80x80/EAF2E0/2D5016?text=A'">
              <div>
                <div class="ci-name" onclick="openProduct(${p.id})" style="cursor:pointer">${p.name}</div>
                ${packLabel ? `<div style="font-size:.72rem;background:var(--green-pale);color:var(--green);display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;margin-bottom:5px;font-weight:600">📦 ${packLabel}</div>` : ''}
                <div class="ci-price">₹${unitPrice.toLocaleString('en-IN')}<span class="ci-orig">${unitMRP !== unitPrice ? ' ₹' + unitMRP.toLocaleString('en-IN') : ''}</span>${discPct > 0 ? `<span style="background:#ff4757;color:white;font-size:.58rem;font-weight:800;padding:2px 6px;border-radius:100px;margin-left:6px">${discPct}% OFF</span>` : ''}</div>
                ${unitMRP !== unitPrice ? `<div style="font-size:.7rem;color:var(--success);font-weight:600;margin-top:2px">💰 Save ₹${((unitMRP - unitPrice) * item.qty).toLocaleString('en-IN')} on this item</div>` : ''}
              </div>
              <div style="text-align:right">
                <div style="font-weight:700;margin-bottom:8px;color:var(--dark)">₹${(unitPrice * item.qty).toLocaleString('en-IN')}</div>
                <div class="qty-wrap" style="margin-bottom:8px">
                  <button class="qty-btn" onclick="updateCartQty(${item.id},${item.tierIdx !== undefined ? item.tierIdx : -1},${item.qty - 1})">−</button>
                  <span class="qty-num">${item.qty}</span>
                  <button class="qty-btn" onclick="updateCartQty(${item.id},${item.tierIdx !== undefined ? item.tierIdx : -1},${item.qty + 1})">+</button>
                </div>
                <button class="ci-remove" onclick="removeCartItem(${item.id},${item.tierIdx !== undefined ? item.tierIdx : -1})">🗑️</button>
              </div>
            </div>`;
          }).join('')}
          <div style="padding:18px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <button class="btn-outline" onclick="showPage('shop')">← Continue Shopping</button>
            <span style="font-size:.82rem;color:var(--gray)">${(sub-disc) >= 599 ? '🎉 You qualify for free shipping!' : 'Add ₹' + (599 - (sub-disc)) + ' more for free shipping'}</span>
          </div>
        </div>
      </div>
      <div class="cart-summary-box">
        <h2>Order Summary</h2>
        <div class="sum-row"><span>Subtotal (${totalPacks} pack${totalPacks !== 1 ? 's' : ''})</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
        ${disc > 0 ? `
          <div class="sum-row" style="color:var(--success);font-weight:700">
            <span>🏷️ ${discLabel ? discLabel : 'Discount'}</span>
            <span>-₹${disc.toLocaleString('en-IN')}</span>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:.75rem;color:#166534;font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:6px">
            🎉 Total savings on this order: <strong>₹${disc.toLocaleString('en-IN')}</strong>
          </div>` : ''}
        <div class="sum-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success);font-weight:700">FREE 🎉</span>' : '₹' + ship}</span></div>
        <hr style="border:none;border-top:1px solid var(--light-gray);margin:8px 0">
        <div class="sum-row total"><span>Total</span><span style="color:var(--green)">₹${total.toLocaleString('en-IN')}</span></div>
        <div style="font-weight:600;font-size:.82rem;margin:16px 0 8px">Apply Coupon Code</div>
        ${(disc > 0 && discLabel) ? `<div class="disc-applied">✅ ${discLabel} applied! <span style="cursor:pointer;margin-left:auto" onclick="activePromoCode=null;appliedDiscount=null;renderCart()">✕</span></div>` : `
          <div class="coupon-row">
            <input type="text" id="couponInput" placeholder="Enter code" style="text-transform:uppercase" onkeydown="if(event.key==='Enter')applyCode()">
            <button onclick="applyCode()">Apply</button>
          </div>
          <div style="font-size:.72rem;color:var(--gray);margin-bottom:12px">Enter your promo code above</div>
        `}
        <button class="checkout-btn" onclick="showPage('checkout')">Proceed to Checkout →</button>
        <div class="pay-icons">
          <span class="pay-icon">UPI</span><span class="pay-icon">Visa</span><span class="pay-icon">MC</span><span class="pay-icon">RuPay</span>
        </div>
        <div style="text-align:center;font-size:.72rem;color:var(--gray);margin-top:10px">🔒 Secured by Cashfree</div>
      </div>
    </div>
    ${renderCartUpsell()}
    `;
}

function renderCartUpsell() {
  var cartIds = STORE.cart.map(function(i){ return i.id; });
  var hasSkin = STORE.cart.some(function(i){ var p=PRODUCTS.find(function(x){return x.id===i.id;}); return p&&p.tags&&p.tags.indexOf('skin')>-1; });
  var hasImmunity = STORE.cart.some(function(i){ var p=PRODUCTS.find(function(x){return x.id===i.id;}); return p&&p.tags&&(p.tags.indexOf('immunity')>-1||p.category==='spirulina'); });
  var hasWeight = STORE.cart.some(function(i){ var p=PRODUCTS.find(function(x){return x.id===i.id;}); return p&&p.tags&&p.tags.indexOf('weight')>-1; });
  var candidates = [];
  if (hasSkin) PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('skin')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  if (hasImmunity) PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('immunity')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  if (hasWeight) PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('weight')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('bestseller')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  var seen = {};
  var ups = candidates.filter(function(p){ if(seen[p.id])return false; seen[p.id]=true; return true; }).slice(0,4);
  if (!ups.length) return '';
  var sub = STORE.cart.reduce(function(s,item){ var p=PRODUCTS.find(function(x){return x.id===item.id;}); if(!p)return s; var up=item.tierRate!==undefined?item.tierRate:(p.salePrice||p.price); return s+up*item.qty; }, 0);
  var shipMsg = sub < 599
    ? '<div style="background:linear-gradient(135deg,#fff3cd,#ffe8a3);border:1px solid #D4A520;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px"><span style="font-size:1.4rem">&#x1F69A;</span><div><div style="font-size:.84rem;font-weight:700;color:#7a5800">Add just <strong>&#8377;' + (599-sub) + '</strong> more to unlock FREE shipping!</div><div style="font-size:.74rem;color:#9a7010;margin-top:2px">You\'re so close &#x1F382;</div></div></div>'
    : '<div style="background:linear-gradient(135deg,#d4edda,#b8dfc5);border:1px solid #28a745;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px"><span style="font-size:1.4rem">&#x1F381;</span><div><div style="font-size:.84rem;font-weight:700;color:#155724">&#x1F389; FREE shipping unlocked!</div><div style="font-size:.74rem;color:#1e7e34;margin-top:2px">Your order qualifies for free delivery</div></div></div>';
  var cards = ups.map(function(p){
    var price = p.salePrice||p.price;
    var disc = p.salePrice ? Math.round((1-p.salePrice/p.price)*100) : 0;
    var discBadge = disc > 0 ? '<span style="font-size:.68rem;color:#999;text-decoration:line-through">&#x20B9;' + p.price.toLocaleString('en-IN') + '</span> <span style="background:#ff4757;color:white;font-size:.62rem;font-weight:700;padding:1px 5px;border-radius:100px">' + disc + '% OFF</span>' : '';
    return '<div id="upsell_' + p.id + '" style="background:white;border-radius:14px;padding:14px;border:1px solid rgba(240,180,41,.3);display:flex;gap:10px;align-items:flex-start;cursor:pointer" onclick="addUpsellToCart(' + p.id + ')">'
      + '<img src="' + p.image + '" style="width:54px;height:54px;object-fit:cover;border-radius:10px;flex-shrink:0" onerror="this.src=\'https://via.placeholder.com/54x54/EAF2E0/2D5016?text=A\'" alt="' + p.name + '">'
      + '<div style="flex:1;min-width:0"><div style="font-size:.78rem;font-weight:700;color:#1a1a1a;line-height:1.35;margin-bottom:5px">' + p.name + '</div>'
      + '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap"><span style="font-size:.88rem;font-weight:800;color:var(--green)">&#x20B9;' + price.toLocaleString('en-IN') + '</span>' + discBadge + '</div>'
      + '<button style="margin-top:8px;background:var(--green);color:white;border:none;border-radius:100px;padding:5px 14px;font-size:.72rem;font-weight:700;cursor:pointer;font-family:var(--font-body)" onclick="event.stopPropagation();addUpsellToCart(' + p.id + ')">+ Add</button></div></div>';
  }).join('');
  return '<div style="margin-top:32px"><div style="background:linear-gradient(135deg,#fffdf0,#fff8e0);border:2px solid #f0b429;border-radius:20px;padding:26px">'
    + shipMsg
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><div><div style="font-size:.7rem;color:#b8860b;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">&#x1F4A1; Complete Your Wellness Stack</div><div style="font-size:1rem;font-weight:800;color:#1a1a1a;margin-top:3px">Customers Also Bought</div></div><span style="background:#f0b429;color:white;font-size:.69rem;font-weight:700;padding:3px 10px;border-radius:100px">SAVE MORE</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">' + cards + '</div>'
    + '</div></div>';
}

function addUpsellToCart(productId) {
  var p = PRODUCTS.find(function(x){ return x.id === productId; });
  if (!p) return;
  var existing = STORE.cart.find(function(i){ return i.id === productId && i.tierIdx === undefined; });
  if (existing) { existing.qty++; } else { STORE.cart.push({id:productId, qty:1}); }
  STORE.save(); STORE.updateCartUI();
  showToast('&#x1F33F; ' + p.name + ' added!', 'success');
  setTimeout(function(){ renderCart(); }, 300);
}


// Cart item helpers that handle both tiered and non-tiered items
function updateCartQty(productId, tierIdx, newQty) {
  if (newQty < 1) { removeCartItem(productId, tierIdx); return; }
  const item = STORE.cart.find(i => i.id === productId && (tierIdx === -1 ? i.tierIdx === undefined : i.tierIdx === tierIdx));
  if (item) { item.qty = newQty; STORE.save(); }
  renderCart();
}
function removeCartItem(productId, tierIdx) {
  STORE.cart = STORE.cart.filter(i => !(i.id === productId && (tierIdx === -1 ? i.tierIdx === undefined : i.tierIdx === tierIdx)));
  STORE.save();
  renderCart();
}

async function applyCode() {
  const input = document.getElementById('couponInput');
  const code = input?.value?.trim().toUpperCase();
  if (!code) return;

  // Local test codes only
  if (typeof PROMO_CODES !== 'undefined' && PROMO_CODES[code]) {
    const promo = PROMO_CODES[code];
    activePromoCode = { code, ...promo };
    appliedDiscount = { label: promo.label, type: promo.type === 'pct' ? 'percent' : 'flat', value: promo.value };
    showToast(`🏷️ ${code} applied — ${promo.label}!`);
    renderCart();
    return;
  }

  // All real codes come from backend
  const subtotal = STORE.cart.reduce((s,i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return s + ((p?.salePrice || p?.price || 0) * i.qty);
  }, 0);
  try {
    const backendPromo = await validateCouponWithBackend(code, subtotal);
    if (backendPromo) {
      const type = backendPromo.type === 'percent' ? 'pct' : 'flat';
      activePromoCode = { code, type, value: backendPromo.value, label: backendPromo.label || `${code} applied` };
      appliedDiscount = { label: activePromoCode.label, type: backendPromo.type, value: backendPromo.value };
      showToast(`🏷️ ${code} applied — ${activePromoCode.label}!`);
      renderCart();
      return;
    }
  } catch(e) {}

  showToast('❌ Invalid or expired code. Check admin for active codes.', 'error');
}

// ── CHECKOUT ──
function updateCodBtnNote() {
  const note = document.getElementById('codBtnNote');
  if (!note) return;
  const { sub, disc } = getOrderTotal();
  const net = sub - disc;
  note.textContent = net >= 599 ? '✅ Free COD on your order!' : '+₹60 COD charge · Free if order ≥ ₹599';
  note.style.color = net >= 599 ? '#d4edda' : 'rgba(255,255,255,0.85)';
}

function renderCheckoutSummary() {
  const el = document.getElementById('ckSummary');
  if (!el) return;
  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);

  // Use activePromoCode (the working variable) — fix for promo not affecting price
  let disc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    if (activePromoCode.type === 'pct') disc = Math.round(sub * activePromoCode.value / 100);
    else if (activePromoCode.type === 'flat') disc = Math.min(activePromoCode.value, sub);
  } else if (typeof appliedDiscount !== 'undefined' && appliedDiscount) {
    disc = appliedDiscount.type==='percent' ? Math.round(sub*appliedDiscount.value/100) : appliedDiscount.value;
  }

  const ship = 0; // Free shipping online
  const total = sub - disc + ship;

  el.innerHTML = `
    ${STORE.cart.map(item => {
      const p = PRODUCTS.find(p => p.id === item.id);
      if (!p) return '';
      const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
      const packLabel = item.tierTabs ? ` (${item.tierTabs} tabs)` : '';
      // Show the tier label (e.g. "3 Pack") if available
      const tierLabel = item.tierLabel ? ` — ${item.tierLabel}` : '';
      return `<div style="display:flex;gap:10px;margin-bottom:12px;align-items:center">
        <img src="${p.image}" style="width:46px;height:46px;border-radius:8px;object-fit:contain;background:var(--off-white);padding:4px" onerror="this.src='https://via.placeholder.com/46/EAF2E0/2D5016?text=A'">
        <div style="flex:1">
          <div style="font-size:.8rem;font-weight:600">${p.name}${packLabel}${tierLabel}</div>
          <div style="font-size:.72rem;color:var(--gray)">Qty: ${item.qty} × ₹${unitPrice.toLocaleString('en-IN')}</div>
        </div>
        <div style="font-weight:700;font-size:.85rem">₹${(unitPrice * item.qty).toLocaleString('en-IN')}</div>
      </div>`;
    }).join('')}
    <hr style="border:none;border-top:1px solid var(--light-gray);margin:12px 0">
    <div class="sum-row"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
    ${disc > 0 ? `<div class="sum-row" style="color:var(--success)"><span>🏷️ Discount</span><span>-₹${disc.toLocaleString('en-IN')}</span></div>` : ''}
    <div class="sum-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success);font-weight:700">FREE</span>' : '₹' + ship}</span></div>
    <hr style="border:none;border-top:1px solid var(--light-gray);margin:8px 0">
    <div class="sum-row total"><span>Total</span><span style="color:var(--green);font-size:1.1rem">₹${total.toLocaleString('en-IN')}</span></div>`;
}

function selPayMethod(el) { /* handled by new payment modal */ }

function placeOrder() {
  // Route to the real payment gateway
  initiatePayment();
}

// ── BLOG ──
function renderBlogCard(b) {
  return `<a class="blog-card" href="#" onclick="return false">
    <img class="blog-img" src="${b.img}" alt="${b.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=60'">
    <div class="blog-body">
      <span class="blog-tag">${b.tag}</span>
      <h3 class="blog-title">${b.title}</h3>
      <p class="blog-exc">${b.excerpt}</p>
      <div class="blog-meta"><span>📅 ${b.date}</span><span>⏱ ${b.readTime}</span><span>✍ ${b.author}</span></div>
    </div>
  </a>`;
}
function renderFullBlog() { const el=document.getElementById('fullBlogGrid'); if(el) el.innerHTML=BLOGS.map(renderBlogCard).join(''); }

// ── FAQ ──
function renderFaqItem(f) {
  return `<div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">${f.q}<span class="faq-icon">+</span></button><div class="faq-a"><div class="faq-a-inner">${f.a}</div></div></div>`;
}
function renderFullFaq() {
  const el=document.getElementById('fullFaqWrap'); if(!el) return;
  const cats=[...new Set(FAQS.map(f=>f.cat))];
  el.innerHTML=cats.map(c=>`<h2 style="font-size:1.1rem;font-weight:700;color:var(--green);margin:28px 0 14px;padding-bottom:7px;border-bottom:2px solid var(--green-pale)">${c}</h2>${FAQS.filter(f=>f.cat===c).map(renderFaqItem).join('')}`).join('');
}
function toggleFaq(btn) {
  const item=btn.parentElement, ans=item.querySelector('.faq-a'), open=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i=>{i.classList.remove('open');i.querySelector('.faq-a').style.maxHeight='0';});
  if(!open){item.classList.add('open');ans.style.maxHeight=ans.scrollHeight+'px';}
}

// ── TESTIMONIALS ──
function renderTestimonials() {
  const testi=[
    {stars:5,text:'"Moringa Green Apple has become my morning ritual. My energy levels have transformed in 3 weeks. The taste is genuinely delicious – not like medicine at all!"',name:'Kavya Patel',loc:'Ahmedabad, Gujarat',ico:'👩'},
    {stars:5,text:'"B1+Biotin Guava is magical for hair. My hair fall dropped dramatically. I tell every woman in my family to get this. Ascovita is a brand I trust completely."',name:'Deepa Nair',loc:'Kochi, Kerala',ico:'👩'},
    {stars:5,text:'"Spirulina Vita Plus improved my haemoglobin from 9.2 to 11.8 in 3 months! My doctor was impressed. Best investment in my health I\'ve ever made."',name:'Sunita Rao',loc:'Hyderabad, Telangana',ico:'👩'},
    {stars:5,text:'"Glutathione has genuinely improved my skin tone. I noticed the change within a month. The effervescent format means fast absorption. Worth every rupee."',name:'Meera Sharma',loc:'Mumbai, Maharashtra',ico:'👩'},
    {stars:4,text:'"Multidiata covers all my nutritional bases at a very affordable price. My B12 deficiency has improved significantly as confirmed by recent blood reports."',name:'Rahul Kumar',loc:'Delhi',ico:'👨'},
    {stars:5,text:'"The Moringa Duo Pack is great value. Alternating flavours keeps it fun. Ascovita packaging is also very neat – feels premium."',name:'Anjali Mehta',loc:'Pune, Maharashtra',ico:'👩'},
  ];
  return testi.map(t=>`<div class="testi-card"><div class="testi-stars">${'★'.repeat(t.stars)}</div><p class="testi-text">${t.text}</p><div class="testi-user"><div class="testi-avatar">${t.ico}</div><div><div class="testi-name">${t.name}</div><div class="testi-loc">${t.loc}</div></div></div></div>`).join('');
}

// ── CAROUSEL ──
const totalSlides=3;
function moveCarousel(d) { carouselIdx=(carouselIdx+d+totalSlides)%totalSlides; goSlide(carouselIdx); }
function goSlide(i) {
  carouselIdx=i;
  const ct=document.getElementById('carouselTrack'); if(ct) ct.style.transform=`translateX(-${i*100}%)`;
  document.querySelectorAll('.c-dot').forEach((d,j)=>d.classList.toggle('active',j===i));
}
document.addEventListener('DOMContentLoaded', function(){ setInterval(function(){ moveCarousel(1); }, 5500); });

// ── UTILS ──
function copyCode(code) { navigator.clipboard?.writeText(code).catch(()=>{}); showToast(`Code "${code}" copied! 🌿`); }
function subscribeNL() {
  const e=document.getElementById('nlEmail')?.value;
  if(!e||!e.includes('@')){showToast('Please enter a valid email','error');return;}
  showToast('Subscribed! Welcome to the Ascovita family 🌿');
  if(document.getElementById('nlEmail')) document.getElementById('nlEmail').value='';
}

// ── INIT ──
function bootApp() {
  try { STORE.init(); } catch(e) { console.error('STORE init:', e); }
  try { initCashfree(); } catch(e) {}
  try { renderFullFaq(); } catch(e) {}
  try { const hfw2=document.getElementById('homeFaqWrap'); if(hfw2) hfw2.innerHTML = FAQS.slice(0,5).map(renderFaqItem).join(''); } catch(e) {}
  // 🔗 Sync live product data from Supabase backend (non-blocking)
  syncProductsFromBackend();

  // 📡 Ping backend to register this visitor session (for Live Visitors in admin)
  (function pingVisitor() {
    try {
      const page = document.title || window.location.pathname;
      const device = /Mobi|Android/i.test(navigator.userAgent) ? '📱 Mobile' : '💻 Desktop';
      const sessionId = sessionStorage.getItem('asc_sid') || (() => {
        const id = Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem('asc_sid', id);
        return id;
      })();
      const payload = { session_id: sessionId, page, device, ts: Date.now() };
      fetch(`${API_BASE}/api/visitors/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {}); // silently ignore if backend offline
      // Re-ping every 4 minutes to keep session alive
      setInterval(() => {
        payload.ts = Date.now();
        payload.page = document.title || window.location.pathname;
        fetch(`${API_BASE}/api/visitors/ping`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), keepalive: true
        }).catch(() => {});
      }, 4 * 60 * 1000);
    } catch(e) {}
  })();

  // ── GitHub Pages SPA routing fix ──
  // When 404.html catches /about etc., it redirects to /?p=%2Fabout
  // We decode that here and show the right page, then clean the URL
  const _spParam = new URLSearchParams(window.location.search).get('p');
  if (_spParam) {
    try { history.replaceState(null, '', _spParam); } catch(e) {}
  }

  // Handle direct URL with clean path (e.g. ascovita.com/about) OR legacy hash (ascovita.com/#shop)
  const _fullPath = (_spParam || window.location.pathname).replace(/^\//, '').trim();
  const _pathParts = _fullPath.split('/');
  const _pathPage = _pathParts[0];
  const _pathSlug = _pathParts[1] || null; // e.g. 'glutathione-effervescent' from /product/glutathione-effervescent
  const _hashPage = window.location.hash.replace('#', '').trim();
  const _initPage = _pathPage || _hashPage;
  const _validPages = ['home','shop','blog','about','b2b','contact','faq','advisor','product'];
  if (_initPage && _validPages.includes(_initPage)) {
    if (_initPage === 'product' && _pathSlug) {
      // Find product by slug and open it
      setTimeout(function() {
        if (typeof slugify === 'function' && typeof PRODUCTS !== 'undefined') {
          const prod = PRODUCTS.find(p => slugify(p.name) === _pathSlug);
          if (prod) openProduct(prod.id);
          else showPage('shop');
        }
      }, 300);
    } else {
      setTimeout(function() { showPage(_initPage); }, 200);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    const state = e.state || {};
    const pathParts = window.location.pathname.replace(/^\//, '').split('/');
    const pg = state.page || pathParts[0] || 'home';
    const slug = state.id ? null : pathParts[1];
    if (pg === 'product') {
      const prodId = state.id || (typeof slugify === 'function' && PRODUCTS.find(p => slugify(p.name) === slug)?.id);
      if (prodId) { currentProduct = PRODUCTS.find(p => p.id === prodId); buildProductPage(currentProduct); }
    }
    if (_validPages.includes(pg)) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const el = document.getElementById('page-' + pg);
      if (el) { el.classList.add('active'); window.scrollTo({top:0}); currentPage = pg; }
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === pg));
    }
  });

  // ── Handle Cashfree redirect return ──
  var sp = new URLSearchParams(window.location.search);
  var cfoid = sp.get('cf_order');
  if (cfoid) {
    try { history.replaceState({}, '', window.location.pathname); } catch(e) { /* suppressed: sandboxed iframe preview */ }
    var sv = localStorage.getItem('asc_pend_' + cfoid);
    if (sv) {
      try {
        var pd = JSON.parse(sv);
        localStorage.removeItem('asc_pend_' + cfoid);
        var apiEp = API_BASE;
        // Show processing screen while verifying
        document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
        showProcessingScreen(cfoid, pd.total, 'redirect');
        updateProcessingStatus(70, 'Verifying payment...');
        fetch(apiEp + '/api/verify-order/' + cfoid, {})
          .then(function(r){ return r.json(); })
          .then(function(d){
            var st = (d.order_status || d.payment_status || '').toUpperCase();
            // ACTIVE = order created but not paid. PAID/SUCCESS = confirmed payment only.
            var isPaid = (st === 'PAID' || st === 'SUCCESS');
            var isCancelled = (st === 'ACTIVE' || st === 'PENDING' || st === 'CANCELLED' || st === 'EXPIRED' || st === '');
            if (isPaid) {
              updateProcessingStatus(100, 'Payment confirmed!');
              setTimeout(function(){ hideProcessingScreen(); finalizeOrder(cfoid, pd.formData, pd.total, 'redirect'); }, 800);
            } else {
              // Not paid — show clear message, do NOT finalize
              hideProcessingScreen();
              initHome();
              var msg = isCancelled
                ? 'Payment was not completed. Your cart has been saved — please try again.'
                : 'Payment not confirmed (status: ' + st + '). If money was deducted, contact +91 98985 82650 with Order ID: ' + cfoid;
              setTimeout(function(){
                showPaymentError(msg, cfoid, pd.formData, pd.total, 'redirect');
              }, 400);
            }
          }).catch(function(err){
            // Network error during verification — do NOT finalize, show safe error
            hideProcessingScreen();
            initHome();
            setTimeout(function(){
              showPaymentError('Could not verify payment due to network error. If money was deducted, contact +91 98985 82650 with Order ID: ' + cfoid, cfoid, pd.formData, pd.total, 'redirect');
            }, 400);
          });
        return; // Don't call initHome below
      } catch(e) {}
    }
  }

  try { initHome(); } catch(e) { console.error('initHome:', e); }
  // Ensure home page is shown
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var home = document.getElementById('page-home');
  if (home) home.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function(){ bootApp(); });
// Fallback for Hostinger CDN edge case where DOMContentLoaded may already have fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function(){ bootApp(); }, 50);
}
