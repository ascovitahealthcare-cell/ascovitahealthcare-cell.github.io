// ═══════════════════════════════════════════════════════
// CHECKOUT: PROMO CODES + SAVED ADDRESS AUTO-FILL
// ═══════════════════════════════════════════════════════

// Promo codes — only TEST100 kept locally for payment testing.
// ALL real codes are fetched live from backend (Supabase coupons table).
const PROMO_CODES = {
  'TEST100': { type: 'pct', value: 100, label: '100% OFF (Test Mode)', demo: true },
  'TESTPAY': { type: 'pct', value: 100, label: '100% OFF (Payment Test)', demo: true },
};

let activePromoCode = null;

async function applyPromoCode() {
  const input  = document.getElementById('promoCodeInput');
  const status = document.getElementById('promoStatus');
  if (!input || !status) return;
  const code = input.value.trim().toUpperCase();
  if (!code) {
    status.innerHTML = '<div style="font-size:0.78rem;color:var(--red);margin-top:6px">Please enter a promo code.</div>';
    return;
  }

  status.innerHTML = '<div style="font-size:0.78rem;color:var(--gray);margin-top:6px">⏳ Checking code...</div>';

  // Local-only test codes (never go to backend)
  const localCode = PROMO_CODES[code];
  if (localCode) {
    activePromoCode = { code, ...localCode };
    status.innerHTML = `<div class="promo-badge">✅ ${code} applied — ${localCode.label} <button class="promo-remove" onclick="removePromoCode()">✕</button></div>`;
    renderCheckoutSummary();
    showToast(`🏷️ Code ${code} applied!`);
    return;
  }

  // ALL real codes come from backend (Supabase coupons table via admin)
  const subtotal = STORE.getSubtotal ? STORE.getSubtotal() : 0;
  const backendPromo = await validateCouponWithBackend(code, subtotal);
  if (backendPromo) {
    const type = backendPromo.type === 'percent' ? 'pct' : 'flat';
    activePromoCode = { code, type, value: backendPromo.value, label: backendPromo.label || `${code} applied` };
    status.innerHTML = `<div class="promo-badge">✅ ${code} applied — ${activePromoCode.label} <button class="promo-remove" onclick="removePromoCode()">✕</button></div>`;
    renderCheckoutSummary();
    showToast(`🏷️ Code ${code} applied!`);
    return;
  }

  status.innerHTML = '<div style="font-size:0.78rem;color:var(--red);margin-top:6px">❌ Invalid or expired code. Add codes in the admin panel.</div>';
  activePromoCode = null;
  renderCheckoutSummary();
}

function removePromoCode() {
  activePromoCode = null;
  const input = document.getElementById('promoCodeInput');
  const status = document.getElementById('promoStatus');
  if (input) input.value = '';
  if (status) status.innerHTML = '';
  renderCheckoutSummary();
}

// Override renderCheckoutSummary to include promo discount
const _origRenderCheckoutSummary = window.renderCheckoutSummary;

function getPromoDiscount(subtotal) {
  if (!activePromoCode) return 0;
  if (activePromoCode.type === 'pct') return Math.round(subtotal * activePromoCode.value / 100);
  if (activePromoCode.type === 'flat') return Math.min(activePromoCode.value, subtotal);
  return 0;
}

// Show saved address bar on checkout page load for logged-in users
function checkSavedAddressForCheckout() {
  const user = getCurrentUser();
  const bar = document.getElementById('savedAddressBar');
  if (!bar) return;
  if (user && user.address && user.address.addr1) {
    const sn=document.getElementById('savedAddrName'); if(sn) sn.textContent = user.name;
    const sd=document.getElementById('savedAddrDetails'); if(sd) sd.textContent = `${user.address.addr1}, ${user.address.city} - ${user.address.pin}`;
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }
}

