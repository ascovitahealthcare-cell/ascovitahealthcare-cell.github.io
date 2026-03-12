// AUTO EMAIL — Sends order confirmation via EmailJS
// Setup: https://www.emailjs.com (free — 200 emails/month)
// 1. Create account → Email Services → connect Gmail
// 2. Email Templates → create template with variables below
// 3. Replace EMAILJS_SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY
// ══════════════════════════════════════════════════════════════
async function sendOrderEmail({ orderId, formData, srItems, sub, totalDisc, promoDisc, ship, total, method, srAwb, invoiceHtml }) {
  // ── CONFIG — replace these 3 values with yours from emailjs.com ──
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz456'
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'user_AbCdEfGhIj'

  // Build items table for email
  const itemsText = srItems.map(i => `${i.name} × ${i.units} = ₹${(i.selling_price * i.units).toLocaleString('en-IN')}`).join('\n');
  const itemsHtml = srItems.map(i =>
    `<tr style="border-bottom:1px solid #eee">
       <td style="padding:8px 12px">${i.name}</td>
       <td style="padding:8px 12px;text-align:center">${i.units}</td>
       <td style="padding:8px 12px;text-align:right">₹${i.selling_price.toLocaleString('en-IN')}</td>
       <td style="padding:8px 12px;text-align:right;font-weight:700">₹${(i.selling_price * i.units).toLocaleString('en-IN')}</td>
     </tr>`
  ).join('');

  const trackUrl = srAwb ? `https://shiprocket.co/tracking/${srAwb}` : 'https://shiprocket.in/shipment-tracking/';
  const methodName = method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : method === 'netbanking' ? 'Net Banking' : method === 'emi' ? 'EMI' : method === 'demo' ? 'Demo (Test)' : method;

  // Full HTML email body
  const emailHtml = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2D5016,#4a7c28);padding:28px 32px;color:white;text-align:center">
      <div style="font-size:24px;font-weight:900;margin-bottom:4px">🌿 Ascovita Healthcare</div>
      <div style="font-size:13px;opacity:.8">Order Confirmation</div>
    </div>
    <div style="padding:28px 32px">
      <h2 style="font-size:18px;color:#2D5016;margin-bottom:4px">Hi ${formData.firstName}! Your order is confirmed 🎉</h2>
      <p style="color:#666;font-size:14px;margin-bottom:20px">Thank you for shopping with Ascovita. Here's your order summary.</p>

      <div style="background:#f8fdf4;border:1px solid #c8e6a8;border-radius:8px;padding:14px 18px;margin-bottom:20px;font-size:13px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong>Order ID:</strong><span style="color:#2D5016;font-weight:700">${orderId}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong>Date:</strong><span>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</span></div>
        <div style="display:flex;justify-content:space-between"><strong>Payment:</strong><span>${methodName} ✅ PAID</span></div>
      </div>

      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:10px">Order Items</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
        <thead><tr style="background:#2D5016;color:white">
          <th style="padding:8px 12px;text-align:left">Product</th>
          <th style="padding:8px 12px;text-align:center">Qty</th>
          <th style="padding:8px 12px;text-align:right">Price</th>
          <th style="padding:8px 12px;text-align:right">Total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="border-top:2px solid #2D5016;padding-top:12px;font-size:13px">
        <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
        ${totalDisc > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#16a34a;font-weight:700"><span>🏷️ Discount Saved</span><span>-₹${totalDisc.toLocaleString('en-IN')}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555"><span>Shipping</span><span>${ship === 0 ? '<span style="color:#16a34a">FREE</span>' : '₹' + ship}</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 4px;font-size:16px;font-weight:900;color:#2D5016;border-top:1px solid #e5e7eb;margin-top:6px"><span>Grand Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      </div>

      <div style="margin:20px 0;background:#f9f9f9;border-radius:8px;padding:14px 18px;font-size:13px;line-height:1.8">
        <strong style="display:block;margin-bottom:6px">📍 Delivery Address</strong>
        ${formData.firstName} ${formData.lastName}<br>
        ${formData.addr1}${formData.addr2 ? ', ' + formData.addr2 : ''}<br>
        ${formData.city}, ${formData.state} – ${formData.pin}, India<br>
        📞 ${formData.phone}
      </div>

      ${method !== 'demo' ? `<a href="${trackUrl}" style="display:block;background:#2D5016;color:white;text-align:center;padding:13px;border-radius:100px;font-weight:700;text-decoration:none;font-size:14px;margin:16px 0">📦 Track Your Order on Shiprocket</a>` : ''}

      <p style="font-size:12px;color:#999;text-align:center;margin-top:20px">
        For queries: <a href="mailto:Ascovitahealthcare@gmail.com" style="color:#2D5016">Ascovitahealthcare@gmail.com</a> | +91 98985 82650<br>
        Ascovita Healthcare · Near Rajshivalay Cinema, Anand – 388001, Gujarat
      </p>
    </div>
  </div>`;

  // Send via EmailJS
  if (typeof emailjs === 'undefined') {
    return;
  }
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
    console.info('📧 Demo email (EmailJS not configured yet). Email HTML ready:\n', emailHtml.substring(0, 200) + '...');
    return;
  }

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email:      formData.email,
    to_name:       formData.firstName + ' ' + formData.lastName,
    order_id:      orderId,
    order_total:   '₹' + total.toLocaleString('en-IN'),
    order_date:    new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'}),
    items_text:    itemsText,
    email_body:    emailHtml,
    company_email: 'Ascovitahealthcare@gmail.com',
    phone:         formData.phone,
    address:       `${formData.addr1}, ${formData.city}, ${formData.state} - ${formData.pin}`,
    tracking_url:  trackUrl,
  }, { publicKey: EMAILJS_PUBLIC_KEY });

}


// ══════════════════════════════════════════════════════════════
// INVOICE GENERATOR — Full GST Tax Invoice
// ══════════════════════════════════════════════════════════════
function generateInvoice({ orderId, formData, srItems, sub, disc, promoDisc, ship, total, method, srOrderId }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const invNo = 'INV-' + orderId.replace('AVC-','').replace('DEMO-','D');

  // GST calculation: 18% GST (CGST 9% + SGST 9% for Gujarat, IGST 18% for other states)
  const isGujarat = (formData.state || '').toLowerCase().includes('gujarat');
  const taxableBase = Math.round(sub / 1.18); // reverse-calculate base from inclusive price
  const gstTotal = sub - taxableBase;
  const cgst = isGujarat ? Math.round(gstTotal / 2) : 0;
  const sgst = isGujarat ? Math.round(gstTotal / 2) : 0;
  const igst = !isGujarat ? gstTotal : 0;

  const itemRows = srItems.map(item => {
    const base = Math.round((item.selling_price * item.units) / 1.18);
    const gst  = (item.selling_price * item.units) - base;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.sku}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.units}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.mrp}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.selling_price}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.discount > 0 ? item.discount * item.units : '-'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">18%</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${gst.toLocaleString('en-IN')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700">₹${(item.selling_price * item.units).toLocaleString('en-IN')}</td>
      </tr>`;
  }).join('');

  const gstRows = isGujarat ? `
    <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">CGST (9%)</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${cgst.toLocaleString('en-IN')}</td></tr>
    <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">SGST (9%)</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${sgst.toLocaleString('en-IN')}</td></tr>
  ` : `
    <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">IGST (18%)</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${igst.toLocaleString('en-IN')}</td></tr>
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${invNo} — Ascovita Healthcare</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #222; background:#fff; padding:30px; }
  .inv-wrap { max-width:900px; margin:0 auto; border:1px solid #ddd; border-radius:8px; overflow:hidden; }
  .inv-header { background:linear-gradient(135deg,#2D5016,#4a7c28); color:#fff; padding:28px 32px; display:flex; justify-content:space-between; align-items:flex-start; }
  .inv-logo-name { font-size:22px; font-weight:900; letter-spacing:.5px; }
  .inv-logo-sub { font-size:11px; opacity:.8; margin-top:3px; }
  .inv-company-addr { font-size:11px; opacity:.85; line-height:1.7; text-align:right; }
  .inv-meta { background:#f8fdf4; padding:20px 32px; display:flex; justify-content:space-between; border-bottom:2px solid #2D5016; }
  .inv-meta-block { line-height:1.8; }
  .inv-meta-block strong { font-size:11px; text-transform:uppercase; color:#666; letter-spacing:.5px; display:block; }
  .inv-meta-block span { font-size:14px; font-weight:700; color:#2D5016; }
  .inv-section { padding:20px 32px; }
  .inv-section h3 { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#666; margin-bottom:12px; }
  .inv-cust-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .inv-cust-box { background:#f9f9f9; border:1px solid #eee; border-radius:6px; padding:14px; line-height:1.8; }
  .inv-cust-box strong { font-size:11px; text-transform:uppercase; color:#999; display:block; margin-bottom:4px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#2D5016; color:#fff; }
  thead th { padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.3px; }
  thead th:not(:first-child) { text-align:right; }
  thead th:nth-child(3),thead th:nth-child(7) { text-align:center; }
  tbody tr:hover { background:#f8fdf4; }
  .inv-totals { background:#f8fdf4; border-top:2px solid #2D5016; }
  .inv-totals td { padding:7px 12px; }
  .inv-grand { background:#2D5016 !important; color:#fff; }
  .inv-grand td { padding:12px; font-size:15px; font-weight:900; }
  .inv-footer { background:#2D5016; color:white; padding:16px 32px; text-align:center; font-size:11px; opacity:.9; line-height:2; }
  .inv-status { display:inline-block; background:#22c55e; color:white; border-radius:100px; padding:3px 14px; font-size:11px; font-weight:700; margin-left:8px; }
  @media print { body{padding:0;} .no-print{display:none!important;} }
</style>
</head>
<body>
<div class="inv-wrap">
  <!-- HEADER -->
  <div class="inv-header">
    <div>
      <div class="inv-logo-name">🌿 ASCOVITA HEALTHCARE</div>
      <div class="inv-logo-sub">Organic Vitamins & Nutraceuticals</div>
      <div style="font-size:10px;opacity:.7;margin-top:6px">FSSAI Lic. No: 10024022001967 &nbsp;|&nbsp; GSTIN: 24XXXXX (update)</div>
    </div>
    <div class="inv-company-addr">
      <strong style="font-size:13px;display:block;margin-bottom:4px">TAX INVOICE</strong>
      Amin Auto Road, Near Rajshivalay Cinema<br>
      Anand – 388001, Gujarat, India<br>
      📞 +91 98985 82650<br>
      ✉ Ascovitahealthcare@gmail.com<br>
      🌐 ascovita.in
    </div>
  </div>

  <!-- META ROW -->
  <div class="inv-meta">
    <div class="inv-meta-block">
      <strong>Invoice Number</strong>
      <span>${invNo}</span>
    </div>
    <div class="inv-meta-block">
      <strong>Invoice Date</strong>
      <span>${dateStr}</span>
    </div>
    <div class="inv-meta-block">
      <strong>Order ID</strong>
      <span>${orderId}</span>
    </div>
    <div class="inv-meta-block">
      <strong>Payment</strong>
      <span>${method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : method === 'netbanking' ? 'Net Banking' : method === 'emi' ? 'EMI' : method === 'demo' ? '🧪 Demo' : method} <span class="inv-status" style="${method === 'demo' ? 'background:#f59e0b' : ''}">${method === 'demo' ? 'TEST MODE' : 'PAID'}</span></span>
    </div>
    ${srOrderId ? `<div class="inv-meta-block"><strong>Shiprocket ID</strong><span>${srOrderId}</span></div>` : ''}
  </div>

  <!-- CUSTOMER & SHIPPING -->
  <div class="inv-section">
    <h3>Bill To / Ship To</h3>
    <div class="inv-cust-grid">
      <div class="inv-cust-box">
        <strong>Customer Details</strong>
        <b>${formData.firstName} ${formData.lastName}</b><br>
        📞 ${formData.phone}<br>
        ✉ ${formData.email}
      </div>
      <div class="inv-cust-box">
        <strong>Delivery Address</strong>
        ${formData.addr1}${formData.addr2 ? ', ' + formData.addr2 : ''}<br>
        ${formData.city}, ${formData.state} – ${formData.pin}<br>
        India
      </div>
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <div class="inv-section" style="padding-top:0">
    <h3>Order Items</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th><th>SKU</th><th style="text-align:center">Qty</th>
          <th>MRP</th><th>Unit Price</th><th>Discount</th>
          <th style="text-align:center">GST</th><th>Tax Amt</th><th>Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tbody class="inv-totals">
        <tr><td colspan="7" style="padding:8px 12px;text-align:right;color:#555">Subtotal (incl. GST)</td><td colspan="2" style="padding:8px 12px;text-align:right;font-weight:700">₹${sub.toLocaleString('en-IN')}</td></tr>
        <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">Taxable Amount</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${taxableBase.toLocaleString('en-IN')}</td></tr>
        ${gstRows}
        ${disc > 0 ? `<tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#27ae60">Product Discount</td><td colspan="2" style="padding:6px 12px;text-align:right;color:#27ae60">-₹${disc.toLocaleString('en-IN')}</td></tr>` : ''}
        ${promoDisc > 0 ? `<tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#27ae60">🏷️ Promo Discount</td><td colspan="2" style="padding:6px 12px;text-align:right;color:#27ae60;font-weight:700">-₹${promoDisc.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">Shipping</td><td colspan="2" style="padding:6px 12px;text-align:right">${ship <= 0 ? '<span style="color:#27ae60">FREE</span>' : '₹' + ship}</td></tr>
        <tr class="inv-grand"><td colspan="7" style="text-align:right">GRAND TOTAL</td><td colspan="2" style="text-align:right">₹${total.toLocaleString('en-IN')}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- NOTES -->
  <div class="inv-section" style="border-top:1px solid #eee;font-size:11px;color:#666;line-height:1.9">
    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:.5px">Terms & Notes</strong><br>
    • All prices are inclusive of 18% GST &nbsp;|&nbsp; HSN Code: 30049099 (Nutraceuticals)<br>
    • Returns accepted within 7 days for sealed/unused products<br>
    • This is a computer-generated invoice and does not require a physical signature<br>
    • For queries: Ascovitahealthcare@gmail.com &nbsp;|&nbsp; +91 98985 82650
  </div>

  <!-- FOOTER -->
  <div class="inv-footer">
    Thank you for shopping with Ascovita Healthcare 🌿 &nbsp;|&nbsp; Made in India, Anand Gujarat &nbsp;|&nbsp; FSSAI Approved · GMP Certified · Lab Tested
  </div>
</div>

<div class="no-print" style="text-align:center;margin-top:24px;padding-bottom:30px">
  <button onclick="window.print()" style="background:#2D5016;color:white;border:none;padding:13px 32px;border-radius:100px;font-size:15px;font-weight:700;cursor:pointer;margin-right:12px">🖨️ Print Invoice</button>
  <button onclick="window.close()" style="background:#eee;color:#333;border:none;padding:13px 32px;border-radius:100px;font-size:15px;font-weight:700;cursor:pointer">✕ Close</button>
</div>

<!-- ── Media Lightbox ── -->
<div class="gallery-lightbox" id="galleryLightbox">
  <span class="lb-close" onclick="closeLightbox()">&#x2715;</span>
  <button class="lb-nav prev" onclick="lbStep(-1)">&#8249;</button>
  <div id="lbContent"></div>
  <button class="lb-nav next" onclick="lbStep(1)">&#8250;</button>
  <div id="lbCounter" style="color:#fff;font-size:0.85rem;margin-top:10px;opacity:0.7"></div>
</div>
</body></html>`;

  // Show invoice in new window + add download button on thank-you page
  const invWin = window.open('', '_blank', 'width=960,height=800,scrollbars=yes');
  if (invWin) { invWin.document.write(html); invWin.document.close(); }

  // Also put a "View Invoice" button on the thank-you page
  const tyPage = document.getElementById('page-thankyou');
  if (tyPage) {
    const existing = document.getElementById('invoiceBtn');
    if (existing) existing.remove();
    const invBtn = document.createElement('a');
    invBtn.id = 'invoiceBtn';
    invBtn.textContent = '🧾 Download / Print Invoice';
    invBtn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:#2D5016;color:white;border-radius:100px;padding:11px 26px;font-weight:700;font-size:.84rem;text-decoration:none;margin:8px 4px;cursor:pointer';
    invBtn.onclick = function() {
      const w = window.open('', '_blank', 'width=960,height=800,scrollbars=yes');
      if (w) { w.document.write(html); w.document.close(); }
    };
    const orderNumEl = document.getElementById('orderNum');
    if (orderNumEl && orderNumEl.parentNode) {
      orderNumEl.parentNode.insertAdjacentElement('afterend', invBtn);
    }
  }
}


// ── ORDER TRACKING ──
function trackOrder() {
  const input = document.getElementById('trackOrderInput');
  const orderId = input?.value?.trim();
  if (!orderId) { showToast('Please enter your Order ID', 'error'); return; }

  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId || o.orderId.includes(orderId));
    if (order) showToast(`📦 Order ${orderId}: ${order.status}`);
  } catch(e) {}
  window.open(SHIPROCKET_CONFIG.trackingUrl + orderId, '_blank');
}

// placeOrder() routes to initiatePayment() — defined above

// initCashfree() is called from the main DOMContentLoaded handler above

// ═══════════════════════════════════════════════════════
