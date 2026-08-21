// Extracted from index.html (line 10786) by Manus SEO pass — load order preserved

// ══════════════════════════════════════════════
// CHECKOUT QUANTITY CONTROLS + RECOMMENDATIONS
// ══════════════════════════════════════════════

function ckFindItem(id, tierIdx) {
  return STORE.cart.find(i => i.id === id && (tierIdx >= 0 ? i.tierIdx === tierIdx : (i.tierIdx === undefined || i.tierIdx === null)));
}

function ckRemoveItem(id, tierIdx) {
  const index = STORE.cart.findIndex(i => i.id === id && (tierIdx >= 0 ? i.tierIdx === tierIdx : (i.tierIdx === undefined || i.tierIdx === null)));
  if (index < 0 || !confirm('Remove this item from your cart?')) return;
  STORE.cart.splice(index, 1);
  STORE.save();
  renderCheckoutSummary();
  renderCkRecommendations();
  renderSideCart();
}

function ckUpdateQty(id, newQty, tierIdx) {
  if (newQty < 1) { ckRemoveItem(id, tierIdx); return; }
  const item = ckFindItem(id, tierIdx);
  if (item) { item.qty = Math.max(1, Number(newQty) || 1); STORE.save(); }
  renderCheckoutSummary();
  renderCkRecommendations();
  renderSideCart();
}

function renderCkRecommendations() {
  const sec = document.getElementById('ckRecoSection');
  const el  = document.getElementById('ckRecoItems');
  if (!sec || !el || typeof PRODUCTS === 'undefined') return;
  const cartIds = STORE.cart.map(i => i.id);
  if (cartIds.length === 0) { sec.style.display = 'none'; return; }

  // Get categories of cart items
  const cartCategories = [...new Set(STORE.cart.map(i => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return p ? p.category : null;
  }).filter(Boolean))];

  // Score products: same category = 3pts, has tags in common = 1pt each, not in cart = eligible
  const scored = PRODUCTS
    .filter(p => !cartIds.includes(p.id))
    .map(p => {
      let score = 0;
      if (cartCategories.includes(p.category)) score += 3;
      const cartTags = STORE.cart.flatMap(i => { const cp=PRODUCTS.find(x=>x.id===i.id); return cp?cp.tags:[]; });
      (p.tags||[]).forEach(t => { if(cartTags.includes(t)) score++; });
      if ((p.tags||[]).includes('bestseller')) score += 2;
      if ((p.tags||[]).includes('featured'))   score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.p);

  if (scored.length === 0) { sec.style.display = 'none'; return; }

  // Build the markup BEFORE revealing the section, and only reveal it if
  // something was actually produced. Previously display was cleared first,
  // so any throw inside the map below left the heading sitting over an
  // empty card with no way to recover.
  let html = '';
  try {
    html = renderCkRecoCards(scored);
  } catch (e) {
    console.warn('[checkout] recommendations skipped:', e && e.message);
    html = '';
  }
  if (!html) { sec.style.display = 'none'; el.innerHTML = ''; return; }
  el.innerHTML = html;
  sec.style.display = '';
}

function renderCkRecoCards(scored) {
  return scored.map(p => {
    const price    = p.salePrice || p.price;
    const inCart   = STORE.cart.some(i => i.id === p.id);
    const imgSrc   = getProductImg(p);
    const savePct  = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
    const saveBadge= savePct > 0 ? `<span class="ck-reco-badge">Save ${savePct}%</span>` : (p.badge ? `<span class="ck-reco-badge">${p.badge}</span>` : '');
    const addBtn   = inCart
      ? `<button class="ck-reco-add-btn in-cart" disabled>✓ Added</button>`
      : `<button class="ck-reco-add-btn" onclick="event.stopPropagation();STORE.addToCart(${p.id});renderCheckoutSummary();renderCkRecommendations();renderSideCart();showToast('🛒 ${p.name.split(' ')[0]} added!','success')">+ Add</button>`;
    return `<div class="ck-reco-card" onclick="openProduct(${p.id})">
      <img class="ck-reco-img" src="${imgSrc}" alt="${p.name}" onerror="this.src=PRODUCT_FALLBACKS.default" loading="lazy" decoding="async">
      <div class="ck-reco-info">
        <div class="ck-reco-name">${p.name}</div>
        <div class="ck-reco-price">₹${price.toLocaleString('en-IN')} ${p.hasTiers ? '<span style="color:var(--green);font-size:.65rem">· multi-pack deals</span>' : ''}</div>
        ${saveBadge}
      </div>
      ${addBtn}
    </div>`;
  }).join('');
}