function fillSavedAddress() {
  const user = getCurrentUser();
  if (!user || !user.address) return;
  const a = user.address;
  const setVal = (sel, val) => { const el = document.querySelector(sel); if (el && val) el.value = val; };
  // Use form-input selectors (nth-child approach for the checkout form inputs)
  const inputs = document.querySelectorAll('#page-checkout .form-input');
  if (inputs.length >= 8) {
    const nameParts = user.name?.split(' ') || ['',''];
    inputs[0].value = nameParts[0] || '';
    inputs[1].value = nameParts.slice(1).join(' ') || '';
    inputs[2].value = user.email || '';
    inputs[3].value = user.phone || '';
    inputs[4].value = a.addr1 || '';
    inputs[5].value = a.addr2 || '';
    inputs[6].value = a.city || '';
    inputs[7].value = a.state || '';
    if (inputs[8]) inputs[8].value = a.pin || '';
  }
  const sab=document.getElementById('savedAddressBar'); if(sab) sab.style.display = 'none';
  showToast('✅ Saved address filled in!');
}

// ── CONSOLIDATED showPage — handles ALL page-specific logic ──
var _baseSP = window.showPage;
window.showPage = function(pg) {
  if (typeof _baseSP === 'function') _baseSP(pg);
  if (pg === 'account')       { try { loadAccountPage(); } catch(e){} }
  if (pg === 'checkout')      { try { checkSavedAddressForCheckout(); } catch(e){} }
  if (pg === 'wishlist')      { try { renderWishlistPage(); } catch(e){} }
  if (pg === 'subscriptions') { try { initSubscriptionsPage(); } catch(e){} }
  if (pg === 'advisor')       { try { vitaInit(); } catch(e){} }
};


