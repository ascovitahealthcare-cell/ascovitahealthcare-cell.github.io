// ═══════════════════════════════════════════════════════
// ACCOUNT DASHBOARD
// ═══════════════════════════════════════════════════════

function loadAccountPage() {
  const user = getCurrentUser();
  if (!user) { openAuth('login'); return; }
  document.getElementById('accName')?.textContent != null && (document.getElementById('accName').textContent = user.name);
  document.getElementById('accEmail')?.textContent != null && (document.getElementById('accEmail').textContent = user.email);
  const parts = user.name.split(' ');
  const av=document.getElementById('accAvatar'); if(av) av.textContent = (parts[0][0] + (parts[1]?parts[1][0]:'')).toUpperCase();
  loadOrdersList();
  loadInvoicesList();
  prefillProfile(user);
}

function switchAccountPanel(panel) {
  document.querySelectorAll('.account-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.account-nav-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('panel-' + panel);
  if (el) el.classList.add('active');
  const navItems = document.querySelectorAll('.account-nav-item');
  const labels = ['orders','tracking','invoices','profile'];
  const idx = labels.indexOf(panel);
  if (idx >= 0 && navItems[idx]) navItems[idx].classList.add('active');
}

function loadOrdersList() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    if (orders.length === 0) {
      container.innerHTML = `<div class="no-orders"><div class="no-orders-ico">📦</div><h3 style="margin-bottom:8px">No orders yet</h3><p style="color:var(--gray);margin-bottom:20px">Your order history will appear here after your first purchase.</p><button class="btn-primary" onclick="showPage('shop')">Start Shopping →</button></div>`;
      return;
    }
    container.innerHTML = orders.slice().reverse().map(o => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">${o.orderId}</div>
            <div class="order-date">${o.date}</div>
          </div>
          <span class="order-status ${o.status?.toLowerCase().includes('dispatch')||o.status?.toLowerCase().includes('confirm') ? 'confirmed' : o.status?.toLowerCase().includes('ship') ? 'shipped' : o.status?.toLowerCase().includes('deliver') ? 'delivered' : 'pending'}">${o.status || 'Processing'}</span>
        </div>
        <div class="order-items">${o.items?.map(i => `${i.name} × ${i.qty}`).join(', ') || 'Items loading...'}</div>
        <div class="order-footer">
          <div class="order-total">₹${(o.total||0).toLocaleString('en-IN')}</div>
          <div style="display:flex;gap:8px">
            <button class="invoice-btn" onclick="downloadInvoice('${o.orderId}')">🧾 Invoice</button>
            <button class="order-track-btn" onclick="openTracking('${o.orderId}')">🚚 Track</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch(e) { container.innerHTML = '<p style="color:var(--gray)">Could not load orders.</p>'; }
}

function loadInvoicesList() {
  const container = document.getElementById('invoicesList');
  if (!container) return;
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--gray)">No invoices yet. They'll appear here after you place an order.</div>`;
      return;
    }
    container.innerHTML = `
      <div style="background:white;border-radius:var(--radius);border:1px solid rgba(0,0,0,0.08);overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:var(--off-white);font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--gray)">
            <th style="padding:12px 18px;text-align:left">Order ID</th>
            <th style="padding:12px 18px;text-align:left">Date</th>
            <th style="padding:12px 18px;text-align:left">Amount</th>
            <th style="padding:12px 18px;text-align:left">Status</th>
            <th style="padding:12px 18px;text-align:left">Invoice</th>
          </tr></thead>
          <tbody>${orders.slice().reverse().map(o => `
            <tr style="border-top:1px solid var(--light-gray);font-size:0.84rem">
              <td style="padding:14px 18px;font-weight:700;color:var(--green)">${o.orderId}</td>
              <td style="padding:14px 18px;color:var(--gray)">${o.date}</td>
              <td style="padding:14px 18px;font-weight:600">₹${(o.total||0).toLocaleString('en-IN')}</td>
              <td style="padding:14px 18px"><span style="background:#f0fdf4;color:#16a34a;padding:3px 10px;border-radius:100px;font-size:0.72rem;font-weight:700">Paid</span></td>
              <td style="padding:14px 18px"><button class="invoice-btn" onclick="downloadInvoice('${o.orderId}')">⬇ Download</button></td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  } catch(e) {}
}

function openTracking(orderId) {
  switchAccountPanel('tracking');
  setTimeout(() => {
    const inp = document.getElementById('trackInput');
    if (inp) { inp.value = orderId; doTrackOrder(); }
  }, 100);
}