// Patch renderCheckoutSummary to include qty controls
const _origRenderCkSummary = renderCheckoutSummary;
// ══════════════════════════════════════════════════════════════
// SHIPPING / COD CHARGE — SINGLE SOURCE OF TRUTH
// Every checkout display AND every charge path must use calcShipping().
// They used to each hardcode `net >= 599 ? 0 : 60`, so changing the
// policy in the summary alone left the payment gateway and the COD
// confirm still adding 60 — the customer saw FREE and was charged 60.
// The server (computeServerSideTotal in server.js) must match these
// two values exactly or the same mismatch reappears.
//   SHIP_FEE = 79  -> ₹79 charged below SHIP_THRESHOLD
//   SHIP_FEE = 0   -> shipping always free
// ══════════════════════════════════════════════════════════════
var SHIP_THRESHOLD = 599;
var SHIP_FEE = 79;
function calcShipping(netSubtotal) {
  if (!SHIP_FEE) return 0;
  return (Number(netSubtotal) || 0) >= SHIP_THRESHOLD ? 0 : SHIP_FEE;
}
function shippingIsAlwaysFree() { return !SHIP_FEE; }
var DELIVERY_POLICY = { store_online: true, shipping_mode: 'paid', shipping_fee: 79, free_shipping_threshold: 599, cod_enabled: false, cod_min_order: 0, cod_max_order: 0, cod_allowed_all_orders: true };
function applyDeliveryPolicy(policy) {
  if (!policy || typeof policy !== 'object') return;
  DELIVERY_POLICY = Object.assign({}, DELIVERY_POLICY, {
    store_online: policy.store_online ?? policy.storeOnline ?? DELIVERY_POLICY.store_online,
    shipping_mode: policy.shipping_mode ?? policy.shippingMode ?? DELIVERY_POLICY.shipping_mode,
    shipping_fee: policy.shipping_fee ?? policy.shippingFee ?? DELIVERY_POLICY.shipping_fee,
    free_shipping_threshold: policy.free_shipping_threshold ?? policy.freeShippingThreshold ?? DELIVERY_POLICY.free_shipping_threshold,
    cod_enabled: policy.cod_enabled ?? policy.codEnabled ?? DELIVERY_POLICY.cod_enabled,
    cod_min_order: policy.cod_min_order ?? policy.codMinOrder ?? DELIVERY_POLICY.cod_min_order,
    cod_max_order: policy.cod_max_order ?? policy.codMaxOrder ?? DELIVERY_POLICY.cod_max_order,
    cod_allowed_all_orders: policy.cod_allowed_all_orders ?? policy.codAllowedAllOrders ?? DELIVERY_POLICY.cod_allowed_all_orders,
  });
  SHIP_THRESHOLD = Math.max(0, Number(DELIVERY_POLICY.free_shipping_threshold) || 0);
  SHIP_FEE = DELIVERY_POLICY.shipping_mode === 'free' ? 0 : Math.max(0, Number(DELIVERY_POLICY.shipping_fee) || 0);
  document.dispatchEvent(new CustomEvent('ozylix:delivery-policy-updated'));
  try { updateCodBtnNote(); } catch (_) {}
}
function loadDeliveryPolicy(options) {
  options = options || {};
  var force = options.force === true;
  var base = (typeof API_BASE !== 'undefined') ? API_BASE : 'https://ascovitahealthcare-cell-github-io.onrender.com';
  fetch(base + '/api/public/delivery-policy', {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  })
    .then(function(r){
      if (!r.ok) throw new Error('policy http ' + r.status);
      return r.json();
    })
    .then(function(d){
      if (d && d.data) applyDeliveryPolicy(d.data);
      else if (force) applyDeliveryPolicy({ cod_enabled: false });
    })
    .catch(function(err){
      console.warn('[checkout] delivery policy refresh failed:', err && err.message);
      // A failed forced refresh must not leave an old enabled COD state alive.
      if (force) applyDeliveryPolicy({ cod_enabled: false });
    });
}
loadDeliveryPolicy();
// Admin policy changes should reach already-open mobile checkout sessions.
window.setInterval(function(){ loadDeliveryPolicy({ force: true }); }, 30000);
document.addEventListener('visibilitychange', function(){
  if (!document.hidden) loadDeliveryPolicy({ force: true });
});