// ═══════════════════════════════════════════════════════
// SIDE CART DRAWER
// ═══════════════════════════════════════════════════════
function openSideCart() {
  renderSideCart();
  document.getElementById('sideCart')?.classList.add('open');
  document.getElementById('sideCartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSideCart() {
  document.getElementById('sideCart')?.classList.remove('open');
  document.getElementById('sideCartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderSideCart() {
  const body = document.getElementById('scBody');
  const foot = document.getElementById('scFoot');
  const countEl = document.getElementById('scCount');
  if (!body || !foot) return;

  const count = STORE.cart.reduce((s,i) => s + i.qty, 0);
  if (countEl) countEl.textContent = count;

  if (STORE.cart.length === 0) {
    body.innerHTML = `<div class="sc-empty"><div style="font-size:3.5rem;margin-bottom:16px">🛒</div><h3 style="margin-bottom:8px">Your cart is empty</h3><p style="color:var(--gray);font-size:0.84rem;margin-bottom:20px">Add some products to get started!</p><button class="btn-primary" onclick="closeSideCart();showPage('shop')">Shop Now →</button></div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = STORE.cart.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return '';
    const price = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return `
      <div class="sc-item">
        <img class="sc-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/64x64/EAF2E0/2D5016?text=A'">
        <div class="sc-info">
          <div class="sc-name">${p.name}</div>
          ${item.tierTabs ? `<div class="sc-tier-info" style="font-size:.7rem;color:var(--green);font-weight:600;margin:1px 0">${item.tierTabs} Tablets (${item.tierTabs/15} ${item.tierTabs===15?'Pack':'Packs'})</div>` : ''}
          <div class="sc-brand">${p.brand}</div>
          <div class="sc-price">₹${(price * item.qty).toLocaleString('en-IN')}</div>
          <div class="sc-qty-row">
            <button class="sc-qty-btn" onclick="scUpdateQty(${item.id}, ${item.qty - 1}, ${item.tierIdx ?? 'undefined'})">−</button>
            <span class="sc-qty-val">${item.qty}</span>
            <button class="sc-qty-btn" onclick="scUpdateQty(${item.id}, ${item.qty + 1}, ${item.tierIdx ?? 'undefined'})">+</button>
          </div>
        </div>
        <button class="sc-remove" onclick="STORE.removeFromCart(${item.id});renderSideCart()" title="Remove">🗑</button>
      </div>`;
  }).join('');

  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    const price = item.tierRate !== undefined ? item.tierRate : (p ? (p.salePrice || p.price) : 0);
    return s + price * item.qty;
  }, 0);
  const ship = 0; // Free shipping online
  const promoDisc = getPromoDiscount ? getPromoDiscount(sub) : 0;
  const total = Math.max(0, sub - promoDisc + ship);

  foot.innerHTML = `
    <div class="sc-totals">
      <div class="sc-row"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
      ${promoDisc > 0 ? `<div class="sc-row" style="color:var(--success)"><span>Discount</span><span>−₹${promoDisc.toLocaleString('en-IN')}</span></div>` : ''}
      <div class="sc-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success)">FREE</span>' : '₹' + ship}</span></div>
      <div class="sc-row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    </div>
    <button class="sc-checkout-btn" onclick="closeSideCart();showPage('checkout')">🔒 Proceed to Checkout</button>
    <button class="sc-view-btn" onclick="closeSideCart();showPage('cart')">View Full Cart</button>
    <div style="text-align:center;font-size:0.7rem;color:var(--gray);margin-top:10px">🔒 Secured by Cashfree · Free shipping above ₹599</div>
  `;
}

function scUpdateQty(id, qty, tierIdx) {
  if (qty < 1) { STORE.removeFromCart(id); }
  else { STORE.updateQty(id, qty); }
  renderSideCart();
}

// ═══════════════════════════════════════════════════════
// WISHLIST PAGE
// ═══════════════════════════════════════════════════════
function renderWishlistPage() {
  const grid = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  const subtitle = document.getElementById('wishlistSubtitle');
  if (!grid) return;

  const wishIds = STORE.wishlist || [];
  const wishProds = PRODUCTS.filter(p => wishIds.includes(p.id));

  if (subtitle) subtitle.textContent = `${wishProds.length} saved product${wishProds.length !== 1 ? 's' : ''}`;

  if (wishProds.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = wishProds.map(p => renderProductCard(p)).join('');

  // Update wish badge in nav
  updateWishBadge();
}

function updateWishBadge() {
  const badge = document.getElementById('wishBadge');
  const count = (STORE.wishlist || []).length;
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Override toggleWishlist to update badge
const _origToggleWish = STORE.toggleWishlist.bind(STORE);
STORE.toggleWishlist = function(id) {
  _origToggleWish(id);
  updateWishBadge();
};

// ═══════════════════════════════════════════════════════
// PAYMENT FAILED PAGE — route errors here
// ═══════════════════════════════════════════════════════
function showPaymentFailedPage(msg) {
  const el = document.getElementById('pfErrorMsg');
  if (el && msg) el.textContent = msg;
  showPage('payment-failed');
}

// ═══════════════════════════════════════════════════════
// SUBSCRIPTIONS PAGE
// ═══════════════════════════════════════════════════════
let selectedSubProduct = null;
let selectedSubPlan = 'quarterly';

function initSubscriptionsPage() {
  const grid = document.getElementById('subProductGrid');
  if (!grid) return;

  // Show subscribable products (all non-combo)
  const eligible = PRODUCTS.filter(p => !p.category.includes('combos'));
  grid.innerHTML = eligible.map(p => {
    const price = p.salePrice || p.price;
    return `
      <div onclick="selectSubProduct(${p.id}, this)" style="border:2px solid var(--light-gray);border-radius:var(--radius-sm);padding:12px;cursor:pointer;transition:var(--transition);display:flex;align-items:center;gap:10px" class="sub-prod-card">
        <img src="${p.image}" style="width:44px;height:44px;border-radius:8px;object-fit:contain;background:var(--off-white)" onerror="this.src=''">
        <div>
          <div style="font-size:0.8rem;font-weight:700;color:var(--text)">${p.name}</div>
          <div style="font-size:0.74rem;color:var(--green)">from ₹${price}/delivery</div>
        </div>
      </div>`;
  }).join('');

  // Update price displays based on bestseller as example
  const exampleProduct = PRODUCTS.find(p => p.tags.includes('bestseller'));
  if (exampleProduct) {
    const base = exampleProduct.salePrice || exampleProduct.price;
    const el1 = document.getElementById('subPrice1');
    const el3 = document.getElementById('subPrice3');
    const el6 = document.getElementById('subPrice6');
    if (el1) el1.textContent = Math.round(base * 0.9).toLocaleString('en-IN');
    if (el3) el3.textContent = Math.round(base * 0.85 * 3).toLocaleString('en-IN');
    if (el6) el6.textContent = Math.round(base * 0.8 * 6).toLocaleString('en-IN');
  }
}

function selectSubProduct(id, el) {
  selectedSubProduct = id;
  document.querySelectorAll('.sub-prod-card').forEach(c => { c.style.borderColor = 'var(--light-gray)'; c.style.background = ''; });
  if (el) { el.style.borderColor = 'var(--green)'; el.style.background = 'var(--green-pale)'; }
  const p = PRODUCTS.find(p => p.id === id);
  const sel = document.getElementById('subSelectedProduct');
  if (sel && p) sel.textContent = p.name;

  // Update prices based on selection
  const base = p ? (p.salePrice || p.price) : 0;
  const el1 = document.getElementById('subPrice1');
  const el3 = document.getElementById('subPrice3');
  const el6 = document.getElementById('subPrice6');
  if (el1) el1.textContent = Math.round(base * 0.9).toLocaleString('en-IN');
  if (el3) el3.textContent = Math.round(base * 0.85 * 3).toLocaleString('en-IN');
  if (el6) el6.textContent = Math.round(base * 0.8 * 6).toLocaleString('en-IN');
}

function startSubscription(plan) {
  if (!selectedSubProduct) {
    showToast('Please select a product first', 'error');
    const grid = document.getElementById('subProductGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const user = getCurrentUser();
  if (!user) { openAuth('login'); return; }

  const p = PRODUCTS.find(p => p.id === selectedSubProduct);
  const planNames = { monthly: 'Monthly', quarterly: 'Quarterly (Most Popular)', halfyearly: '6-Monthly (Best Value)' };
  showToast(`✅ Subscription started: ${p?.name} — ${planNames[plan]}! We'll contact you to confirm.`);

  // Save subscription to localStorage
  try {
    const subs = JSON.parse(localStorage.getItem('asc_subs') || '[]');
    subs.push({ productId: selectedSubProduct, productName: p?.name, plan, startDate: new Date().toISOString(), status: 'Active' });
    localStorage.setItem('asc_subs', JSON.stringify(subs));
  } catch(e) {}
}

// ══ Subscriptions & wishlist page hooks already handled above ══


// Init wishlist badge on load
document.addEventListener('DOMContentLoaded', function() {
  try { updateWishBadge(); } catch(e) {}

  // ── 3D TILT EFFECT on cert cards, cat cards, product cards ──
  function addTilt(selector, maxTilt, scale) {
    document.querySelectorAll(selector).forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * maxTilt;
        const rotY =  dx * maxTilt;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }

  // Apply tilt after a short delay to ensure DOM is ready
  setTimeout(function() {
    addTilt('.cert-card', 8, 1.04);
    addTilt('.cat-card', 6, 1.03);
    addTilt('.cat-card-sm', 10, 1.06);
  }, 500);

  // ── SCROLL-REVEAL for SVG icons ──
  const revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  setTimeout(function() {
    document.querySelectorAll('.cert-card, .cat-card, .cat-card-sm').forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px) scale(0.95)';
      el.style.transition = 'opacity 0.5s ease ' + (i * 0.07) + 's, transform 0.5s ease ' + (i * 0.07) + 's';
      revealObs.observe(el);
    });
  }, 100);
});



