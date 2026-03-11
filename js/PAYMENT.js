// ══════════════════════════════════════════════
// CASHFREE PAYMENT INTEGRATION — LIVE GATEWAY
// ══════════════════════════════════════════════

// ── CASHFREE SDK INIT ──
// Per Cashfree docs: initialize with mode each time before checkout()
let cashfree = null;
function getCashfreeInstance() {
  const CF = (typeof window.Cashfree !== 'undefined') ? window.Cashfree
           : (typeof Cashfree !== 'undefined') ? Cashfree : null;
  if (!CF) return null;
  return CF({ mode: 'production' });
}
function initCashfree() {
  cashfree = getCashfreeInstance();
  return !!cashfree;
}

// ── COLLECT FORM DATA ──
function getFormField(selector) {
  return document.querySelector('#page-checkout ' + selector)?.value?.trim() || '';
}

function validateCheckoutForm() {
  const firstName = getFormField('input[placeholder="Enter first name"]');
  const lastName  = getFormField('input[placeholder="Enter last name"]');
  const email     = getFormField('input[type="email"]');
  const phone     = getFormField('input[type="tel"]');
  const addr1     = getFormField('input[placeholder="House / Flat No., Street"]');
  const city      = getFormField('input[placeholder="City"]');
  const state     = getFormField('input[placeholder="State"]');
  const pin       = getFormField('input[placeholder="6-digit PIN"]');
  const addr2     = getFormField('input[placeholder="Area / Locality (optional)"]');

  if (!firstName || !lastName) { showToast('⚠️ Please enter your full name', 'error'); return null; }
  if (!email || !email.includes('@')) { showToast('⚠️ Please enter a valid email address', 'error'); return null; }
  if (!phone || phone.replace(/\D/g,'').length < 10) { showToast('⚠️ Please enter a valid 10-digit mobile number', 'error'); return null; }
  if (!addr1) { showToast('⚠️ Please enter your delivery address', 'error'); return null; }
  if (!city || !state) { showToast('⚠️ Please enter your city and state', 'error'); return null; }
  if (!pin || pin.replace(/\D/g,'').length !== 6) { showToast('⚠️ Please enter a valid 6-digit PIN code', 'error'); return null; }

  return { firstName, lastName, email, phone: phone.replace(/\D/g,'').slice(-10), addr1, addr2, city, state, pin };
}

// ── ORDER TOTAL ──
function getOrderTotal() {
  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);
  // Check both activePromoCode and appliedDiscount (same value, two variable names used in different places)
  let disc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    disc = activePromoCode.type === 'pct' ? Math.round(sub * activePromoCode.value / 100) : Math.min(activePromoCode.value, sub);
  } else if (appliedDiscount) {
    disc = appliedDiscount.type === 'percent' ? Math.round(sub * appliedDiscount.value / 100) : appliedDiscount.value;
  }
  const ship = 0; // Free shipping for online payment
  return { sub, disc, ship, total: Math.max(0, sub - disc + ship) };
}