// NOTE: this function is ALSO declared further down, in a later <script>
// block. It looks like dead duplication and I removed it on that reading —
// which broke checkout with "renderCheckoutSummary is not defined".
// Function hoisting is per-SCRIPT, not per-document: while this block runs,
// the later block has not been parsed and its copy does not exist yet.
// Callers reached during this block need this definition. The two bodies
// have since diverged (the later one carries a promo-discount fix), so they
// should be reconciled into one shared definition placed above both — but
// that is a deliberate change to make and verify, not a deletion.
function renderCheckoutSummary() {
  const el = document.getElementById('ckSummary');
  if (!el) return;

  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);
  const mrpSub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unit = item.tierTabs ? Number(p.price || p.mrp || p.salePrice || 0) * (Number(item.tierTabs) / 15) : Number(p.price || p.mrp || p.salePrice || 0);
    return s + unit * item.qty;
  }, 0);
  const tierOff = Math.max(0, mrpSub - sub);

  let disc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    if (Number.isFinite(Number(activePromoCode.discount))) disc = Math.min(sub, Math.max(0, Number(activePromoCode.discount)));
    else if (activePromoCode.type === 'pct') disc = azPromoCap(Math.round(sub * activePromoCode.value / 100));
    else if (activePromoCode.type === 'flat') disc = azPromoCap(Math.min(activePromoCode.value, sub));
  } else if (typeof appliedDiscount !== 'undefined' && appliedDiscount) {
    disc = appliedDiscount.type==='percent' ? Math.round(sub*appliedDiscount.value/100) : appliedDiscount.value;
  }

  // ── MIX & MATCH (display only) ──────────────────────────────────────
  // Mirrors mixAndMatchDiscount() in server.js: every 4 units, the cheapest
  // is free. The SERVER sets the real price; this only lets the cart show
  // the saving before checkout. Keep the two in step.
  var mmUnits = [];
  STORE.cart.forEach(function (it) {
    var pr = PRODUCTS.find(function (x) { return x.id === it.id; });
    if (!pr) return;
    var u = (function (p, it) { var m = null; if (it.tierTabs != null) m = Number(it.tierTabs) / 15; else if (it.tierIdx != null) { var ts = (typeof getProductTiers === 'function') ? getProductTiers(p) : null; m = (ts && ts[it.tierIdx] && ts[it.tierIdx].tabs) ? ts[it.tierIdx].tabs / 15 : null; } return (m && m > 0) ? (Number(p.price || 0) * m) : (p.salePrice || p.price); })(pr, it);
    var q = Math.max(0, Math.trunc(Number(it.qty) || 0));
    for (var n = 0; n < q; n++) mmUnits.push(u);
  });
  mmUnits.sort(function (a, b) { return a - b; });
  var mmGroups = Math.floor(mmUnits.length / 4);
  var mmDisc = 0;
  for (var g = 0; g < mmGroups; g++) mmDisc += mmUnits[g * 4] || 0;
  var mmOff = Math.max(0, Math.min(mmDisc, sub));
  var mmNeed = mmGroups > 0 ? 0 : 4 - (mmUnits.length % 4);

  // Mix & Match is standalone: when unlocked, the coupon is not stacked.
  if (mmOff > 0) disc = 0;
  const netBeforeVita = Math.max(0, sub - disc - mmOff);
  const ship  = calcShipping(netBeforeVita);
  // Re-read VITA_APPLIED after every input event. vitaCheckoutInfo clamps it
  // to the current eligible subtotal and returns the amount actually shown.
  const _vita = vitaCheckoutInfo(netBeforeVita);
  const vitaOff = _vita.rupees;
  const total = Math.max(0, netBeforeVita + ship - vitaOff);

  const itemsHtml = STORE.cart.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return '';
    const unitPrice  = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    const packLabel  = item.tierTabs  ? ` (${item.tierTabs} tabs)` : '';
    const tierLabel  = item.tierLabel ? ` — ${item.tierLabel}` : '';
    const tierIdx    = item.tierIdx !== undefined ? item.tierIdx : -1;
    const imgSrc     = getProductImg(p);
    return `<div class="ck-item-row">
      <img class="ck-item-img" src="${imgSrc}" alt="${p.name}" onerror="this.src=PRODUCT_FALLBACKS.default" loading="lazy" decoding="async">
      <div class="ck-item-info">
        <div class="ck-item-name">${p.name}${packLabel}${tierLabel}</div>
        <div class="ck-item-price-line">₹${unitPrice.toLocaleString('en-IN')} each</div>
      </div>
      <div class="ck-item-right">
          <div class="ck-qty-wrap" aria-label="Change quantity for ${p.name}">
          <button type="button" class="ck-qty-btn" onclick="ckUpdateQty(${p.id},${item.qty-1},${tierIdx})" title="Decrease quantity" aria-label="Decrease quantity">−</button>
          <span class="ck-qty-num">${item.qty}</span>
          <button type="button" class="ck-qty-btn" onclick="ckUpdateQty(${p.id},${item.qty+1},${tierIdx})" title="Increase quantity" aria-label="Increase quantity">+</button>
        </div>
        <div class="ck-item-total">₹${(unitPrice * item.qty).toLocaleString('en-IN')}</div>
        <button type="button" class="ck-remove-btn" onclick="ckRemoveItem(${p.id},${tierIdx})" title="Remove item">Remove ✕</button>
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `${itemsHtml}
    <button type="button" class="sc-view-btn" onclick="showPage('shop');window.scrollTo({top:0,behavior:'smooth'})">＋ Add more products</button>
    <hr style="border:none;border-top:1.5px solid var(--light-gray);margin:14px 0 10px">
    <div class="sum-row"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
    ${disc > 0 ? `<div class="sum-row" style="color:var(--success)"><span>🏷️ Discount</span><span>-₹${disc.toLocaleString('en-IN')}</span></div>` : ''}
    <div class="sum-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success);font-weight:700">FREE</span>' : '₹' + ship}</span></div>
    ${vitaOff > 0 ? `<div class="sum-row" style="color:var(--fern-lo)"><span>💎 VitaPoints (${_vita.applied.toLocaleString('en-IN')})</span><span>-₹${vitaOff.toFixed(2)}</span></div>` : ''}
    <hr style="border:none;border-top:1px solid var(--light-gray);margin:8px 0">
    <div class="sum-row total"><span>Total</span><span style="color:var(--green);font-size:1.1rem">₹${total.toLocaleString('en-IN',{maximumFractionDigits:2})}</span></div>
    ${vitaRedeemWidgetHTML(netBeforeVita)}`;

  // Also re-render recommendations whenever summary updates
  renderCkRecommendations();
}