// ═══════════════════════════════════════════════════════
let heroCurrentSlide = 0;
const heroTotalSlides = 3;
let heroAutoTimer = null;

function goHeroSlide(n) {
  const isMobile = window.innerWidth <= 768;
  const slides = document.querySelectorAll('.hero-slide');
  slides.forEach((s,i) => {
    s.classList.toggle('active', i === n);
    s.classList.remove('leaving');
    if (!isMobile && i === heroCurrentSlide && i !== n) s.classList.add('leaving');
  });
  document.querySelectorAll('.slide-dot').forEach((d,i) => d.classList.toggle('active', i === n));
  heroCurrentSlide = n;
  // Update dot colors for dark slides
  const activeSlideBg = document.querySelector('.hero-slide.active');
  const dots = document.querySelectorAll('.slide-dot');
  const isDark = activeSlideBg && activeSlideBg.classList.contains('hero-slide-2');
  dots.forEach(d => {
    d.style.borderColor = isDark ? 'rgba(255,255,255,0.5)' : '';
  });
}

function heroSlide(dir) {
  const next = (heroCurrentSlide + dir + heroTotalSlides) % heroTotalSlides;
  goHeroSlide(next);
  resetHeroAuto();
}

function startHeroAuto() {
  heroAutoTimer = setInterval(() => {
    heroSlide(1);
  }, 5000);
}