function doTrackOrder() {
  const inp = document.getElementById('trackInput');
  const res = document.getElementById('trackResult');
  if (!inp || !res) return;
  const orderId = inp.value.trim();
  if (!orderId) { showToast('Please enter an Order ID', 'error'); return; }
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId || orderId.includes(o.orderId.replace('AVC-','')));
    if (order) {
      res.style.display = 'block';
      res.innerHTML = `
        <div style="background:var(--green-wash);border-radius:var(--radius);padding:18px">
          <div style="font-weight:700;margin-bottom:8px;color:var(--green)">📦 Order Found: ${order.orderId}</div>
          <div style="font-size:0.84rem;color:var(--gray);margin-bottom:12px">${order.address}</div>
          <div style="font-size:0.84rem;font-weight:700;color:var(--text)">Status: ${order.status}</div>
          <div style="margin-top:14px">
            <a href="https://www.shiprocket.in/shipment-tracking/" target="_blank" class="btn-primary" style="font-size:0.82rem;padding:10px 20px">Track on Shiprocket ↗</a>
          </div>
        </div>
      `;
    } else {
      res.style.display = 'block';
      res.innerHTML = `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius);padding:14px;font-size:0.84rem;color:var(--red)">Order not found locally. <a href="https://www.shiprocket.in/shipment-tracking/" target="_blank" style="color:var(--green);font-weight:700">Try Shiprocket directly ↗</a></div>`;
    }
  } catch(e) {}
}