// ── GENERATE ORDER ID ──
function generateOrderId() {
  return 'AVC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

// ══════════════════════════════════════════════
// MAIN PAYMENT ENTRY POINT
// Called when user clicks "Pay Securely"
// ══════════════════════════════════════════════
async function initiatePayment() {
  if (STORE.cart.length === 0) { showToast('🛒 Your cart is empty!', 'error'); return; }

  const formData = validateCheckoutForm();
  if (!formData) return;

  const { total, sub, disc, ship } = getOrderTotal();
  const orderId = generateOrderId();

  // Lock button
  const btn = document.querySelector('#page-checkout .checkout-btn');
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Opening Payment Gateway...'; }

  // Always show the Cashfree payment modal UI
  // In PRODUCTION: the modal calls your backend to get a payment_session_id
  // then opens the real Cashfree SDK checkout
  openPaymentGateway(orderId, total, sub, disc, ship, formData, btn, origText);
}

// ══════════════════════════════════════════════
// CASHFREE PAYMENT GATEWAY MODAL
// This opens a full-screen payment UI
// ══════════════════════════════════════════════
function openPaymentGateway(orderId, total, sub, disc, ship, formData, btn, origText) {

  // Store payment context globally to avoid quote-escaping issues in onclick
  window._pendingPayment = { orderId, total, sub, disc, ship, formData };

  // Remove any existing modal
  document.getElementById('cfPayModal')?.remove();

  // Build cart items HTML
  const cartItems = STORE.cart.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return '';
    const price = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    const pack = item.tierTabs ? ` (${item.tierTabs} tabs)` : '';
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:.82rem">
      <span style="color:#444">${p.name}${pack} × ${item.qty}</span>
      <span style="font-weight:700;color:#2D5016">₹${(price * item.qty).toLocaleString('en-IN')}</span>
    </div>`;
  }).join('');

  const discHtml = disc > 0
    ? `<div style="display:flex;justify-content:space-between;font-size:.78rem;color:#27ae60;margin-bottom:4px">
        <span>Discount (${appliedDiscount ? appliedDiscount.label : 'Applied'})</span>
        <span>-₹${disc.toLocaleString('en-IN')}</span>
       </div>` : '';

  const modal = document.createElement('div');
  modal.id = 'cfPayModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:100%;max-width:480px;max-height:94vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,0.45)">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2D5016,#4a7c28);padding:20px 24px;border-radius:20px 20px 0 0;color:white;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:1.05rem;font-weight:800">🔒 Secure Checkout</div>
          <div style="font-size:.68rem;opacity:.8;margin-top:2px">Powered by Cashfree · PCI DSS Secured</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.8rem;font-weight:900">₹${total.toLocaleString('en-IN')}</div>
          <div style="font-size:.62rem;opacity:.75">Total payable</div>
        </div>
      </div>

      <div style="padding:20px 22px">

        <!-- Order Summary -->
        <div style="background:#f8fdf4;border:1px solid #c8e6a8;border-radius:12px;padding:14px;margin-bottom:16px">
          <div style="font-weight:700;font-size:.75rem;color:#2D5016;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">📦 Order · ${orderId}</div>
          ${cartItems}
          <div style="margin-top:10px;padding-top:8px;border-top:1.5px solid #c8e6a8">
            <div style="display:flex;justify-content:space-between;font-size:.78rem;color:#666;margin-bottom:3px"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
            ${discHtml}
            <div style="display:flex;justify-content:space-between;font-size:.78rem;color:#666;margin-bottom:6px"><span>Shipping</span><span style="color:${ship === 0 ? '#27ae60' : '#333'}">${ship === 0 ? 'FREE' : '₹' + ship}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:.95rem;color:#2D5016"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <!-- Delivery Info -->
        <div style="background:#fafafa;border-radius:10px;padding:11px 14px;margin-bottom:16px;font-size:.78rem;color:#555;line-height:1.6">
          <span style="font-weight:700;color:#222">👤 Ship to: </span>
          ${formData.firstName} ${formData.lastName} · ${formData.phone}<br>
          ${formData.addr1}, ${formData.city}, ${formData.state} – ${formData.pin}<br>
          <span style="color:#2D5016">✉ ${formData.email}</span>
        </div>

        <!-- Payment Methods Title -->
        <div style="font-weight:700;font-size:.85rem;color:#222;margin-bottom:10px">💳 Select Payment Method</div>

        <!-- Payment Buttons -->
        <div style="display:grid;gap:10px;margin-bottom:14px">

          <button class="cfPayBtn" onclick="startPayment('upi')"
            style="background:linear-gradient(135deg,#5f48ea,#7c3aed);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">📱</span>
            <div style="flex:1">
              <div>UPI · Google Pay / PhonePe / BHIM</div>
              <div style="font-size:.68rem;opacity:.8;font-weight:400;margin-top:1px">Instant transfer · No extra charges</div>
            </div>
            <span style="background:rgba(255,255,255,.25);padding:2px 8px;border-radius:100px;font-size:.62rem;white-space:nowrap">⭐ BEST</span>
          </button>

          <button class="cfPayBtn" onclick="startPayment('card')"
            style="background:linear-gradient(135deg,#1a1a2e,#2d2d5e);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">💳</span>
            <div>
              <div>Credit / Debit Card</div>
              <div style="font-size:.68rem;opacity:.7;font-weight:400;margin-top:1px">Visa · Mastercard · RuPay · AmEx</div>
            </div>
          </button>

          <button class="cfPayBtn" onclick="startPayment('netbanking')"
            style="background:linear-gradient(135deg,#0052cc,#0070f3);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">🏦</span>
            <div>
              <div>Net Banking</div>
              <div style="font-size:.68rem;opacity:.7;font-weight:400;margin-top:1px">All major Indian banks supported</div>
            </div>
          </button>

          <button class="cfPayBtn" onclick="startPayment('emi')"
            style="background:linear-gradient(135deg,#c0392b,#e74c3c);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">📊</span>
            <div>
              <div>EMI — No Cost Available</div>
              <div style="font-size:.68rem;opacity:.7;font-weight:400;margin-top:1px">3 / 6 / 9 / 12 months · Partner banks</div>
            </div>
          </button>

        </div>

        <!-- Trust Badges -->
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px;flex-wrap:wrap">
          <span style="font-size:.68rem;color:#999;display:flex;align-items:center;gap:4px">🔒 256-bit SSL</span>
          <span style="font-size:.68rem;color:#999;display:flex;align-items:center;gap:4px">✅ PCI DSS</span>
          <span style="font-size:.68rem;color:#999;display:flex;align-items:center;gap:4px">🛡️ Cashfree Secured</span>
        </div>

        <!-- Cancel -->
        <button onclick="closePaymentModal()" style="width:100%;background:#f2f2f2;color:#777;border:none;border-radius:10px;padding:11px;font-size:.82rem;cursor:pointer">
          ✕ Cancel &amp; Go Back
        </button>

      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Re-enable checkout button
  if (btn) { btn.disabled = false; btn.textContent = origText || '🔒 Pay Securely via Cashfree'; }
}
// ── CLOSE PAYMENT MODAL ──
function closePaymentModal() {
  document.getElementById('cfPayModal')?.remove();
}

// ══════════════════════════════════════════════
// startPayment(method) — called by modal buttons
// Reads from window._pendingPayment (no escaping issues)
// ══════════════════════════════════════════════
async function startPayment(method) {
  const pd = window._pendingPayment;
  if (!pd) { showToast('Payment session expired. Please try again.', 'error'); closePaymentModal(); return; }

  const { orderId, total, formData } = pd;

  // Get checkout button reference so we can re-enable it on error
  const btn = document.querySelector('#page-checkout .checkout-btn');
  const origText = btn ? btn.textContent : '🔒 Pay Securely via Cashfree';

  // Lock all pay buttons and show spinner on selected
  document.querySelectorAll('.cfPayBtn').forEach(b => {
    b.disabled = true;
    b.style.opacity = '0.5';
  });

  const methodLabels = { upi:'UPI', card:'Credit/Debit Card', netbanking:'Net Banking', emi:'EMI' };
  const activeBtn = [...document.querySelectorAll('.cfPayBtn')].find(b => b.onclick.toString().includes(`'${method}'`));
  if (activeBtn) {
    activeBtn.style.opacity = '1';
    activeBtn.innerHTML = `<span style="font-size:1.4rem">⏳</span> <span>Processing ${methodLabels[method]}...</span>`;
  }

  // Close modal after brief delay and show processing screen
  await new Promise(r => setTimeout(r, 600));
  closePaymentModal();
  showProcessingScreen(orderId, total, method);

  // ────────────────────────────────────────────────────────
  // CASHFREE PAYMENT FLOW — PRODUCTION
  // ────────────────────────────────────────────────────────

  window.ASCOVITA_API_ENDPOINT = API_BASE;
  const apiEndpoint = window.ASCOVITA_API_ENDPOINT;

  try {
    // ── STEP 1: Wake up Render backend (free tier cold-start fix) ──
    updateProcessingStatus(10, '⏳ Starting payment server (may take 30s on first load)...');
    try {
      await fetch(apiEndpoint + '/');
      await new Promise(r => setTimeout(r, 2000)); // wait 2s for backend to fully wake
    } catch(e) { /* ignore */ }

    // ── STEP 2: Create Cashfree order on backend ──
    // NOTE: No AbortSignal used here — AbortSignal is not cloneable and causes
    // DataCloneError when Cashfree SDK calls postMessage() internally
    updateProcessingStatus(25, 'Creating secure payment session...');
    const resp = await fetch(apiEndpoint + '/api/create-cashfree-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id:       orderId,
        amount:         total,
        order_amount:   total,
        order_currency: 'INR',
        customer_name:  formData.firstName + ' ' + formData.lastName,
        customer_email: formData.email,
        customer_phone: formData.phone.replace(/^\+?91/, '').replace(/\D/g, ''),
        customer_details: {
          customer_id:    'CUST_' + formData.phone.replace(/\D/g, ''),
          customer_name:  formData.firstName + ' ' + formData.lastName,
          customer_email: formData.email,
          customer_phone: formData.phone.replace(/^\+?91/, '').replace(/\D/g, ''),
        }
      })
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'Backend error ' + resp.status);
    }
    const sessionData = await resp.json();
    const payment_session_id = sessionData.payment_session_id;
    if (!payment_session_id) throw new Error('No payment session received from server');

    // ── STEP 3: Initialize Cashfree SDK ──
    updateProcessingStatus(45, 'Loading payment gateway...');

    // Wait for Cashfree global to be available (max 15s)
    let CF = null;
    for (let i = 0; i < 15; i++) {
      // Cashfree CDN sets window.Cashfree as a function
      if (typeof window.Cashfree === 'function') { CF = window.Cashfree; break; }
      // Some environments expose it as global Cashfree
      try { if (typeof Cashfree === 'function') { CF = Cashfree; break; } } catch(e) {}
      await new Promise(r => setTimeout(r, 1000));
      updateProcessingStatus(45, 'Loading payment gateway... (' + (i+1) + 's)');
    }

    if (!CF) throw new Error('Cashfree SDK not loaded. Please refresh the page and try again.');

    // Initialize with mode — Cashfree CDN v3 pattern
    let cfInstance;
    try {
      cfInstance = CF({ mode: 'production' });
    } catch(e) {
      console.error('CF init error:', e);
      throw new Error('Payment gateway initialization failed: ' + e.message);
    }

    // ── STEP 4: Open Cashfree checkout ──
    updateProcessingStatus(60, 'Opening secure checkout...');

    // Save pending data before redirect
    localStorage.setItem('asc_pend_'+orderId, JSON.stringify({formData,total,method:'redirect'}));

    // Show a "Redirecting..." message instead of hiding screen — looks professional
    // We'll hide it if the redirect doesn't happen (inline payment)
    updateProcessingStatus(75, '🔒 Redirecting to secure payment...');
    // Show redirecting message overlay
    const procScreen = document.getElementById('processingScreen') || document.getElementById('paymentProcessing');
    const procMsg = document.querySelector('.processing-msg') || document.querySelector('.proc-status');
    if (procMsg) procMsg.innerHTML = '🔒 Redirecting to secure Cashfree checkout&hellip;<br><small style="opacity:.6;font-size:.78rem">Please wait, do not press back</small>';

    const returnUrl = window.location.origin + window.location.pathname + '?cf_order=' + orderId;
    // ── Set a redirect flag so we know the page is leaving ──
    let isRedirecting = false;

    const result = await cfInstance.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget:   '_self',
      returnUrl:        returnUrl,
      mode:             'production',
      onRedirect: () => { isRedirecting = true; },
    });

    // If page is navigating away to Cashfree — do nothing, let it redirect
    // The result here is from _inline_ payment (UPI/Card widget), not redirect
    if (isRedirecting) {
      // Browser is leaving the page — keep showing "Opening checkout..." screen
      // Do NOT show error — page will redirect momentarily
      return;
    }

    // Only reach here for inline (non-redirect) payment results

    // ── STEP 5: Verify inline result ──
    if (!result || result.error) {
      const errMsg = (result?.error?.message) || (result?.error?.type) || 'Payment cancelled or failed.';
      showPaymentError(errMsg, orderId, formData, total, method);
      if (btn) { btn.disabled = false; btn.textContent = origText; }
      return;
    }

    // Check payment status — try backend verification first for accuracy
    showProcessingScreen(orderId, total, method);
    updateProcessingStatus(80, 'Verifying payment...');
    let verified = false;

    try {
      const verifyResp = await fetch(apiEndpoint + '/api/verify-order/' + orderId);
      const verifyData = await verifyResp.json();
      const status = (verifyData.order_status || verifyData.payment_status || '').toUpperCase();
      // Only PAID or SUCCESS = real payment. ACTIVE/PENDING = user didn't pay.
      verified = (status === 'PAID' || status === 'SUCCESS');
      if (!verified) {
      }
    } catch(e) {
      // If backend verify fails, ONLY trust explicit SUCCESS from paymentDetails
      // Never trust result.redirect — it fires even when user closes checkout
      const rd = result && result.paymentDetails;
      verified = !result?.error && rd && (
        rd.paymentStatus === 'SUCCESS' ||
        rd.paymentMessage === 'Payment successful'
      ) && result?.transaction?.txStatus === 'SUCCESS';
      // Default to NOT verified if we can't confirm — safer to ask user to contact support
    }

    if (verified) {
      updateProcessingStatus(100, '✅ Payment confirmed!');
      await new Promise(r => setTimeout(r, 600));
      hideProcessingScreen();
      await finalizeOrder(orderId, formData, total, method);
    } else {
      hideProcessingScreen();
      showPaymentError('Payment could not be verified. If amount was deducted, contact us at +91 98985 82650 with Order ID: ' + orderId, orderId, formData, total, method);
      if (btn) { btn.disabled = false; btn.textContent = origText; }
    }

  } catch(err) {
    // If we're mid-redirect, suppress errors — browser is leaving the page
    if (typeof isRedirecting !== 'undefined' && isRedirecting) return;
    // Also suppress if page is actually navigating (document hidden or unloading)
    if (document.hidden || document.visibilityState === 'hidden') return;
    
    hideProcessingScreen();
    console.error('Payment error:', err);
    const msg = err.name === 'TimeoutError'
      ? 'Our payment server is starting up (takes ~30 seconds on first load). Please wait 30 seconds and click Retry Payment.'
      : (err.message || 'Payment failed. Please try again.');
    showPaymentError(msg, orderId, formData, total, method);
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
}

// ══════════════════════════════════════════════
// COD — called directly from checkout page (no modal)
// ══════════════════════════════════════════════
async function initiateCOD() {
  if (STORE.cart.length === 0) { showToast('🛒 Your cart is empty!', 'error'); return; }
  const formData = validateCheckoutForm();
  if (!formData) return;

  const { sub, disc } = getOrderTotal();
  const orderId = generateOrderId();
  const netSub = sub - disc;
  const codCharge = netSub >= 599 ? 0 : 60;
  const codTotal = netSub + codCharge;

  // Store for COD flow
  window._pendingPayment = { orderId, total: codTotal, sub, disc, formData };

  // Show overlay
  const overlay = document.createElement('div');
  overlay.id = 'codOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:#fff;border-radius:20px;padding:32px 28px;text-align:center;max-width:340px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
    <div style="font-size:3rem;margin-bottom:12px">💵</div>
    <div style="font-weight:800;font-size:1.15rem;color:#2D5016;margin-bottom:6px">Confirm COD Order</div>
    <div style="font-size:.85rem;color:#444;margin-bottom:4px">Order: <strong>${orderId}</strong></div>
    <div style="font-size:.9rem;color:#333;margin:10px 0;font-weight:700">Total: ₹${codTotal.toLocaleString('en-IN')}</div>
    ${codCharge > 0 ? `<div style="font-size:.75rem;color:#888;margin-bottom:16px">Includes ₹${codCharge} COD charge</div>` : `<div style="font-size:.75rem;color:#27ae60;font-weight:700;margin-bottom:16px">✅ Free COD on orders ≥ ₹599</div>`}
    <div style="display:flex;gap:10px;margin-top:8px">
      <button onclick="document.getElementById('codOverlay').remove()" style="flex:1;padding:13px;background:#f0f0f0;color:#555;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:.88rem">Cancel</button>
      <button onclick="confirmCODOrder('${orderId}',${codTotal},${codCharge})" style="flex:2;padding:13px;background:linear-gradient(135deg,#f39c12,#e67e22);color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:.88rem">✅ Confirm COD Order</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

async function confirmCODOrder(orderId, codTotal, codCharge) {
  const overlay = document.getElementById('codOverlay');
  if (overlay) overlay.innerHTML = `<div style="background:#fff;border-radius:20px;padding:32px 28px;text-align:center;max-width:340px;width:90%">
    <div style="font-size:2.5rem;margin-bottom:12px">⏳</div>
    <div style="font-weight:700;color:#2D5016">Placing your order...</div>
  </div>`;

  const pd = window._pendingPayment;
  if (!pd) { if(overlay) overlay.remove(); showToast('Session expired', 'error'); return; }

  try {
    await finalizeOrder(orderId, pd.formData, codTotal, 'cod', codCharge);
    if (overlay) overlay.remove();
    // finalizeOrder calls showPage('thankyou')
  } catch(err) {
    if (overlay) overlay.remove();
    showPaymentError('COD order failed: ' + err.message, orderId, pd.formData, codTotal, 'cod');
  }
}

// ══════════════════════════════════════════════
// COD PAYMENT FLOW (from modal — kept for compatibility)
// ══════════════════════════════════════════════
async function startCOD() {
  const pd = window._pendingPayment;
  if (!pd) { showToast('Session expired. Please try again.', 'error'); closePaymentModal(); return; }

  const { orderId, sub, disc, formData } = pd;

  // COD charge: free if order >= 599, else ₹60
  const netSub = sub - disc;
  const codCharge = netSub >= 599 ? 0 : 60;
  const codTotal = netSub + codCharge;

  closePaymentModal();

  // Show brief confirmation overlay (not "Processing Payment" which implies card)
  const overlay = document.createElement('div');
  overlay.id = 'codOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:#fff;border-radius:20px;padding:32px 28px;text-align:center;max-width:320px;width:90%">
    <div style="font-size:3rem;margin-bottom:12px">💵</div>
    <div style="font-weight:800;font-size:1.1rem;color:#2D5016;margin-bottom:6px">Confirming COD Order...</div>
    <div style="font-size:.85rem;color:#666">Order: ${orderId}</div>
    <div style="font-size:.82rem;color:#555;margin-top:8px">Total: ₹${codTotal}${codCharge > 0 ? ' (incl. ₹' + codCharge + ' COD charge)' : ' (Free COD)'}</div>
    <div style="margin-top:16px;height:4px;background:#eee;border-radius:4px;overflow:hidden">
      <div style="height:100%;background:#2D5016;border-radius:4px;animation:codprog 1.5s ease forwards" id="codProgressBar"></div>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  // Animate progress bar
  const styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes codprog{from{width:0}to{width:100%}}';
  document.head.appendChild(styleTag);

  try {
    await finalizeOrder(orderId, formData, codTotal, 'cod', codCharge);
    overlay.remove();
    // finalizeOrder calls showPage('thankyou') — done!
  } catch(err) {
    overlay.remove();
    showPaymentError('COD order failed: ' + err.message, orderId, formData, codTotal, 'cod');
  }
}


// Helper to update the processing screen status bar
function updateProcessingStatus(pct, msg) {
  const bar = document.getElementById('cfPBar');
  const status = document.getElementById('cfPStatus');
  if (bar) bar.style.width = pct + '%';
  if (status) status.textContent = msg;
}

// ── PROCESSING OVERLAY ──
function showProcessingScreen(orderId, total, method) {
  document.getElementById('cfProcessing')?.remove();
  const methodIcons = { upi:'📱', card:'💳', netbanking:'🏦', emi:'📊' };
  const methodNames = { upi:'UPI', card:'Card', netbanking:'Net Banking', emi:'EMI' };

  const el = document.createElement('div');
  el.id = 'cfProcessing';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(10,20,10,0.92);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui;text-align:center;padding:32px';
  el.innerHTML = `
    <div style="font-size:3.5rem;margin-bottom:20px;animation:cfSpin 1.2s linear infinite">${methodIcons[method] || '💳'}</div>
    <div style="font-size:1.3rem;font-weight:800;margin-bottom:8px">Processing Payment</div>
    <div style="font-size:.85rem;opacity:.7;margin-bottom:4px">₹${total.toLocaleString('en-IN')} via ${methodNames[method] || method}</div>
    <div style="font-size:.72rem;opacity:.5;margin-bottom:28px">Order: ${orderId}</div>
    <div style="width:240px;height:5px;background:rgba(255,255,255,.15);border-radius:100px;overflow:hidden">
      <div id="cfPBar" style="height:100%;width:0%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:100px;transition:width .4s ease"></div>
    </div>
    <div id="cfPStatus" style="font-size:.72rem;opacity:.5;margin-top:12px">Connecting to payment gateway...</div>
    <div style="font-size:.65rem;opacity:.35;margin-top:24px">🔒 256-bit SSL · Cashfree Secured · PCI DSS</div>
    <style>@keyframes cfSpin{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}</style>
  `;
  document.body.appendChild(el);
}

async function animateProcessing() {
  const steps = [
    [15, 'Connecting to Cashfree...'],
    [35, 'Authenticating...'],
    [55, 'Verifying order details...'],
    [75, 'Processing payment...'],
    [90, 'Confirming transaction...'],
    [100, '✅ Payment successful!'],
  ];
  for (const [pct, msg] of steps) {
    await new Promise(r => setTimeout(r, 480));
    const bar = document.getElementById('cfPBar');
    const status = document.getElementById('cfPStatus');
    if (bar) bar.style.width = pct + '%';
    if (status) status.textContent = msg;
  }
  await new Promise(r => setTimeout(r, 500));
}

function hideProcessingScreen() {
  document.getElementById('cfProcessing')?.remove();
}

// ── PAYMENT ERROR — with Retry, Back to Cart, Contact buttons ──
function showPaymentError(msg, orderId, formData, total, method) {
  hideProcessingScreen();
  closePaymentModal();
  document.getElementById('payErrorOverlay')?.remove();

  const el = document.createElement('div');
  el.className = 'pay-error-overlay';
  el.id = 'payErrorOverlay';
  const orderRef = orderId ? `<div style="font-size:.72rem;color:#999;margin-bottom:16px;background:#f5f5f5;padding:8px 14px;border-radius:8px">Order Ref: <strong>${orderId}</strong></div>` : '';
  el.innerHTML = `
    <div class="pay-error-box">
      <div class="pay-error-icon">❌</div>
      <div class="pay-error-title">Payment Failed</div>
      ${orderRef}
      <p class="pay-error-msg">${msg}</p>
      <div class="pay-error-actions">
        <button class="pay-error-try" onclick="document.getElementById('payErrorOverlay')?.remove(); initiatePayment();">
          🔄 Retry Payment
        </button>
        <button class="pay-error-back" onclick="document.getElementById('payErrorOverlay')?.remove(); showPage('cart');">
          ← Back to Cart
        </button>
        <button class="pay-error-back" style="background:#fff3cd;border-color:#ffc107;color:#856404" onclick="document.getElementById('payErrorOverlay')?.remove(); window.open('https://wa.me/919898582650?text=Payment+failed+for+order+${orderId || ''}+amount+₹${total || ''}+please+help','_blank')">
           WhatsApp Support
        </button>
        <button class="pay-error-cancel" onclick="document.getElementById('payErrorOverlay')?.remove(); showPage('home');">
          Cancel & Continue Shopping
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
}

// ── FINALIZE ORDER AFTER SUCCESSFUL PAYMENT ──
async function finalizeOrder(orderId, formData, total, method, codCharge) {
  const orderNumEl = document.getElementById('orderNum');
  if (orderNumEl) orderNumEl.textContent = orderId;

  // Build order items
  const cartSnapshot = [...STORE.cart];
  const srItems = cartSnapshot.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return null;
    const price = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    const mrp   = item.tierMrp  !== undefined ? item.tierMrp  : p.price;
    return {
      name: p.name + (item.tierTabs ? ` (${item.tierTabs} tabs)` : ''),
      sku:  'ASC-' + p.id + (item.tierTabs ? '-' + item.tierTabs : ''),
      units: item.qty,
      selling_price: price,
      mrp: mrp,
      discount: Math.max(0, mrp - price),
      tax: '',
      hsn: '30049099',
    };
  }).filter(Boolean);

  const sub  = srItems.reduce((s, i) => s + i.selling_price * i.units, 0);
  const disc = srItems.reduce((s, i) => s + i.discount * i.units, 0);
  // Also add promo discount (on top of product tier discounts)
  let promoDisc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    promoDisc = activePromoCode.type === 'pct' ? Math.round(sub * activePromoCode.value / 100) : Math.min(activePromoCode.value, sub);
  } else if (appliedDiscount) {
    promoDisc = appliedDiscount.type === 'percent' ? Math.round(sub * appliedDiscount.value / 100) : appliedDiscount.value;
  }
  const totalDisc = disc + promoDisc;
  const ship = total - (sub - promoDisc);

  const nameParts = (formData.firstName + ' ' + formData.lastName).trim().split(' ');
  const firstName = nameParts[0] || formData.firstName;
  const lastName  = nameParts.slice(1).join(' ') || '.';

  // ── 1. Push to Shiprocket ──────────────────────────────────
  let srOrderId = null, srShipmentId = null, srAwb = null;
  let srStatus = 'Confirmed — Awaiting Dispatch';
  if (method !== 'demo') {
    try {
      const srResp = await fetch(SHIPROCKET_CONFIG.apiBase + '/api/create-shiprocket-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          order_date: new Date().toISOString().slice(0,19).replace('T',' '),
          pickup_location: SHIPROCKET_CONFIG.pickup_location,
          billing_customer_name: firstName, billing_last_name: lastName,
          billing_address: formData.addr1, billing_address_2: formData.addr2 || '',
          billing_city: formData.city, billing_pincode: formData.pin,
          billing_state: formData.state, billing_country: 'India',
          billing_email: formData.email, billing_phone: formData.phone,
          shipping_is_billing: true, order_items: srItems,
          payment_method: method === 'cod' ? 'COD' : 'Prepaid', sub_total: total,
          length: 15, breadth: 10, height: 10,
          weight: Math.max(0.2, srItems.reduce((s,i)=>s+i.units*0.1,0)),
        }),
      });
      const srData = await srResp.json();
      if (srResp.ok && srData.order_id) {
        srOrderId = srData.order_id; srShipmentId = srData.shipment_id; srAwb = srData.awb_code || null;
        srStatus = 'Pushed to Shiprocket — Ready to Ship 🚚';
        const trackBtn = document.getElementById('trackOrderBtn');
        if (trackBtn) { trackBtn.href = srAwb ? 'https://shiprocket.co/tracking/'+srAwb : 'https://shiprocket.in/shipment-tracking/'; trackBtn.style.display='inline-flex'; }
        const srIdEl = document.getElementById('srOrderId');
        if (srIdEl) { srIdEl.textContent = srOrderId; const row=document.getElementById('srOrderRow'); if(row) row.style.display='flex'; }
      } else {
        // Log the actual error from Shiprocket so we can debug
        console.error('❌ Shiprocket error:', JSON.stringify(srData));
        srStatus = 'Order Confirmed — Dispatch Pending (SR: ' + (srData.error || srData.message || 'error') + ')';
      }
    } catch(e) { console.error('❌ Shiprocket fetch failed:', e.message); }
  } else {
    srStatus = '';
  }

  // ── 2. Save order locally ──────────────────────────────────
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    orders.push({
      orderId, srOrderId, srShipmentId, srAwb,
      date: new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}),
      customer: `${formData.firstName} ${formData.lastName}`,
      email: formData.email, phone: formData.phone,
      address: `${formData.addr1}, ${formData.city}, ${formData.state} - ${formData.pin}`,
      total, method, items: srItems.map(i=>({name:i.name,qty:i.units,price:i.selling_price})),
      status: srStatus,
    });
    localStorage.setItem('asc_orders', JSON.stringify(orders));
  } catch(e) {}

  // ── 2b. Save order to Supabase via backend (shows in Admin) ────
  try {
      const _jwt = localStorage.getItem('asc_jwt') || '';
      const isOnlinePayment = (method !== 'cod');
      const orderPayload = {
        id: orderId,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        address_line1: formData.addr1,
        address_line2: formData.addr2 || '',
        city: formData.city,
        state: formData.state,
        pincode: formData.pin,
        total: total,
        payment_status: method === 'cod' ? 'COD - Pending' : 'Paid',
        fulfillment: 'Pending',
        payment_method: method,
        cf_order_id: orderId,
        shiprocket_id: srOrderId || null,
        items: JSON.stringify(srItems.map(i=>({name:i.name,qty:i.units,price:i.selling_price,id:cartSnapshot.find(c=>PRODUCTS.find(p=>p.id===c.id)?.name===i.name.split(' (')[0])?.id}))),
      };

      if (isOnlinePayment) {
        // ── ONLINE PAYMENT: re-verify with Cashfree before saving ─────────
        const confirmResp = await fetch(API_BASE + '/api/confirm-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ..._jwt ? { 'Authorization': 'Bearer ' + _jwt } : {} },
          body: JSON.stringify({ cf_order_id: orderId, order_data: orderPayload }),
        });
        const confirmResult = await confirmResp.json();
        if (!confirmResp.ok) {
          console.error('🚨 confirm-order rejected:', confirmResult);
          showPaymentError(
            confirmResult.message || 'Payment could not be confirmed. If money was deducted, contact +91 98985 82650 with Order ID: ' + orderId,
            orderId, formData, total, method
          );
          return; // Stop — do not show thank-you page
        }

      } else {
        // ── COD: confirm via dedicated endpoint (duplicate-safe, validated) ─
        const codResp = await fetch(API_BASE + '/api/confirm-cod-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ..._jwt ? { 'Authorization': 'Bearer ' + _jwt } : {} },
          body: JSON.stringify({ order_id: orderId, order_data: orderPayload }),
        });
        const codResult = await codResp.json();
        if (!codResp.ok) {
          // Order failed to save — do NOT show thank-you
          console.error('🚨 confirm-cod-order failed:', codResult);
          const errMsg = codResult.error?.includes('stock') || codResult.error?.includes('Insufficient')
            ? codResult.error  // stock error — show exact message
            : 'Order could not be placed. Please try again or contact +91 98985 82650 with Order ID: ' + orderId;
          showPaymentError(errMsg, orderId, formData, total, 'cod');
          return; // Stop — do not show thank-you page
        }
        console.log('[COD] ✅ Order confirmed:', codResult.order_id, codResult.duplicate ? '(duplicate)' : '');
      }
  } catch(e) {
    // Network error during order save
    console.error('Order save failed:', e.message);
    if (method === 'cod') {
      showPaymentError('Could not reach server to place order. Please check your connection and try again.', orderId, formData, total, method);
      return;
    }
    // Online payment: order was already verified paid — continue to thank-you even if save failed
    // (webhook will save it server-side)
    console.warn('Online order save failed but payment confirmed — proceeding to thank-you');
  }

  // ── 3. Generate invoice ────────────────────────────────────
  let invoiceHtml = null;
  try {
    invoiceHtml = generateInvoice({ orderId, formData, srItems, sub, disc: totalDisc, promoDisc, ship, total, method, srOrderId });
  } catch(e) { console.warn('Invoice:', e); }

  // ── 4. Send confirmation email ─────────────────────────────
  try {
    await sendOrderEmail({ orderId, formData, srItems, sub, totalDisc, promoDisc, ship, total, method, srAwb, invoiceHtml });
  } catch(e) { console.warn('Email:', e.message); }

  // ── 5. Clear cart + show thank-you ────────────────────────
  STORE.cart = []; STORE.save();
  activePromoCode = null; appliedDiscount = null; window._pendingPayment = null;
  // Track purchase in Google Analytics
  try {
    window._trackPurchase && window._trackPurchase(orderId, total,
      srItems.map(i => ({ item_name: i.name, price: i.selling_price, quantity: i.units }))
    );
  } catch(e) {}
  showPage('thankyou');
  showToast(`✅ Order confirmed! Invoice opened & email sent 🧾`);
}