function resetHeroAuto() {
  clearInterval(heroAutoTimer);
  startHeroAuto();
}

// ═══════════════════════════════════════════════════════
// CHECKOUT UPSELL WIDGET
// ═══════════════════════════════════════════════════════
const UPSELL_SUGGESTIONS = [
  { id: 14, label: 'Add Vitamin C', price: 249, pitch: 'Boosts immunity & absorption' },
  { id:  3, label: 'Add Biotin', price: 449, pitch: 'Hair, skin & nail support' },
  { id: 10, label: 'Upgrade to Spirulina Combo', price: 999, pitch: 'Save ₹98 vs buying separately' },
  { id: 21, label: 'Add L-Lysine', price: 379, pitch: 'Collagen + immune defence' },
];

function renderUpsells() {
  const bar = document.getElementById('upsellBar');
  const container = document.getElementById('upsellItems');
  if (!bar || !container) return;
  const cartIds = STORE.cart.map(i => i.id);
  const suggestions = UPSELL_SUGGESTIONS.filter(u => !cartIds.includes(u.id)).slice(0, 2);
  if (!suggestions.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  container.innerHTML = suggestions.map(u =>
    `<div class="upsell-item">
      <div class="upsell-info"><span class="upsell-label">${u.label}</span><span class="upsell-pitch">${u.pitch}</span></div>
      <div class="upsell-price">₹${u.price}</div>
      <button class="upsell-add" onclick="STORE.addToCart(${u.id});renderCheckoutSummary();renderUpsells();">+ Add</button>
    </div>`
  ).join('');
}


/* ── COMPETITOR FEATURES JS ── */
const QUIZ_DATA=[
  {q:"What's your primary health goal?",opts:[{ico:'✨',lbl:'Skin Glow & Brightening'},{ico:'💪',lbl:'Immunity & Energy'},{ico:'🏋',lbl:'Weight Management'},{ico:'🧠',lbl:'Focus & Vitality'}]},
  {q:"How would you describe your lifestyle?",opts:[{ico:'🏃',lbl:'Active / Gym-goer'},{ico:'💼',lbl:'Busy & Desk-based'},{ico:'🏠',lbl:'Home & Family-focused'},{ico:'🧘',lbl:'Yoga & Wellness'}]},
  {q:"Any specific concerns?",opts:[{ico:'💇',lbl:'Hair fall / Hair growth'},{ico:'😴',lbl:'Fatigue & Low energy'},{ico:'🫁',lbl:'Digestive health'},{ico:'🌿',lbl:'Overall nutrition gap'}]},
  {q:"How do you prefer to take supplements?",opts:[{ico:'🫧',lbl:'Effervescent (fizzy drink)'},{ico:'💊',lbl:'Capsules / Tablets'},{ico:'🍵',lbl:'Powder / Mix'},{ico:'🤷',lbl:'No preference'}]}
];
const QUIZ_RECS={0:[4,3,14],1:[5,14,8],2:[15,20,8],3:[8,5,22]};
let quizStep=0,quizAnswers=[];
function openQuiz(){quizStep=0;quizAnswers=[];const o=document.getElementById('quizOverlay');if(o)o.style.display='flex';renderQuizStep();}
function closeQuiz(){const o=document.getElementById('quizOverlay');if(o)o.style.display='none';}
function renderQuizStep(){
  const ov=document.getElementById('quizOverlay');if(!ov)return;
  if(quizStep>=QUIZ_DATA.length){renderQuizResult();return;}
  const d=QUIZ_DATA[quizStep],pct=Math.round((quizStep/QUIZ_DATA.length)*100);
  ov.innerHTML='<div class="quiz-modal"><div class="qm-head"><div class="qm-title">Find Your Health Stack<\/div><button class="qm-close" onclick="closeQuiz()">✕<\/button><\/div><div class="qm-body"><div class="qm-prog"><div class="qm-prog-fill" style="width:'+pct+'%"><\/div><\/div><div class="qm-prog-lbl">Question '+(quizStep+1)+' of '+QUIZ_DATA.length+'<\/div><div class="qm-q">'+d.q+'<\/div><div class="qm-opts">'+d.opts.map((o,i)=>'<div class="qm-opt" onclick="selectQuizOpt('+i+')" id="qopt-'+i+'"><span class="qm-opt-ico">'+o.ico+'<\/span>'+o.lbl+'<\/div>').join('')+'<\/div><div class="qm-nav"><button class="qm-back" onclick="quizBack()"'+(quizStep===0?' style="visibility:hidden"':'')+'>← Back<\/button><button class="qm-next" id="quizNextBtn" onclick="quizNext()" disabled style="opacity:.45;cursor:not-allowed">Next →<\/button><\/div><\/div><\/div>';
  if(quizAnswers[quizStep]!==undefined){const el=document.getElementById('qopt-'+quizAnswers[quizStep]);if(el)el.classList.add('sel');const nb=document.getElementById('quizNextBtn');if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.cursor='pointer';}}
}
function selectQuizOpt(i){document.querySelectorAll('.qm-opt').forEach(o=>o.classList.remove('sel'));const el=document.getElementById('qopt-'+i);if(el)el.classList.add('sel');quizAnswers[quizStep]=i;const nb=document.getElementById('quizNextBtn');if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.cursor='pointer';}}
function quizNext(){if(quizAnswers[quizStep]===undefined)return;quizStep++;renderQuizStep();}
function quizBack(){if(quizStep>0){quizStep--;renderQuizStep();}}
function renderQuizResult(){
  const ov=document.getElementById('quizOverlay');if(!ov)return;
  const ids=QUIZ_RECS[quizAnswers[0]||0]||QUIZ_RECS[0];
  const rp=ids.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  ov.innerHTML='<div class="quiz-modal"><div class="qm-head"><div class="qm-title">🎯 Your Personalised Stack<\/div><button class="qm-close" onclick="closeQuiz()">✕<\/button><\/div><div class="qm-body"><div class="qm-result"><div class="qm-result-ico">🌿<\/div><div class="qm-result-title">Here\'s what your body needs<\/div><div class="qm-result-sub">Based on your answers, our nutritionists recommend this personalised Ascovita stack.<\/div><div class="qm-result-prods">'+rp.map(p=>'<div class="qm-rp" onclick="closeQuiz();showProduct('+p.id+')"><img src="'+( p.image||'')+ '" style="width:72px;height:72px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 8px" onerror="this.style.display=\'none\'"><div class="qm-rp-name">'+(p.name||'')+'<\/div><div class="qm-rp-price">₹'+(p.salePrice||p.price||0)+'<\/div><\/div>').join('')+'<\/div><button class="btn-primary" onclick="closeQuiz();showPage(\'shop\')" style="margin-bottom:12px">Shop My Recommendations →<\/button><\/div><\/div><\/div>';
}