function downloadInvoice(orderId) {
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    const o = orders.find(ord => ord.orderId === orderId);
    if (!o) { showToast('Invoice not found', 'error'); return; }
    const html = `<!DOCTYPE html><html><head><title>Invoice ${o.orderId}</title>
    <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto}
    .header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #2D5016}
    .brand{font-size:1.4rem;font-weight:700;color:#2D5016}.sub{font-size:.7rem;color:#666;letter-spacing:2px}
    h2{color:#2D5016;margin:20px 0 10px}table{width:100%;border-collapse:collapse}
    th{background:#f0f7e8;padding:10px;text-align:left;font-size:.8rem}
    td{padding:10px;border-bottom:1px solid #eee;font-size:.85rem}
    .total{font-weight:700;font-size:1rem}.footer{margin-top:30px;font-size:.75rem;color:#999;text-align:center}
    

/* ════════════════════════════════════════════════════
   ASCOVITA v10 — 3D MINIMALIST PROFESSIONAL REDESIGN
   No emoji clutter. Depth. Precision. Authority.
════════════════════════════════════════════════════ */

/* === GLOBAL REFINEMENTS === */
body { -webkit-font-smoothing: antialiased; }

/* Override section-title to use Syne for authority */
.section-title {
  font-family: 'Syne', 'Cormorant Garamond', serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
}
.b2b-title {
  font-family: 'Syne', serif !important;
  letter-spacing: -0.025em !important;
  font-weight: 800 !important;
}
.section-label {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.62rem !important;
  letter-spacing: 0.22em !important;
  color: var(--green-light) !important;
  font-weight: 700 !important;
}

/* === FROSTED GLASS NAVBAR === */
.navbar {
  backdrop-filter: blur(20px) saturate(1.6) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.6) !important;
  background: rgba(253,250,244,0.88) !important;
  border-bottom: 1px solid rgba(45,80,22,0.07) !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.9), 0 4px 20px rgba(45,80,22,0.05) !important;
}

/* === 3D CARD SYSTEM === */
.card-3d-lift {
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1),
              box-shadow 0.38s ease;
  will-change: transform;
}
.card-3d-lift:hover {
  transform: translateY(-8px) perspective(600px) rotateX(1.5deg);
  box-shadow:
    0 2px 4px rgba(13,31,8,.04),
    0 8px 20px rgba(13,31,8,.08),
    0 28px 56px rgba(13,31,8,.10),
    0 0 0 1px rgba(45,80,22,.06);
}

/* === B2B SERVICE CARDS — 3D Professional === */
.b2b-svc-card {
  background: white !important;
  border: 1px solid #E6EDD8 !important;
  border-radius: 16px !important;
  padding: 32px 28px !important;
  position: relative;
  overflow: hidden;
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s ease, border-color 0.3s !important;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04) !important;
}
.b2b-svc-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--green), var(--green-light));
  opacity: 0;
  transition: opacity 0.3s;
}
.b2b-svc-card:hover {
  transform: translateY(-8px) perspective(600px) rotateX(1.5deg) !important;
  box-shadow: 0 4px 12px rgba(13,31,8,.06), 0 20px 48px rgba(13,31,8,.10) !important;
  border-color: #C8D8B0 !important;
}
.b2b-svc-card:hover::before { opacity: 1; }

.b2b-svc-ico {
  font-size: 0 !important; /* Hide emoji size, we'll override per card */
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: var(--green-pale) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 18px !important;
  flex-shrink: 0 !important;
}
.b2b-svc-t {
  font-family: 'Syne', sans-serif !important;
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  color: var(--dark) !important;
  letter-spacing: -0.01em !important;
  margin-bottom: 10px !important;
}
.b2b-svc-d {
  font-size: 0.84rem !important;
  line-height: 1.7 !important;
  color: #5A6E45 !important;
}
.b2b-svc-tag {
  font-size: 0.66rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  padding: 3px 10px !important;
  border-radius: 4px !important;
  background: var(--green-pale) !important;
  color: var(--green) !important;
  border: 1px solid rgba(45,80,22,.12) !important;
}

/* === B2B MINI CARDS (hero right side) === */
.b2b-mini-card {
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.14) !important;
  border-radius: 14px !important;
  padding: 20px 18px !important;
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), background 0.3s !important;
  backdrop-filter: blur(8px);
}
.b2b-mini-card:hover {
  transform: translateY(-6px) !important;
  background: rgba(255,255,255,0.12) !important;
  border-color: rgba(255,255,255,0.24) !important;
}
.b2b-mini-ico {
  font-size: 0 !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 10px !important;
  background: rgba(212,165,32,0.2) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 12px !important;
}
.b2b-mini-t {
  font-family: 'Syne', sans-serif !important;
  font-size: 0.86rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  color: white !important;
  margin-bottom: 5px !important;
}
.b2b-mini-d {
  font-size: 0.75rem !important;
  color: rgba(255,255,255,0.6) !important;
  line-height: 1.5 !important;
}

/* === HERO REFINEMENTS === */
.b2b-hero {
  background: linear-gradient(140deg, #0D1F08 0%, #1A3A0D 45%, #0D2010 100%) !important;
  position: relative;
  overflow: hidden;
}
.b2b-hero::after {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,138,40,0.12) 0%, transparent 65%);
  pointer-events: none;
}
.b2b-eyebrow {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.65rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
  background: rgba(184,134,11,0.15) !important;
  border: 1px solid rgba(184,134,11,0.35) !important;
  border-radius: 6px !important;
  padding: 7px 14px !important;
  display: inline-block !important;
  margin-bottom: 20px !important;
}
.b2b-stat-n {
  font-family: 'Syne', serif !important;
  font-size: 1.9rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
}
.b2b-stat-l {
  font-size: 0.68rem !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  opacity: 0.55 !important;
  font-weight: 600 !important;
}

/* === PACKAGING CARDS — 3D === */
.pkg-card {
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04) !important;
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s ease !important;
}
.pkg-card:hover {
  transform: translateY(-8px) perspective(600px) rotateX(1.5deg) !important;
  box-shadow: 0 4px 12px rgba(13,31,8,.06), 0 20px 48px rgba(13,31,8,.10) !important;
}
.pkg-card-name {
  font-family: 'Syne', sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  font-size: 1.1rem !important;
}

/* === TEAM CARD 3D (fully rebuilt below) === */
.team-card-v10 {
  background: white;
  border-radius: 20px;
  border: 1px solid #E6EDD8;
  overflow: visible;
  transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04);
  position: relative;
}
.team-card-v10:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(13,31,8,.08), 0 32px 64px rgba(13,31,8,.10);
}
.team-card-v10 .tc-header {
  height: 130px;
  position: relative;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.team-card-v10 .tc-header-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px);
  background-size: 30px 30px;
}
.team-card-v10 .tc-monogram {
  width: 80px; height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: white;
  position: absolute;
  bottom: -32px;
  left: 24px;
  z-index: 2;
}
.team-card-v10 .tc-header-label {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 100px;
}
.team-card-v10 .tc-body {
  padding: 44px 24px 24px;
}
.team-card-v10 .tc-name {
  font-family: 'Syne', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0D1F08;
  letter-spacing: -0.02em;
  margin-bottom: 3px;
}
.team-card-v10 .tc-role {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--green-light);
  margin-bottom: 12px;
}
.team-card-v10 .tc-desc {
  font-size: 0.83rem;
  color: #5A6E45;
  line-height: 1.68;
  margin-bottom: 18px;
}
.team-card-v10 .tc-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 7px;
  background: #0A66C2;
  color: white !important;
  font-size: 0.73rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.22s ease;
  letter-spacing: 0.02em;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-li:hover {
  background: #0952A5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(10,102,194,.3);
}
.btn-li svg { width: 13px; height: 13px; fill: white; flex-shrink: 0; }
.btn-wa-sm {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 7px;
  background: #25D366;
  color: white !important;
  font-size: 0.73rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.22s ease;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-wa-sm:hover {
  background: #128C7E;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37,211,102,.3);
}

/* === EXPORT/IMPORT SECTION === */
.export-section {
  background: linear-gradient(140deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%);
  border-radius: 24px;
  padding: 56px 52px;
  position: relative;
  overflow: hidden;
  margin: 0;
}
.export-section::before {
  content: '';
  position: absolute;
  top: -80px; right: -80px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(10,102,194,.2) 0%, transparent 65%);
  pointer-events: none;
}
.export-section::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -40px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,165,32,.1) 0%, transparent 65%);
  pointer-events: none;
}
.export-stat-box {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 14px;
  padding: 20px 18px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(6px);
}
.export-stat-box:hover {
  background: rgba(255,255,255,.11);
  border-color: rgba(212,165,32,.3);
  transform: translateY(-4px);
}
.export-stat-n {
  font-family: 'Syne', serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 5px;
}
.export-stat-l {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,.45);
}
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 8px;
  background: transparent;
  border: 1.5px solid rgba(212,165,32,.5);
  color: #D4A520;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.02em;
  cursor: pointer;
}
.btn-export:hover {
  background: rgba(212,165,32,.12);
  border-color: #D4A520;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,165,32,.15);
}
.btn-export-solid {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 8px;
  background: #D4A520;
  border: none;
  color: #0A1628;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.02em;
  cursor: pointer;
}
.btn-export-solid:hover {
  background: #E8B830;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,165,32,.3);
}
.export-service-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.75);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.2s;
}
.export-service-chip:hover {
  background: rgba(212,165,32,.12);
  border-color: rgba(212,165,32,.3);
  color: #D4A520;
}
.export-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.5; }

/* === SVG ICON HELPERS === */
.ico-box {
  width: 44px; height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ico-box svg { width: 20px; height: 20px; }
.ico-green { background: rgba(45,80,22,.1); }
.ico-green svg { stroke: var(--green); fill: none; }
.ico-gold { background: rgba(184,134,11,.1); }
.ico-gold svg { stroke: var(--gold-light); fill: none; }
.ico-blue { background: rgba(10,102,194,.1); }
.ico-blue svg { stroke: #0A66C2; fill: none; }
.ico-white { background: rgba(255,255,255,.15); }
.ico-white svg { stroke: white; fill: none; }

/* === SECTION OVERLINE + DIVIDER === */
.sec-overline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green-light);
  margin-bottom: 14px;
}
.sec-overline::before {
  content: '';
  display: block;
  width: 24px; height: 2px;
  border-radius: 1px;
  background: var(--green-light);
  flex-shrink: 0;
}

/* === BROCHURE CARDS — 3D === */
.brochure-card {
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s ease !important;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04) !important;
}
.brochure-card:hover {
  transform: translateY(-8px) !important;
  box-shadow: 0 8px 20px rgba(13,31,8,.08), 0 28px 56px rgba(13,31,8,.09) !important;
  border-color: #C8D8B0 !important;
}

/* === PROGRESS / PROCESS STEPS — refined === */
.b2b-step {
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}
.b2b-step:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 32px rgba(13,31,8,.10) !important;
}

/* === TESTIMONIAL CARDS — refined === */
.b2b-review-card {
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease !important;
}
.b2b-review-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 16px 40px rgba(13,31,8,.10) !important;
}

/* === PRICING TIERS — 3D === */
.b2b-pricing-card {
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease !important;
}
.b2b-pricing-card:hover {
  transform: translateY(-8px) !important;
}

/* === GENERAL SECTION BG REFINEMENTS === */
.b2b-section { position: relative; }

/* Remove emoji font scaling trick — make icon containers visible */
.b2b-svc-ico span,
.b2b-mini-ico span { font-size: 1.1rem !important; }

/* Contact form refinements */
.b2b-form-input {
  border-radius: 8px !important;
  border: 1.5px solid rgba(255,255,255,.15) !important;
  background: rgba(255,255,255,.07) !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.86rem !important;
  transition: border-color 0.25s, background 0.25s !important;
}
.b2b-form-input:focus {
  border-color: rgba(212,165,32,.5) !important;
  background: rgba(255,255,255,.1) !important;
  outline: none !important;
}

/* WhatsApp button refinement */
.b2b-wa-btn {
  border-radius: 8px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.86rem !important;
  letter-spacing: 0.01em !important;
  transition: all 0.25s cubic-bezier(0.23,1,0.32,1) !important;
}
.b2b-wa-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(37,211,102,.3) !important;
}

/* btn-primary refinement */
.btn-primary {
  border-radius: 8px !important;
  font-family: 'DM Sans', sans-serif !important;
  letter-spacing: 0.01em !important;
  transition: all 0.25s cubic-bezier(0.23,1,0.32,1) !important;
}
.btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(45,80,22,.25) !important;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F4F8EF; }
::-webkit-scrollbar-thumb { background: #BDD0AB; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #2D5016; }

/* Subtle page load animation */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.b2b-hero .b2b-hero-inner { animation: fadeSlideUp 0.7s cubic-bezier(0.23,1,0.32,1) both; }
.b2b-hero .b2b-card-grid  { animation: fadeSlideUp 0.8s 0.1s cubic-bezier(0.23,1,0.32,1) both; }


/* ═══════════════════════════════════════════════════
   MOBILE FIXES & RESPONSIVE POLISH
   Targets: 480px (phones), 768px (tablets)
═══════════════════════════════════════════════════ */

@media (max-width: 768px) {
  /* General spacing */
  .container { padding: 0 16px; }
  .section { padding: 48px 0; }

  /* Typography */
  .section-title { font-size: 1.7rem !important; }
  .section-sub { font-size: 0.86rem; margin-bottom: 1.8rem; }

  /* Product grid */
  .products-grid { grid-template-columns: 1fr 1fr !important; gap: 12px; }
  .product-card { min-width: 0; }
  .pc-img { height: 160px; }

  /* Hero slides */
  .slide-inner { grid-template-columns: 1fr !important; gap: 20px; padding: 40px 0 30px !important; }
  .slide-visual { display: block !important; }
  .slide-title { font-size: clamp(1.8rem, 6vw, 2.8rem) !important; }

  /* Product page */
  .product-page { grid-template-columns: 1fr !important; gap: 0 !important; }
  .prod-images { position: relative !important; top: auto !important; align-self: auto !important; margin-bottom: 20px !important; overflow: visible !important; }
  .prod-images .main-img { height: 300px !important; max-height: 300px !important; }
  .prod-images .main-img img { max-height: 300px; object-fit: contain !important; }
  .qty-discount-wrap { margin: 0 0 16px; }
  .qty-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; }

  /* Cart */
  .cart-layout { grid-template-columns: 1fr !important; }
  .side-cart { width: 100vw !important; }

  /* Checkout */
  .checkout-layout { grid-template-columns: 1fr !important; }

  /* B2B page */
  .b2b-hero-inner { grid-template-columns: 1fr !important; gap: 30px; }
  .b2b-card-grid { display: none !important; }
  .b2b-title { font-size: clamp(1.8rem, 6vw, 2.8rem) !important; }
  .b2b-service-grid { grid-template-columns: 1fr !important; }
  .b2b-contact-grid { grid-template-columns: 1fr !important; }
  .b2b-step { flex-direction: column; }

  /* Team cards */
  .team-card-v10 { max-width: 400px; margin: 0 auto; }

  /* Packaging */
  .pkg-grid { grid-template-columns: 1fr 1fr !important; }

  /* Export section */
  .export-section { padding: 32px 24px; }
  .export-section > div:first-child { flex-direction: column !important; }

  /* Rewards tiers */
  .rewards-tiers { grid-template-columns: 1fr !important; }

  /* Brochure */
  .brochure-grid { grid-template-columns: 1fr !important; }

  /* Map section */
  .b2b-contact-grid > div:last-child > div { grid-template-columns: 1fr !important; }

  /* Quiz */
  .quiz-steps-row { gap: 10px; }
  .quiz-title { font-size: 1.9rem !important; }
  .qm-opts { grid-template-columns: 1fr !important; }
  .qm-body { padding: 20px; }

  /* Bundle builder */
  .bundle-layout { grid-template-columns: 1fr !important; }
  .bundle-summary { position: static !important; }

  /* Influencer */
  .influencer-grid { grid-template-columns: 1fr 1fr !important; }

  /* Footer */
  .footer-grid { grid-template-columns: 1fr 1fr; }

  /* Navbar */
  .nav-links, .btn-primary.nav-cta { display: none !important; }
  .hamburger { display: flex !important; }

}

@media (max-width: 480px) {
  /* Products */
  .products-grid { grid-template-columns: 1fr 1fr !important; gap: 8px; }
  .pc-img { height: 130px; }
  .pc-body { padding: 10px; }
  .pc-name { font-size: 0.78rem; }

  /* Tier widget compact */
  .qty-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 6px; }
  .qty-tier { padding: 10px 8px !important; }
  .tier-tabs { font-size: 1.4rem !important; }
  .tier-rate { font-size: .88rem !important; }
  .qty-discount-footer { flex-direction: column; gap: 6px; align-items: flex-start; }

  /* Category chips */
  .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }

  /* UGC grid */
  .ugc-grid { grid-template-columns: repeat(3, 1fr) !important; }

  /* B2B stats row */
  .b2b-stats { gap: 16px !important; flex-wrap: wrap; }
  .b2b-stats > div { min-width: 80px; }

  /* Export stats */
  .export-section > div:nth-child(2) { grid-template-columns: repeat(2, 1fr) !important; }

  /* B2B contact */
  .b2b-form-input { font-size: 0.84rem; }

  /* Pkg grid */
  .pkg-grid { grid-template-columns: 1fr !important; }

  /* Map */
  .export-section + section .container > div { grid-template-columns: 1fr !important; }

}





.mobile-filter-btn { display: none; }
/* ═══════════════════════════════════════════════════════
   MOBILE FIXES v11 — based on real device recordings
   Device: ~384px wide mobile (Android)
═══════════════════════════════════════════════════════ */

/* ─── GLOBAL: Fix horizontal overflow ─── */
html, body { overflow-x: hidden; max-width: 100%; }
* { box-sizing: border-box; }

/* ─── PRODUCT PAGE MOBILE CRITICAL FIXES ─── */
@media (max-width: 768px) {

  /* Product detail layout — single column, no sticky */
  .product-page {
    grid-template-columns: 1fr !important;
    gap: 0 !important;
    padding: 16px 0 40px !important;
    overflow: visible !important;
  }

  /* Remove sticky on product images — causes overlap/bleed on mobile */
  .prod-images {
    position: relative !important;
    top: auto !important;
    align-self: auto !important;
    z-index: 1 !important;
    overflow: visible !important;
    width: 100% !important;
    margin-bottom: 20px !important;
  }

  /* Product info column — must clear image, no overlap */
  .product-page > div:last-child,
  .product-page > div:nth-child(2) {
    position: relative !important;
    z-index: 2 !important;
    background: white !important;
    overflow: visible !important;
    width: 100% !important;
  }

  /* Product image — full width, fixed height, no overflow bleed */
  .main-img {
    aspect-ratio: 1 !important;
    max-height: 300px !important;
    height: 300px !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    display: block !important;
    background: var(--off-white) !important;
  }
  .main-img img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    padding: 16px !important;
    display: block !important;
  }

  /* Thumb row — smaller on mobile */
  .thumb { width: 52px !important; height: 52px !important; }

  /* Page top padding — reduce for mobile */
  #page-product { padding-top: 70px !important; }

  /* Product title + price */
  .prod-title { font-size: 1.3rem !important; line-height: 1.25 !important; }
  .prod-sale  { font-size: 1.5rem !important; }

  /* ─── TIER WIDGET: 2×2 grid on mobile ─── */
  .qty-tiers-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0 !important;
  }
  /* Fix border for 2x2 layout */
  .qty-tier:nth-child(2)  { border-right: none !important; }
  .qty-tier:nth-child(3)  { border-top: 1px solid var(--light-gray) !important; }
  .qty-tier:nth-child(4)  { border-top: 1px solid var(--light-gray) !important; border-right: none !important; }
  .qty-tier { border-right: 1px solid var(--light-gray) !important; }

  .tier-tabs { font-size: 1.4rem !important; }
  .tier-rate { font-size: 0.88rem !important; }
  .tier-mrp  { font-size: 0.72rem !important; }
  .tier-save-label { font-size: 0.62rem !important; }

  .qty-discount-footer {
    flex-direction: column !important;
    gap: 6px !important;
    align-items: flex-start !important;
  }

  /* ─── SHOP PAGE: Hide filter sidebar on mobile ─── */
  .shop-layout {
    grid-template-columns: 1fr !important;
  }
  .filter-sidebar {
    display: none !important;
  }
  /* Show filter toggle button */
  .mobile-filter-btn {
    display: flex !important;
  }
  .filter-sidebar.mobile-visible {
    display: block !important;
  }

  /* Products grid — 2 column on mobile */
  .products-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }
  .pc-img { height: 150px !important; }
  .pc-body { padding: 10px 10px 12px !important; }
  .pc-name { font-size: 0.78rem !important; line-height: 1.3 !important; }
  .pc-price { font-size: 0.9rem !important; }
  .pc-badge { font-size: 0.58rem !important; padding: 2px 7px !important; }
  .pc-offer { font-size: 0.62rem !important; padding: 4px 8px !important; }

  /* ─── PRODUCT PAGE: content area ─── */
  .prod-brand { font-size: 0.7rem !important; }
  .prod-rating-row { font-size: 0.78rem !important; }

  /* ─── BREADCRUMB: Compact on mobile ─── */
  .breadcrumb { font-size: 0.74rem !important; padding-bottom: 12px !important; }

  /* ─── ADD TO CART BUTTON: Full width mobile ─── */
  .add-cart-btn {
    width: 100% !important;
    padding: 16px 20px !important;
    font-size: 0.9rem !important;
    margin-bottom: 10px !important;
  }
  .buy-now-btn {
    width: 100% !important;
    padding: 14px 20px !important;
    font-size: 0.9rem !important;
  }

  /* ─── RELATED PRODUCTS ─── */
  #relatedGrid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  /* ─── PRODUCT TABS ─── */
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap !important; }
  .tab  { font-size: 0.78rem !important; padding: 8px 14px !important; white-space: nowrap; flex-shrink: 0; }

  /* ─── CART + CHECKOUT ─── */
  .cart-layout, .checkout-layout { grid-template-columns: 1fr !important; gap: 16px !important; }
  .cart-summary { position: static !important; }
  .side-cart     { width: 100vw !important; }

  /* ─── HOMEPAGE SECTIONS ─── */
  .slide-inner { grid-template-columns: 1fr !important; padding: 40px 0 30px !important; }
  .slide-visual { display: block !important; }
  .slide-title  { font-size: clamp(1.7rem, 6vw, 2.4rem) !important; }

  .hero-new-inner { grid-template-columns: 1fr !important; gap: 20px !important; }

  /* Category grid */
  .cat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }

  /* Quiz */
  .quiz-title { font-size: 1.7rem !important; }
  .quiz-steps-row { gap: 8px !important; }
  .qm-opts { grid-template-columns: 1fr !important; }
  .qm-body { padding: 16px !important; }

  /* Bundle builder */
  .bundle-layout { grid-template-columns: 1fr !important; }
  .bundle-summary { position: static !important; }

  /* UGC grid */
  .ugc-grid { grid-template-columns: repeat(3, 1fr) !important; }

  /* Influencer */
  .influencer-grid { grid-template-columns: 1fr 1fr !important; }

  /* Meal CTA */
  .meal-cta { flex-direction: column !important; padding: 24px 20px !important; gap: 20px !important; }

  /* Refer card */
  .refer-card { padding: 28px 20px !important; }
  .refer-card > div[style*="display:flex"] { flex-wrap: wrap !important; }

  /* Footer */
  .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }

  /* B2B */
  .b2b-hero-inner { grid-template-columns: 1fr !important; gap: 24px !important; }
  .b2b-card-grid  { display: none !important; }
  .b2b-title      { font-size: clamp(1.7rem, 6vw, 2.6rem) !important; }
  .b2b-service-grid { grid-template-columns: 1fr !important; }
  .b2b-contact-grid { grid-template-columns: 1fr !important; }
  .b2b-stats      { gap: 16px !important; flex-wrap: wrap !important; }
  .b2b-stats > div { min-width: 80px !important; }

  /* Export section */
  .export-section { padding: 32px 20px !important; }
  .export-section > div { flex-wrap: wrap !important; }

  /* Team cards grid */
  div[style*="grid-template-columns:repeat(3,1fr)"] { 
    grid-template-columns: 1fr !important; 
  }

  /* Pkg grid */
  .pkg-grid { grid-template-columns: 1fr 1fr !important; }

  /* Map + brochure */
  .brochure-grid { grid-template-columns: 1fr !important; }

  /* Sticky cart notification */
  .sticky-cart { display: none !important; }
}

/* ── 480px and below (small phones) ── */
@media (max-width: 480px) {
  .container { padding: 0 14px !important; }

  /* Product grid — 2 col */
  .products-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
  .pc-img { height: 120px !important; }
  .pc-name { font-size: 0.74rem !important; }

  /* Tier widget — still 2×2 */
  .qty-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .qty-tier { padding: 10px 8px !important; }

  /* Cat grid */
  .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }

  /* Section headings */
  .section-title { font-size: 1.5rem !important; }
  .b2b-title { font-size: 1.5rem !important; }

  /* Pkg grid — 1 col on very small */
  .pkg-grid { grid-template-columns: 1fr !important; }

  /* Footer */
  .footer-grid { grid-template-columns: 1fr !important; }

  /* Export stats */
  .export-section > div:nth-child(2) { grid-template-columns: 1fr 1fr !important; }

  /* Team card — full width */
  .team-card-v10 { max-width: 100% !important; }
}


/* Mobile filter panel show/hide */
@media (max-width: 768px) {
  .filter-sidebar.mobile-visible {
    display: block !important;
    margin-bottom: 16px;
  }
}


/* ═══════════════════════════════════════════════════════
   ASCOVITA — FULL MOBILE RESPONSIVE OVERHAUL
   ═══════════════════════════════════════════════════════ */

/* ── Base mobile improvements ── */
@media(max-width:768px) {
  /* Navbar */
  .nav-inner { height:60px; padding:0 16px; }
  .nav-logo img { height:40px; }

  /* Container padding */
  .container { padding:0 16px; }

  /* Sections */
  .section { padding:40px 0; }

  /* Hero slider — smooth on mobile */
  .hero-slides-wrap { min-height:auto !important; }
  .hero-slide { position:absolute; inset:0; min-height:auto; }
  .hero-slide.active { position:relative; min-height:auto; }
  .slide-inner { padding:100px 0 40px !important; grid-template-columns:1fr !important; gap:20px !important; }
  .slide-headline { font-size:clamp(1.7rem,7vw,2.4rem) !important; margin-bottom:10px; }
  .slide-sub { font-size:0.85rem !important; margin-bottom:14px; }
  .slide-offer { font-size:0.78rem !important; padding:6px 14px !important; margin-bottom:18px; }
  .slide-btns { flex-direction:column; gap:8px; }
  .slide-btns button, .slide-btns a { width:100% !important; justify-content:center; text-align:center; padding:12px 16px !important; font-size:0.84rem !important; }
  .slide-visual { display:block !important; }
  .slide-img-frame img { height:200px !important; border-radius:14px; }
  .slide-bubble { display:none !important; }
  .slides-controls { bottom:16px; gap:10px; }
  .slide-arrow { width:34px; height:34px; font-size:1rem; }

  /* Trust bar */
  .trust-bar { overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; }

  /* Section titles */
  .section-title { font-size:clamp(1.5rem,5vw,2rem) !important; }

  /* Product cards */
  .products-grid { grid-template-columns:1fr 1fr !important; gap:12px; }
  .p-name { font-size:0.82rem; }
  .sale-price { font-size:0.95rem; }
  .p-img-wrap { aspect-ratio:1; }
  .p-info { padding:10px 12px 12px; }

  /* Category grid */
  .cat-grid { grid-template-columns:repeat(3,1fr) !important; gap:8px; }
  .cat-card { padding:16px 8px; }
  .cat-icon { font-size:1.6rem; }
  .cat-name { font-size:0.78rem; }

  /* Promo carousel */
  .promo-card { padding:24px 20px; flex-direction:column; gap:16px; }
  .promo-text h2 { font-size:clamp(1.1rem,4vw,1.5rem); }

  /* Product detail page */
  .product-page { grid-template-columns:1fr !important; gap:0 !important; padding:16px 0 40px; }
  .prod-images { margin-bottom:16px; }
  .prod-title { font-size:clamp(1.3rem,4.5vw,1.8rem); }

  /* Cart */
  .cart-layout { grid-template-columns:1fr !important; }

  /* Checkout */
  .checkout-layout { grid-template-columns:1fr !important; }

  /* Footer */
  .footer-grid { grid-template-columns:1fr 1fr !important; gap:24px; }

  /* Bundle section */
  .bundle-layout { grid-template-columns:1fr !important; }
  .bundle-summary { position:static !important; }

  /* Sticky cart bar */
  #stickyCart { padding:10px 16px !important; }

  /* Side cart */
  .side-cart { width:100vw !important; }

  /* Qty tier widget */
  .qty-tiers { grid-template-columns:repeat(2,1fr) !important; }
  .qty-tier { padding:12px 8px; }
  .tier-tabs { font-size:0.88rem; }
}

@media(max-width:480px) {
  .products-grid { grid-template-columns:1fr 1fr !important; gap:10px; }
  .cat-grid { grid-template-columns:repeat(3,1fr) !important; gap:6px; }
  .cat-card { padding:12px 6px; }
  .cat-icon { font-size:1.4rem; margin-bottom:6px; }
  .cat-name { font-size:0.7rem; }
  .footer-grid { grid-template-columns:1fr !important; }
  .promo-code-box .code { font-size:1rem; letter-spacing:2px; }
  .slide-img-frame img { height:160px !important; }
  .slide-inner { padding:80px 0 36px !important; }
  .qty-tiers { grid-template-columns:1fr 1fr !important; }
}

/* ── Fix slider height so page doesn't jump ── */
@media(max-width:768px) {
  #heroSlidesWrap { 
    height:auto !important;
    min-height:auto !important;
  }
  .hero-slide {
    position:relative !important;
    opacity:1 !important;
    pointer-events:all !important;
    transform:none !important;
    display:none !important;
    transition:none !important;
  }
  .hero-slide.active {
    display:flex !important;
  }
  .hero-slide.leaving {
    display:none !important;
  }
}

</style></head><body>
    <div class="header"><div><div class="brand">🌿 Ascovita</div><div class="sub">ORGANIC VITAMINS & SUPPLEMENTS</div></div><div style="text-align:right"><div style="font-weight:700">TAX INVOICE</div><div style="font-size:.82rem;color:#666">${o.orderId}</div><div style="font-size:.82rem;color:#666">${o.date}</div></div></div>
    <h2>Bill To</h2><p>${o.customer}<br>${o.email}<br>${o.phone}<br>${o.address}</p>
    <h2>Order Items</h2><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
    ${o.items?.map(i=>`<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price*i.qty}</td></tr>`).join('')}
    </tbody></table>
    <div style="text-align:right;margin-top:20px"><div class="total">Total Paid: ₹${o.total?.toLocaleString('en-IN')}</div><div style="font-size:.75rem;color:#666;margin-top:4px">Payment via ${o.method?.toUpperCase()||'Online'} · Cashfree</div></div>
    <div class="footer">Ascovita · FSSAI License · Made in India · ascovita.com<br>Thank you for shopping with us! 🌿</div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Ascovita-Invoice-${orderId}.html`; a.click();
    URL.revokeObjectURL(url);
    showToast('🧾 Invoice downloaded!');
  } catch(e) { showToast('Could not generate invoice', 'error'); }
}