let selectedBundleIds=new Set();
function renderBundleBuilder(){const list=document.getElementById('bundleProdList');if(!list||!PRODUCTS)return;list.innerHTML=PRODUCTS.map(p=>'<div class="b-prod-row" id="brow-'+p.id+'" onclick="toggleBundle('+p.id+')"><div class="b-prod-cb" id="bcb-'+p.id+'">✓<\/div><div class="b-prod-img">'+(p.image?'<img src="'+p.image+'" style="width:54px;height:54px;object-fit:cover;border-radius:10px">':'🌿')+'<\/div><div class="b-prod-info"><div class="b-prod-name">'+p.name+'<\/div><div class="b-prod-cat">'+(p.category||'supplement')+'<\/div>'+(p.badge?'<div class="b-prod-badge">'+p.badge+'<\/div>':'')+'<\/div><div class="b-prod-price">₹'+(p.salePrice||p.price)+'<\/div><\/div>').join('');}
function toggleBundle(id){if(selectedBundleIds.has(id)){selectedBundleIds.delete(id);document.getElementById('brow-'+id)?.classList.remove('sel');}else{selectedBundleIds.add(id);document.getElementById('brow-'+id)?.classList.add('sel');}updateBundleSummary();}
function updateBundleSummary(){const sel=[...selectedBundleIds].map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean),n=sel.length,sub=sel.reduce((s,p)=>s+(p.salePrice||p.price),0),dp=n>=4?0.20:n===3?0.15:n===2?0.10:0,sav=Math.round(sub*dp),tot=sub-sav;const box=document.getElementById('bundleItemsBox');if(box)box.innerHTML=n===0?'<div class="bundle-empty-hint">No products selected yet<\/div>':sel.map(p=>'<div class="b-item-chip"><span class="b-item-name">'+p.name+'<\/span><span class="b-item-price">₹'+(p.salePrice||p.price)+'<\/span><\/div>').join('');const s=document.getElementById('bundleSubtotal'),t=document.getElementById('bundleTotal'),dr=document.getElementById('bundleDiscountRow'),dl=document.getElementById('bundleDiscountLabel'),dv=document.getElementById('bundleDiscountVal'),sb=document.getElementById('bundleSavingsBanner');if(s)s.textContent='₹'+sub;if(t)t.textContent='₹'+tot;if(dp>0){if(dr)dr.style.display='flex';if(dl)dl.textContent='Bundle discount ('+(dp*100)+'% off)';if(dv)dv.textContent='−₹'+sav;if(sb){sb.style.display='block';sb.textContent='🎉 You\'re saving ₹'+sav+' with your '+n+'-product bundle!';}}else{if(dr)dr.style.display='none';if(sb)sb.style.display='none';}}
function addBundleToCart(){const sel=[...selectedBundleIds].map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);if(!sel.length){showToast('Select at least one product 🌿','error');return;}sel.forEach(p=>STORE.addToCart(p.id,1));openSideCart();showPtsToast('+'+sel.length*10+' VitaPoints!');}

let stickyQty=1,stickyProdId=null;
function initStickyCart(prod){if(!prod)return;stickyProdId=prod.id;stickyQty=1;const ne=document.getElementById('scProdName'),pe=document.getElementById('scProdPrice'),qe=document.getElementById('scQtyVal'),ie=document.getElementById('scProdImg');if(ne)ne.textContent=prod.name;if(pe)pe.textContent='₹'+(prod.salePrice||prod.price);if(qe)qe.textContent=1;if(ie&&prod.image)ie.src=prod.image;const sc=document.getElementById('stickyCart'),ab=document.getElementById('addCartBtn');if(!sc||!ab)return;const obs=new IntersectionObserver(en=>{if(!en[0].isIntersecting){sc.style.display='flex';requestAnimationFrame(()=>{sc.style.transform='translateY(0)';});}else{sc.style.transform='translateY(100%)';setTimeout(()=>{if(sc.style.transform==='translateY(100%)')sc.style.display='none';},300);}},{threshold:0.1});obs.observe(ab);}
function scQtyChange(d){stickyQty=Math.max(1,stickyQty+d);const e=document.getElementById('scQtyVal');if(e)e.textContent=stickyQty;}
function scAddToCart(){if(!stickyProdId)return;STORE.addToCart(stickyProdId,stickyQty);openSideCart();showPtsToast('+5 VitaPoints earned!');}