function prefillProfile(user) {
  const parts = user.name?.split(' ') || ['',''];
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('profileFirst', parts[0]);
  setVal('profileLast', parts.slice(1).join(' '));
  setVal('profileEmail', user.email);
  setVal('profilePhone', user.phone);
  if (user.address) {
    setVal('profileAddr1', user.address.addr1);
    setVal('profileAddr2', user.address.addr2);
    setVal('profileCity', user.address.city);
    setVal('profileState', user.address.state);
    setVal('profilePin', user.address.pin);
  }
}

function saveProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const getVal = id => document.getElementById(id)?.value?.trim() || '';
  user.name = (getVal('profileFirst') + ' ' + getVal('profileLast')).trim();
  user.phone = getVal('profilePhone');
  user.address = {
    addr1: getVal('profileAddr1'),
    addr2: getVal('profileAddr2'),
    city: getVal('profileCity'),
    state: getVal('profileState'),
    pin: getVal('profilePin'),
  };
  // Update in users list
  try {
    const users = JSON.parse(localStorage.getItem('asc_users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) users[idx] = { ...users[idx], ...user };
    else users.push(user);
    localStorage.setItem('asc_users', JSON.stringify(users));
  } catch(e) {}
  localStorage.setItem('asc_user', JSON.stringify(user));
  const an=document.getElementById('accName'); if(an) an.textContent = user.name;
  updateAccountNavBtn();
  showToast('✅ Profile & address saved!');
}