function renderStockUrgency(prod){const el=document.getElementById('stockUrgency');if(!el||!prod)return;const stock=prod.stock||prod.inventory||0;if(stock<=0||stock>50){el.innerHTML='';return;}const pct=Math.min(100,Math.round((stock/50)*100)),cls=stock<=10?'danger':stock<=25?'warning':'ok',msg=stock<=10?'Only '+stock+' left — selling fast!':'Low stock — only '+stock+' remaining';el.innerHTML='<div class="su-low"'+(stock>10?' style="background:#FFF8E1;border-color:#FFD54F;color:#E65100"':'')+'><span class="su-dot"'+(stock>10?' style="background:#E65100"':'')+'><\/span>'+msg+'<\/div><div class="su-bar"><div class="su-bar-fill '+cls+'" style="width:'+pct+'%"><\/div><\/div>';}
function startLiveViewers(){const el=document.getElementById('liveViewerCount');if(!el)return;let n=8+Math.floor(Math.random()*16);el.textContent=n;setInterval(()=>{n=Math.max(5,Math.min(30,n+(Math.random()>.5?1:-1)*Math.floor(Math.random()*3+1)));el.textContent=n;},6500);}
function showPtsToast(msg){const t=document.getElementById('ptsToast');if(!t)return;t.textContent='🪙 '+msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}
function copyReferLink(){const inp=document.getElementById('referLink');if(!inp)return;inp.select();try{document.execCommand('copy');showToast('Referral link copied! Share on WhatsApp 🤝','success');showPtsToast('Share to earn ₹100!');}catch(e){showToast('Link: '+inp.value,'info');}}

document.addEventListener('DOMContentLoaded',function(){
  if(document.getElementById('bundleProdList')&&typeof PRODUCTS!=='undefined')renderBundleBuilder();
  if(typeof addToCartWithTier==='function'){const _o=addToCartWithTier;window.addToCartWithTier=function(id){_o(id);showPtsToast('+5 VitaPoints earned!');};}
});
document.addEventListener('productPageShown',function(e){const prod=e.detail;if(!prod)return;initStickyCart(prod);renderStockUrgency(prod);startLiveViewers();});

// ── Video player toggle ──
function playVideo(wrap) {
  const video = wrap.querySelector('video');
  const btn = wrap.querySelector('.video-play-btn');
  if (!video) return;
  if (video.paused) {
    // Pause all other videos
    document.querySelectorAll('.video-thumb-wrap video').forEach(v => {
      if (v !== video) { v.pause(); const b = v.parentElement.querySelector('.video-play-btn'); if(b) b.style.display = 'flex'; }
    });
    video.play();
    if (btn) btn.style.display = 'none';
    video.addEventListener('ended', () => { if(btn) btn.style.display = 'flex'; }, {once:true});
  } else {
    video.pause();
    if (btn) btn.style.display = 'flex';
  }
}


// ═══════════════════════════════════════════════════════════════
// ── Vita advisor page stubs (AI removed — page kept for future use) ──
function vitaInit() {}
function vitaRestart() {}
function vitaSend() {}
function vitaSubmitLead() {}

// ─────────────────────────────────────────────────────────

// Vita is not active — stubs defined above
