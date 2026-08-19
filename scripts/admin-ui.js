// ADMIN-UI.JS
// ─────────────────────────────────────────────
// Extracted from admin.html inline blocks 1, 2, 3, 7, 18, 19 (19 Aug 2026, Manus SEO pass).
// Order inside each file follows the original document order.

/* ══ block 1 (origin 108196-108723, 510 B) ══ */
(function(){try{
  /* Glass was the default and is gone. Anyone still carrying it in
     localStorage would otherwise boot into a theme with no CSS behind it —
     an unstyled dashboard — so it is rewritten to deluxe here, before
     first paint, rather than left to the settings page nobody opens. */
  var t = localStorage.getItem('ascovita_theme') || 'deluxe';
  if (t === 'glass') { t = 'deluxe'; localStorage.setItem('ascovita_theme', t); }
  document.body.classList.add('theme-' + t);
}catch(e){}})();


/* ══ block 2 (origin 112728-113083, 338 B) ══ */
function azTogglePw() {
  var i = document.getElementById('loginPass'), b = document.getElementById('pwToggle');
  if (!i || !b) return;
  var show = i.type === 'password';
  i.type = show ? 'text' : 'password';
  b.textContent = show ? '🙈' : '👁';
  b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  i.focus();
}


/* ══ block 3 (origin 175702-200531, 24812 B) ══ */
/* ═══ Customer 360° — re-targeting drawer becomes a full per-customer profile ═══
   Tabs: Overview · Orders & Cancellations · Returns & Refunds · Loyalty (VitaPoints) · Promo Usage · Edit
   All writes require password re-confirmation (confirmCriticalAction). */
(function az360Patch(){
  // BUG FIX (Customer 360° invisible): this script block sits BEFORE the
  // customer drawer markup in the document, so at patch time custT/custS
  // are null — an early return here would leave window.az360Open undefined
  // forever, so every '360°' button threw and the row click fell back to
  // the old re-targeting insights. Resolve the drawer lazily instead.
  var custT = document.getElementById('custDrawerTitle');
  var custS = document.getElementById('custDrawerSub');
  // Tabs bar — injected under the drawer header row (or lazily at open time)
  var bar = document.createElement('div');
  bar.id = 'cust360Tabs';
  bar.className = 'az360-tabs';
  if (custS) { custS.insertAdjacentElement('afterend', bar); var az360TabsBar = bar; }
  // Style block (only once)
  if (!document.getElementById('az360-style')) {
    var st = document.createElement('style');
    st.id = 'az360-style';
    st.textContent =
      '.az360-tabs{display:flex;gap:4px;margin:0 0 12px;border-bottom:2px solid var(--border);overflow-x:auto;-webkit-overflow-scrolling:touch;-ms-overflow-style:none;scrollbar-width:thin}' +
      '.az360-tabs::-webkit-scrollbar{display:none}' +
      '.az360-tabs .az360-tab{background:none;border:none;border-bottom:3px solid transparent;padding:9px 12px;font-family:var(--font);font-size:.74rem;font-weight:600;color:var(--text3);cursor:pointer;white-space:nowrap;flex:1 0 auto;min-width:0;transition:all .2s}' +
      '.az360-tabs .az360-tab:hover{color:var(--green-text)}' +
      '.az360-tabs .az360-tab.active{color:var(--green);border-bottom-color:var(--gold)}' +
      '.az360-body{max-height:64vh;overflow-y:auto;padding-right:4px;-webkit-overflow-scrolling:touch}' +
      '.modal-overlay{z-index:900 !important}.modal{max-height:min(88dvh,640px) !important;overflow-y:auto}' +
      '.az360-kpi{flex:1 1 auto;min-width:96px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:9px 10px;text-align:center}' +
      '.az360-kpi .k{font-size:.58rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.3px}' +
      '.az360-kpi .v{font-family:var(--display);font-size:.95rem;font-weight:800;color:var(--green-text);margin-top:3px;word-break:break-word}' +
      '.az360-tbl{width:100%;border-collapse:collapse;font-size:.72rem;min-width:300px}' +
      '.az360-tbl th{text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text3);text-transform:uppercase;font-size:.62rem;letter-spacing:.4px}' +
      '.az360-tbl td{padding:6px 8px;border-bottom:1px solid var(--border);word-break:break-word}' +
      '.az360-tbl-wrap{overflow-x:auto !important;-webkit-overflow-scrolling:touch;margin:0 -4px 14px;padding:0 4px}' +
      '.az360-tbl-wrap .az360-tbl{min-width:0}' +
      '@media (max-width:768px){' +
      '.az360-tabs .az360-tab{padding:10px 4px !important;font-size:.62rem !important;min-width:0 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis}' +
      '.prod-drawer{overflow-x:auto !important}' +
      '.prod-drawer::-webkit-scrollbar,.az360-tbl-wrap::-webkit-scrollbar{height:6px;width:6px}' +
      '.prod-drawer::-webkit-scrollbar-thumb,.az360-tbl-wrap::-webkit-scrollbar-thumb{background:var(--gold);border-radius:3px}' +
      '.prod-drawer::-webkit-scrollbar-track,.az360-tbl-wrap::-webkit-scrollbar-track{background:transparent}' +
      '.az360-kpi{min-width:72px;padding:8px 6px}' +
      '.az360-kpi .k{font-size:.5rem !important;letter-spacing:0 !important;text-rendering:geometricPrecision !important;font-kerning:none !important}' +
      '.az360-kpi .v{font-size:.85rem;word-spacing:0}' +
      '.az360-kpi .k,.az360-body h4{letter-spacing:0 !important}' +
      '.az360-body{max-height:62dvh}' +
      '.modal{max-height:94dvh !important;width:100% !important;max-width:100% !important;border-radius:0 !important}' +
      '.az360-field-grid{grid-template-columns:1fr !important}' +
      '.az360-tbl th,.az360-tbl td{white-space:nowrap !important;letter-spacing:0}' +
      '.az360-tbl{font-size:.66rem;width:auto;min-width:0;display:block}' +
      '.az360-tbl thead,.az360-tbl tbody{display:table;width:100%}' +
      '}';
    document.head.appendChild(st);
  }
  var TABS = [['overview','📊 Overview'],['orders','📦 Orders'],['returns','🔄 Returns & Refunds'],['loyalty','🌟 Loyalty'],['promos','🏷 Promo Usage'],['edit','✏️ Edit']];
  var az360State = null; // fetched profile
  var az360Customer = null; // customer row from allCustomers
  window.az360Open = async function az360Open(id){
    az360Customer = allCustomers.find(function(x){ return x.id === id; });
    if (!az360Customer) return;
    /* Resolve the drawer lazily — this patch may run before the drawer
       markup exists in the document (script block precedes the markup). */
    custT = custT || document.getElementById('custDrawerTitle');
    custS = custS || document.getElementById('custDrawerSub');
    if (!custT || !custS) return;
    if (!az360TabsBar) {
      az360TabsBar = document.createElement('div');
      az360TabsBar.id = 'cust360Tabs';
      az360TabsBar.className = 'az360-tabs';
      az360TabsBar.setAttribute('style', '');
      custS.insertAdjacentElement('afterend', az360TabsBar);
    }
    custT.textContent = az360Customer.name || 'Customer';
    custS.textContent = 'Customer 360° — every data point in one place';
    // render tab bar — on phones use compact labels so all tabs fit the drawer
    var __mob = window.matchMedia('(max-width:768px)').matches;
    var __compact = { 'returns': 'Returns', 'promos': 'Promos', 'loyalty': 'Loyalty', 'edit': 'Edit' };
    az360TabsBar.innerHTML = TABS.map(function(t){ var lab = (__mob && __compact[t[0]]) ? __compact[t[0]] : t[1]; return '<button type="button" class="az360-tab' + (t[0]==='overview'?' active':'') + '" onclick="az360Tab(\'' + t[0] + '\')">' + lab + '</button>'; }).join('');
    document.getElementById('custDrawerBody').innerHTML = '<div class="az360-body" id="az360Body"><div class="empty-state loading-dots">Loading profile</div></div>';
    // reveal the drawer (the patch's parent script never opened it)
    var __d = document.getElementById('custDrawer');
    var __o = document.getElementById('custDrawerOverlay');
    if (__d && !__d.classList.contains('open')) __d.classList.add('open');
    if (__o && !__o.classList.contains('open')) __o.classList.add('open');
    try {
      var r = await apiFetch('/api/admin/customers/' + id + '/360');
      az360State = r.ok ? ((await r.json()).data || null) : null;
    } catch(e){ az360State = null; }
    if (!az360State) {
      document.getElementById('az360Body').innerHTML = '<div class="empty-state"><div class="empty-ico">⚠️</div><div class="empty-msg">Profile unavailable — check permissions and refresh.</div></div>';
      return;
    }
    az360Tab('overview');
  };
  window.az360Tab = function az360Tab(name){
    /* Resolve the tab bar lazily too — it may not exist yet if the patch
       ran before the drawer markup (script precedes markup). */
    var t = az360TabsBar || document.getElementById('cust360Tabs');
    if (!t) return;
    t.querySelectorAll('.az360-tab').forEach(function(b){ b.classList.toggle('active', b.textContent.trim().toLowerCase().includes(azTabName(name)) === false && b.getAttribute('onclick').indexOf("'" + name + "'") >= 0); });
    t.querySelectorAll('.az360-tab').forEach(function(b){ if (b.getAttribute('onclick') && b.getAttribute('onclick').indexOf("'" + name + "'") >= 0) b.classList.add('active'); else b.classList.remove('active'); });
    // keep the active tab visible inside the horizontally-scrollable tab bar
    var act = t.querySelector('.az360-tab.active');
    if (act) { try { act.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); } catch(e){} }
    var body = document.getElementById('az360Body');
    if (!body) return;
    var d = az360State, c = az360Customer || {};
    if (name === 'overview') body.innerHTML = az360Overview(d, c);
    if (name === 'orders') body.innerHTML = az360Orders(d);
    if (name === 'returns') body.innerHTML = az360Returns(d);
    if (name === 'loyalty') body.innerHTML = az360Loyalty(d);
    if (name === 'promos') body.innerHTML = az360Promos(d);
    if (name === 'edit') body.innerHTML = az360Edit(d, c);
  };
  function azTabName(n){ return n; }
  function az360Money(v){ return '₹' + Number(v||0).toLocaleString('en-IN'); }
  function az360Overview(d, c){
    var o = d.orders, l = d.loyalty;
    var kpi = function(lab, val, ico){ return '<div class="az360-kpi"><div class="k">' + ico + ' ' + lab + '</div><div class="v">' + val + '</div></div>'; };
    var first = o.history.length ? o.history[o.history.length - 1] : null;
        return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
      kpi('Orders', o.total, '📦') + kpi('Lifetime Value', az360Money(o.total_spent), '💰') +
      kpi('VitaPoints', l.balance.toLocaleString('en-IN'), '🌟') +
      kpi('Cancelled', o.cancelled, '❌') + kpi('Returns', d.returns.count, '🔄') + kpi('Coupons Used', d.promos.coupon_codes_used_count, '🏷') +
      '</div>' +
      '<h4 style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:10px 0 8px">Contact</h4>' +
      '<div class="az360-field-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">✉️ Email</div><div class="v" style="font-size:.78rem;font-family:var(--font);word-break:break-all">' + (escHtml(d.customer.email) || '–') + '</div></div>' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">📱 Phone</div><div class="v" style="font-size:.78rem;font-family:var(--font)">' + (escHtml(d.customer.phone) || '–') + '</div></div>' +
      '</div>' +
      '<div class="az360-field-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">📍 City</div><div class="v" style="font-size:.78rem;font-family:var(--font)">' + (escHtml(d.customer.city) || '–') + '</div></div>' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">🗺 State</div><div class="v" style="font-size:.78rem;font-family:var(--font)">' + (escHtml(d.customer.state) || '–') + '</div></div>' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">📮 Pincode</div><div class="v" style="font-size:.78rem;font-family:var(--font)">' + (escHtml(d.customer.pincode) || '–') + '</div></div>' +
      '</div>' +
      '<div class="az360-field-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">✉️ Email campaigns</div><div class="v" style="font-size:.78rem;font-family:var(--font)">' + (d.consent.email !== false ? '✅ Subscribed' : '⛔ Opted out') + '</div></div>' +
      '<div class="az360-kpi" style="text-align:left;padding:10px 12px"><div class="k">📱 WhatsApp</div><div class="v" style="font-size:.78rem;font-family:var(--font)">' + (d.consent.whatsapp !== false ? '✅ Subscribed' : '⛔ Opted out') + '</div></div>' +
      '</div>' +
      (first ? '<div style="margin-top:10px;font-size:.7rem;color:var(--text3)">First order on record: ' + fmtDate(first.created_at) + '</div>' : '');
  }
  function az360Orders(d){
    var o = d.orders;
    var rows = o.history.map(function(r){
      var cancelled = String(r.fulfillment||'').toLowerCase()==='cancelled';
      return '<tr><td style="font-family:var(--mono)">' + r.id + '</td><td>' + fmtDate(r.created_at) + '</td><td><span class="badge ' + (cancelled ? 'badge-red' : (r.status==='Delivered' ? 'badge-green' : 'badge-gold')) + '">' + (cancelled ? 'Cancelled' : r.status) + '</span></td><td style="font-weight:600">' + az360Money(r.total) + '</td><td>' + (r.payment_method||'–').toUpperCase() + '</td><td>' + (r.coupon_code||'–') + '</td></tr>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<div class="az360-kpi"><div class="k">Total orders</div><div class="v">' + o.total + '</div></div>' +
      '<div class="az360-kpi"><div class="k">Total spent</div><div class="v">' + az360Money(o.total_spent) + '</div></div>' +
      '<div class="az360-kpi"><div class="k">Cancelled</div><div class="v">' + o.cancelled + ' (' + az360Money(o.cancelled_value) + ')</div></div>' +
      '<div class="az360-kpi"><div class="k">Payment mix</div><div class="v">' + o.payment_mix.prepaid + ' prepaid · ' + o.payment_mix.cod + ' COD</div></div>' +
      '</div><div class="az360-tbl-wrap"><table class="az360-tbl"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th>Payment</th><th>Coupon</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="6" class="empty-state">No orders</td></tr>') + '</tbody></table></div>';
  }
  function az360Returns(d){
    var rs = d.returns.list, fs = d.refunds.list;
    var rows = rs.map(function(r){
      return '<tr><td style="font-family:var(--mono)">' + (r.order_id||'–') + '</td><td>' + fmtDate(r.created_at) + '</td><td>' + (escHtml(r.reason)||'–') + '</td><td><span class="badge ' + (String(r.status||'').toLowerCase()==='refunded' ? 'badge-green' : 'badge-gold') + '">' + r.status + '</span></td><td>' + az360Money(r.refund_amount) + '</td></tr>';
    }).join('');
    var fr = fs.slice(0, 40).map(function(r){
      return '<tr><td style="font-family:var(--mono)">' + (r.order_id||'–') + '</td><td>' + fmtDate(r.created_at) + '</td><td>' + (r.gateway||'–') + '</td><td><span class="badge ' + (String(r.status||'').toLowerCase().includes('success') ? 'badge-green' : 'badge-gold') + '">' + r.status + '</span></td><td>' + az360Money(r.amount) + '</td></tr>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<div class="az360-kpi"><div class="k">Return requests</div><div class="v">' + d.returns.count + '</div></div>' +
      '<div class="az360-kpi"><div class="k">Refunded returns</div><div class="v">' + d.returns.refunded + '</div></div>' +
      '<div class="az360-kpi"><div class="k">Refund value</div><div class="v">' + az360Money(d.returns.refund_amount_total) + '</div></div>' +
      '<div class="az360-kpi"><div class="k">Gateway refunds</div><div class="v">' + d.refunds.count + '</div></div>' +
      '</div>' +
      '<h4 style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:10px 0 6px">Return requests</h4>' +
      '<div class="az360-tbl-wrap"><table class="az360-tbl"><thead><tr><th>Order</th><th>Date</th><th>Reason</th><th>Status</th><th>Amount</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="empty-state">No returns</td></tr>') + '</tbody></table></div>' +
      '<h4 style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 6px">Gateway refunds (latest 40)</h4>' +
      '<div class="az360-tbl-wrap"><table class="az360-tbl"><thead><tr><th>Order</th><th>Date</th><th>Gateway</th><th>Status</th><th>Amount</th></tr></thead><tbody>' + (fr || '<tr><td colspan="5" class="empty-state">No gateway refunds</td></tr>') + '</tbody></table></div>';
  }
  function az360Loyalty(d){
    var l = d.loyalty;
    var kpi = function(lab, val, ico){ return '<div class="az360-kpi"><div class="k">' + ico + ' ' + lab + '</div><div class="v">' + Number(val||0).toLocaleString('en-IN') + '</div></div>'; };
    var leRows = l.ledger.slice(0, 60).map(function(r){
      var pos = Number(r.points||0) >= 0;
      return '<tr><td>' + fmtDate(r.created_at) + '</td><td>' + escHtml(r.transaction_type) + '</td><td style="font-weight:700;color:' + (pos ? 'var(--green-text)' : 'var(--red)') + '">' + (pos ? '+' : '') + Number(r.points||0).toLocaleString('en-IN') + '</td><td style="font-family:var(--mono);font-size:.66rem">' + (r.order_id || '–') + '</td><td style="color:var(--text3);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + escHtml(r.reason||'') + '">' + escHtml(r.reason||'') + '</td></tr>';
    }).join('');
    var peRows = l.pending_events.map(function(r){
      return '<tr><td>' + fmtDate(r.created_at) + '</td><td>' + Number(r.points||0).toLocaleString('en-IN') + '</td><td style="font-family:var(--mono);font-size:.66rem">' + (r.order_id||'–') + '</td><td>' + (r.delivered_at ? 'Delivered ' + fmtDate(r.delivered_at) : 'Releases ' + fmtDate(r.release_at)) + '</td></tr>';
    }).join('');
    var rwRows = l.rewards.map(function(r){
      return '<tr><td>' + fmtDate(r.claimed_at) + '</td><td>' + escHtml(r.kind||'–') + '</td><td style="font-family:var(--mono)">' + (escHtml(r.code)||'–') + '</td><td><span class="badge ' + (r.used_at ? 'badge-green' : 'badge-gold') + '">' + (r.used_at ? 'Used ' + fmtDate(r.used_at) : 'Active') + '</span></td></tr>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      kpi('Balance', l.balance, '🌟') + kpi('Pending', l.pending, '⏳') + kpi('Locked', l.locked, '🔒') +
      kpi('Debt', l.debt, '➖') + kpi('Lifetime earned', l.lifetime_earned, '⬆') + kpi('Lifetime redeemed', l.lifetime_redeemed, '⬇') +
      '</div>' +
      '<h4 style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:10px 0 6px">Ledger (latest 60)</h4>' +
      '<div class="az360-tbl-wrap"><table class="az360-tbl"><thead><tr><th>Date</th><th>Type</th><th>Points</th><th>Order</th><th>Reason</th></tr></thead><tbody>' + (leRows || '<tr><td colspan="5" class="empty-state">No ledger entries</td></tr>') + '</tbody></table></div>' +
      '<h4 style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 6px">Pending releases</h4>' +
      '<div class="az360-tbl-wrap"><table class="az360-tbl"><thead><tr><th>Date</th><th>Points</th><th>Order</th><th>Release</th></tr></thead><tbody>' + (peRows || '<tr><td colspan="4" class="empty-state">No pending points</td></tr>') + '</tbody></table></div>' +
      '<h4 style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 6px">Rewards</h4>' +
      '<div class="az360-tbl-wrap"><table class="az360-tbl"><thead><tr><th>Claimed</th><th>Kind</th><th>Code</th><th>Status</th></tr></thead><tbody>' + (rwRows || '<tr><td colspan="4" class="empty-state">No rewards claimed</td></tr>') + '</tbody></table></div>';
  }
  function az360Promos(d){
    var m = d.promos.coupons_used || {};
    var keys = Object.keys(m);
    var rows = keys.sort(function(a,b){ return m[b] - m[a]; }).map(function(k){
      return '<tr><td style="font-family:var(--mono);font-weight:600">' + escHtml(k) + '</td><td><span class="badge badge-gold">' + m[k] + '×</span></td></tr>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<div class="az360-kpi"><div class="k">Distinct coupons used</div><div class="v">' + d.promos.coupon_codes_used_count + '</div></div>' +
      '<div class="az360-kpi"><div class="k">Orders with a coupon</div><div class="v">' + keys.reduce(function(s,k){ return s + m[k]; }, 0) + '</div></div>' +
      '</div><div class="az360-tbl-wrap"><table class="az360-tbl" style="max-width:380px"><thead><tr><th>Coupon code</th><th>Times used</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="2" class="empty-state">No coupons used</td></tr>') + '</tbody></table></div>' +
      '<div style="margin-top:12px;font-size:.7rem;color:var(--text3)">Codes are derived from order history (orders where the customer checked out with that code). Cancelled orders are included — cross-check against the Orders tab if a number looks off.</div>';
  }
  function az360Edit(d, c){
    var f = d.customer;
    return '<div style="font-size:.72rem;color:var(--text3);margin-bottom:12px">Edits are saved only after password re-confirmation. Every change is written to the audit log.</div>' +
      '<div class="az360-field-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      az360Field('az360Name', 'Full name', f.name) + az360Field('az360Phone', 'Phone', f.phone) +
      az360Field('az360Email', 'Email', f.email) + az360Field('az360City', 'City', f.city) +
      az360Field('az360State', 'State', f.state) + az360Field('az360Pincode', 'Pincode', f.pincode) +
      '</div>' +
      '<div style="display:flex;gap:12px;margin:12px 0 4px">' +
      '<label style="flex:1;display:flex;align-items:center;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer"><input type="checkbox" id="az360MktEmail" ' + (f.marketing_email !== false ? 'checked' : '') + '> <span style="font-size:.8rem">✉️ Email campaigns</span></label>' +
      '<label style="flex:1;display:flex;align-items:center;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer"><input type="checkbox" id="az360MktWhatsapp" ' + (f.marketing_whatsapp !== false ? 'checked' : '') + '> <span style="font-size:.8rem">📱 WhatsApp messages</span></label>' +
      '</div>' +
      '<div style="margin:12px 0 4px"><label class="field-label">Manual VitaPoints adjustment (−10,000 … +10,000, ledger-logged)</label>' +
      '<input type="number" id="az360Points" class="field-input" placeholder="e.g. -200 to remove, 500 to credit" min="-10000" max="10000"></div>' +
      '<div id="az360EditMsg" class="login-error" style="display:none"></div>' +
      '<div style="margin-top:14px"><button class="btn btn-gold" onclick="az360Save()">💾 Save changes (password required)</button></div>';
  }
  function az360Field(id, label, value){
    return '<div><label class="field-label">' + label + '</label><input type="text" id="' + id + '" class="field-input" value="' + escHtml(value || '') + '"></div>';
  }
  window.az360Save = async function az360Save(){
    var id = az360Customer ? az360Customer.id : null;
    if (!id) return;
    var body = {
      name: document.getElementById('az360Name').value.trim(),
      phone: document.getElementById('az360Phone').value.trim(),
      email: document.getElementById('az360Email').value.trim(),
      city: document.getElementById('az360City').value.trim(),
      state: document.getElementById('az360State').value.trim(),
      pincode: document.getElementById('az360Pincode').value.trim(),
      marketing_email: !!document.getElementById('az360MktEmail').checked,
      marketing_whatsapp: !!document.getElementById('az360MktWhatsapp').checked,
    };
    var pm = document.getElementById('az360Points').value;
    if (pm !== '' && Number.isFinite(Number(pm))) body.points_manual = Number(pm);
    try {
      await confirmCriticalAction('Save changes to this customer\u2019s profile? (Audit-logged)', async function(proof){
        var r = await apiFetch('/api/admin/customers/' + id + '/360', { method: 'PUT', headers: { 'X-Password-Proof': proof }, body: JSON.stringify(body) });
        var d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Could not save changes');
        // refresh local rows so the customers table stays truthful
        var row = allCustomers.find(function(x){ return x.id === id; });
        if (row) { Object.assign(row, { name: body.name, phone: body.phone, email: body.email, city: body.city, state: body.state, pincode: body.pincode, marketing_email: body.marketing_email, marketing_whatsapp: body.marketing_whatsapp }); row._insight = null; }
        az360State = null;
        await az360Open(id);
        renderCustomersTable(customersFilteredList);
        toast('Customer profile saved ✅');
      });
    } catch(e){
      if (String(e.message) !== 'cancelled') { var m = document.getElementById('az360EditMsg'); if (m) { m.textContent = e.message; m.style.display = 'block'; } toast('❌ ' + e.message, 'error'); }
    }
  };
  // Patch the existing row click to open the 360 profile instead of the old insight pass
  // (guarded: only replace if az360Open is reachable, keeping old behaviour as fallback)
  window.__az360OpenInsight = window.openCustomerInsight;
  window.openCustomerInsight = function(id){ if (window.az360Open) { window.az360Open(id); } else { window.__az360OpenInsight(id); } };
})();


/* ══ block 7 (origin 733898-749128, 15213 B) ══ */
// ── Curated palettes (each carries a meaning: paper ramp, brand crimson
//    family, ink family, and the four ambient foil flavours). ──────────
const STORE_ED_PALETTES = [
  { name: 'Crimson Classic', desc: 'The current Ozylix look — crimson over warm near-white.', default: true, p: {
      paper:'#F5F3F4', paperHi:'#FFFFFF', paperLo:'#E9E5E7', white:'#FFFFFF',
      brand:'#C0394A', brandDeep:'#8E2333', brandHi:'#D7535D',
      secondary:'#6B5560', secondaryHi:'#EBD9DC',
      ink:'#16121A', inkMid:'#46404A', tHi:'#16121A', tMid:'#5A5560', tLow:'#6B6570',
      flavour1:'#C0394A', flavour2:'#46404A', flavour3:'#C0304A', flavour4:'#6B5560' } },
  { name: 'Royal Plum', desc: 'Deep plum brand on the same warm ground — richer, more premium.', p: {
      paper:'#F5F3F4', paperHi:'#FFFFFF', paperLo:'#E9E5E7', white:'#FFFFFF',
      brand:'#6B2F55', brandDeep:'#4A1C3B', brandHi:'#8F4A73',
      secondary:'#55606B', secondaryHi:'#E0D9EB',
      ink:'#1A1220', inkMid:'#4A4046', tHi:'#1A1220', tMid:'#5A5060', tLow:'#6B6070',
      flavour1:'#6B2F55', flavour2:'#4A4046', flavour3:'#7A3A60', flavour4:'#55606B' } },
  { name: 'Ocean Ink', desc: 'A calm deep-blue brand — trustworthy, pharmacy-grade.', p: {
      paper:'#F3F5F7', paperHi:'#FFFFFF', paperLo:'#E7EAEE', white:'#FFFFFF',
      brand:'#1D4E79', brandDeep:'#123553', brandHi:'#3A6FA0',
      secondary:'#5B6B7A', secondaryHi:'#DCE8F1',
      ink:'#121820', inkMid:'#3D4A55', tHi:'#121820', tMid:'#4C5862', tLow:'#5F6B74',
      flavour1:'#1D4E79', flavour2:'#3D4A55', flavour3:'#2A5A88', flavour4:'#5B6B7A' } },
  { name: 'Forest Tea', desc: 'Deep green brand — natural, wellness-forward.', p: {
      paper:'#F4F5F1', paperHi:'#FFFFFF', paperLo:'#E7E9E2', white:'#FFFFFF',
      brand:'#2F5D42', brandDeep:'#1D3E2B', brandHi:'#4A8062',
      secondary:'#6B6B55', secondaryHi:'#E3E8D9',
      ink:'#14201B', inkMid:'#404A44', tHi:'#14201B', tMid:'#52605A', tLow:'#63706A',
      flavour1:'#2F5D42', flavour2:'#404A44', flavour3:'#3A6B4E', flavour4:'#6B6B55' } },
  { name: 'Sunset Coral', desc: 'Warm coral brand — energetic and friendly.', p: {
      paper:'#F7F2F0', paperHi:'#FFFFFF', paperLo:'#EDE3DE', white:'#FFFFFF',
      brand:'#D4603E', brandDeep:'#A3432A', brandHi:'#E58262',
      secondary:'#6B5A50', secondaryHi:'#F0E0D4',
      ink:'#1E1614', inkMid:'#4A403A', tHi:'#1E1614', tMid:'#5C514A', tLow:'#6E625A',
      flavour1:'#D4603E', flavour2:'#4A403A', flavour3:'#E07050', flavour4:'#6B5A50' } },
  { name: 'Monochrome Graphite', desc: 'Minimal black-on-white with a single graphite accent.', p: {
      paper:'#F6F6F6', paperHi:'#FFFFFF', paperLo:'#E8E8E8', white:'#FFFFFF',
      brand:'#3A3A3A', brandDeep:'#1E1E1E', brandHi:'#5A5A5A',
      secondary:'#5A5A5A', secondaryHi:'#EBEBEB',
      ink:'#111111', inkMid:'#4A4A4A', tHi:'#111111', tMid:'#555555', tLow:'#6A6A6A',
      flavour1:'#3A3A3A', flavour2:'#4A4A4A', flavour3:'#2E2E2E', flavour4:'#5A5A5A' } },
  { name: 'Lavender Mist', desc: 'Soft lavender brand — gentle and modern.', p: {
      paper:'#F6F4F8', paperHi:'#FFFFFF', paperLo:'#E9E5F0', white:'#FFFFFF',
      brand:'#6A4C93', brandDeep:'#4A3368', brandHi:'#8B6FB5',
      secondary:'#5F6B7A', secondaryHi:'#E4DFF2',
      ink:'#181422', inkMid:'#48405A', tHi:'#181422', tMid:'#58506A', tLow:'#6A6278',
      flavour1:'#6A4C93', flavour2:'#48405A', flavour3:'#7A5CA5', flavour4:'#5F6B7A' } },
];

// ── The token pickers (label → palette key) ────────────────────────────
const STORE_ED_PICKERS = [
  { key:'paper',    label:'Page (ground)' },
  { key:'paperHi',  label:'Raised faces' },
  { key:'paperLo',  label:'Sunken faces' },
  { key:'brand',    label:'Brand colour' },
  { key:'brandDeep',label:'Brand (deep)' },
  { key:'brandHi',  label:'Brand (highlight)' },
  { key:'secondary',label:'Secondary' },
  { key:'secondaryHi',label:'Secondary wash' },
  { key:'ink',      label:'Ink (darkest)' },
  { key:'inkMid',   label:'Ink (mid)' },
  { key:'tHi',      label:'Text (headings)' },
  { key:'tMid',     label:'Text (body)' },
  { key:'tLow',     label:'Text (muted)' },
  { key:'flavour1', label:'Flavour — citrus (foil)' },
  { key:'flavour2', label:'Flavour — cobalt (foil)' },
  { key:'flavour3', label:'Flavour — guava (foil)' },
  { key:'flavour4', label:'Flavour — apple (foil)' },
];

// ── Draft = the in-flight theme (palette + layout + fonts). Kept in
//    localStorage so a reload does not lose an unsaved edit. ────────────
const STORE_ED_DRAFT_KEY = 'ozylix_theme';
const STORE_ED_THEME_API = 'https://ascovitahealthcare-cell-github-io.onrender.com/api/public/theme';

function storeEdDefaultDraft() {
  const pal = STORE_ED_PALETTES.find(x => x.default);
  return { palette: JSON.parse(JSON.stringify(pal.p)), radius:'default', shadows:'default',
           bubbles:'on', fonts: { display: "'Jost', sans-serif", body: "'Schibsted Grotesk', sans-serif" } , style: 'default', combos: {}};
}
function storeEdGetDraft() {
  try { return JSON.parse(window.localStorage.getItem(STORE_ED_DRAFT_KEY) || 'null') || storeEdDefaultDraft(); }
  catch(_) { return storeEdDefaultDraft(); }
}
function storeEdSetDraft(draft) {
  window.localStorage.setItem(STORE_ED_DRAFT_KEY, JSON.stringify(draft));
}

let storeEdDraft = storeEdGetDraft();
let storeEdServerTheme = null;   // what is actually published on the live site
let storeEdPreviewTimer = null;

// ── Page lifecycle: render pickers + palettes, sync controls to draft,
//    fetch the live theme so the status line tells the truth. ───────────
function renderStoreEditor() {
  // Pickers
  const box = document.getElementById('storeEdPickers');
  if (box && !box.children.length) {
    box.innerHTML = STORE_ED_PICKERS.map(pk => `
      <label style="font-size:0.76rem;color:var(--text2);display:flex;flex-direction:column;gap:5px;">
        ${pk.label}
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="color" data-se-picker="${pk.key}" value="${storeEdDraft.palette[pk.key] || '#C0394A'}"
            style="width:34px;height:28px;border:1px solid var(--border);border-radius:6px;padding:0;cursor:pointer;">
          <input type="text" data-se-picker-txt="${pk.key}" value="${storeEdDraft.palette[pk.key] || ''}"
            placeholder="#C0394A" maxlength="7"
            style="flex:1;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-family:var(--mono);font-size:0.78rem;">
        </div>
      </label>`).join('');
    box.querySelectorAll('input[type=color]').forEach(inp =>
      inp.addEventListener('input', e => storeEdPickerChange(e.target.dataset.sePicker, e.target.value)));
    box.querySelectorAll('input[type=text]').forEach(inp =>
      inp.addEventListener('input', e => {
        if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) storeEdPickerChange(e.target.dataset.sePickerTxt, e.target.value);
      }));
  }
  // Palettes
  const palBox = document.getElementById('storeEdPalettes');
  if (palBox && !palBox.children.length) {
    palBox.innerHTML = STORE_ED_PALETTES.map((pal, i) => `
      <button class="btn btn-secondary" style="text-align:left;padding:10px 12px;" onclick="storeEdApplyPalette(${i})">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">
          ${pal.name}${pal.default ? '<span style="font-size:0.62rem;font-weight:800;color:var(--text3);border:1px solid var(--border);border-radius:4px;padding:0 5px;">LIVE</span>' : ''}
        </div>
        <div style="display:flex;gap:3px;margin-bottom:4px;">
          ${['paper','brand','brandHi','secondary','ink','flavour1','flavour3'].map(k =>
            `<span style="width:15px;height:15px;border-radius:4px;background:${pal.p[k]};border:1px solid rgba(0,0,0,.08);"></span>`).join('')}
        </div>
        <div style="font-size:0.68rem;color:var(--text3);line-height:1.4;">${pal.desc}</div>
      </button>`).join('');
  }
  // Layout radio buttons
  document.querySelectorAll('[data-se-radio]').forEach(btn => {
    const active = storeEdDraft[btn.dataset.seRadio] === btn.dataset.seVal;
    btn.style.background = active ? 'var(--gold)' : '';
    btn.style.color = active ? '#fff' : '';
    btn.style.borderColor = active ? 'var(--gold)' : '';
    btn.onclick = () => {
      storeEdDraft[btn.dataset.seRadio] = btn.dataset.seVal;
      storeEdSetDraft(storeEdDraft);
      renderStoreEditor();
      storeEdSchedulePreview();
    };
  });
  // Fonts
  const fd = document.getElementById('storeEdFontDisplay');
  const fb = document.getElementById('storeEdFontBody');
  if (fd) { fd.value = storeEdDraft.fonts.display; fd.onchange = () => { storeEdDraft.fonts.display = fd.value; storeEdSetDraft(storeEdDraft); storeEdSchedulePreview(); }; }
  if (fb) { fb.value = storeEdDraft.fonts.body; fb.onchange = () => { storeEdDraft.fonts.body = fb.value; storeEdSetDraft(storeEdDraft); storeEdSchedulePreview(); }; }
  storeEdStatusLine();
  storeEdSchedulePreview();
}

  // v10 design-system strip + combos
  if (typeof renderStyleStrip === 'function') { try { renderStyleStrip(); } catch(_) {} }
  if (typeof renderCombos === 'function')   { try { renderCombos(); } catch(_) {} }
function storeEdPickerChange(key, value) {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
  storeEdDraft.palette[key] = value;
  storeEdSetDraft(storeEdDraft);
  // keep the sibling inputs in sync
  const col = document.querySelector(`[data-se-picker="${key}"]`);
  const txt = document.querySelector(`[data-se-picker-txt="${key}"]`);
  if (col && col !== document.activeElement) col.value = value;
  if (txt && txt !== document.activeElement && /^[0-9a-fA-F]{6}$/.test(value.slice(1))) txt.value = value;
  storeEdSchedulePreview();
}

function storeEdApplyPalette(i) {
  const pal = STORE_ED_PALETTES[i];
  storeEdDraft.palette = JSON.parse(JSON.stringify(pal.p));
  storeEdSetDraft(storeEdDraft);
  // update color inputs
  document.querySelectorAll('[data-se-picker]').forEach(inp => {
    const v = storeEdDraft.palette[inp.dataset.sePicker];
    if (v) { inp.value = v; const t = document.querySelector(`[data-se-picker-txt="${inp.dataset.sePicker}"]`); if (t) t.value = v; }
  });
  storeEdSchedulePreview();
}

function storeEdApplyDefaults() {
  const pal = STORE_ED_PALETTES.find(x => x.default);
  storeEdDraft.palette = JSON.parse(JSON.stringify(pal.p));
  storeEdDraft.radius = 'default'; storeEdDraft.shadows = 'default';
  storeEdDraft.bubbles = 'on';
  storeEdDraft.fonts = { display: "'Jost', sans-serif", body: "'Schibsted Grotesk', sans-serif" };
  const fd = document.getElementById('storeEdFontDisplay'); if (fd) fd.value = storeEdDraft.fonts.display;
  const fb = document.getElementById('storeEdFontBody'); if (fb) fb.value = storeEdDraft.fonts.body;
  document.querySelectorAll('[data-se-picker]').forEach(inp => {
    const v = storeEdDraft.palette[inp.dataset.sePicker];
    if (v) { inp.value = v; const t = document.querySelector(`[data-se-picker-txt="${inp.dataset.sePicker}"]`); if (t) t.value = v; }
  });
  storeEdSetDraft(storeEdDraft);
  renderStoreEditor();
}

function storeEdResetDraft() {
  if (!confirm('Reset the draft to the original store defaults? Unsaved changes will be lost.')) return;
  storeEdDraft = storeEdDefaultDraft();
  storeEdSetDraft(storeEdDraft);
  renderStoreEditor();
}

function storeEdSchedulePreview() {
  if (storeEdPreviewTimer) clearTimeout(storeEdPreviewTimer);
  storeEdPreviewTimer = setTimeout(storeEdRefreshPreview, 250);
}

// ── The preview loads the real storefront with ?preview=1 so the site's
//    own live-theme loader applies the draft instead of the published
//    theme. Cross-origin iframe; query string reaches the loader. ───────
function storeEdRefreshPreview() {
  const iframe = document.getElementById('storeEdPreview');
  if (!iframe) return;
  try { window.localStorage.setItem(STORE_ED_DRAFT_KEY, JSON.stringify(storeEdDraft)); } catch(_) {}
  // Demo harness rewrites happen in memory only — keep the production URL
  // here and let demo-server.js (or this block) map it when previewing:
  var previewUrl = location.pathname.indexOf('/demo/') === 0 ? '/demo/store?preview=1&ed=' : 'https://ozylix.com/?preview=1&ed=';
  iframe.src = previewUrl + Date.now();
}

function storeEdStatusLine() {
  const st = document.getElementById('storeEdStatus');
  if (!st) return;
  const live = storeEdServerTheme ? 'published on the live store' : 'no custom theme published (site runs its built-in look)';
  const palName = storeEdDraftServerMatch() ? ' (matches published)' : '';
  st.textContent = `Published theme: ${live}. Your draft${palName} — Save to push it live.`;
}
function storeEdDraftServerMatch() {
  if (!storeEdServerTheme) return false;
  const sp = storeEdServerTheme.palette || {};
  const dp = storeEdDraft.palette || {};
  const sMatch = (storeEdDraft.style || 'default') === (storeEdServerTheme.style || 'default');
  const cMatch = JSON.stringify(storeEdDraft.combos || {}) === JSON.stringify(storeEdServerTheme.combos || {});
  return Object.keys(dp).length > 3 && Object.keys(dp).every(k => dp[k] === sp[k]) && sMatch && cMatch;
}

// ── Save: PUT the draft to the backend's public theme store. Owner/
//    admin JWT only; the storefront fetches it anonymously. ─────────────
async function storeEdSave() {
  // Always re-hydrate from localStorage so a direct draft reset (or a
  // multi-tab edit) is never clobbered by a stale in-memory snapshot.
  try { storeEdDraft = storeEdGetDraft(); } catch(_) {}
  const btn = document.querySelector('#page-storeeditor .btn-primary');
  const prev = btn ? btn.textContent : '';
  if (btn) btn.textContent = 'Saving…';
  try {
    const res = await apiFetch('/api/public/theme', {
      method: 'PUT',
      body: JSON.stringify({ key: 'ozylix', theme: storeEdDraft })
    });
    const d = await res.json();
    if (!res.ok) throw new Error((d && (d.error || d.message)) || `HTTP ${res.status}`);
    storeEdServerTheme = JSON.parse(JSON.stringify(storeEdDraft));
    storeEdStatusLine();
    storeEdRefreshPreview();
    toast('Theme saved ✓ — the live store updates within about a minute.');
  } catch (e) {
    toast('❌ Save failed: ' + e.message, 'error');
  } finally {
    if (btn) btn.textContent = prev || '💾 Save theme';
  }
}

// Load the currently published theme once the editor opens.
async function storeEdLoadServerTheme() {
  try {
    const res = await fetch(STORE_ED_THEME_API + '?key=ozylix');
    const d = await res.json();
    if (res.ok && d && d.ok && d.theme && Object.keys(d.theme).length) storeEdServerTheme = d.theme;
  } catch (_) { /* offline — status line stays honest via null */ }
}

// Wire the editor to the page switcher (lazy init, same pattern as the
// v9.4 AI-team additions).
const _storeEdOrigShowPage = window.showPage;
window.showPage = function (page) {
  const out = _storeEdOrigShowPage.apply(this, arguments);
  if (page === 'storeeditor' && !document.getElementById('storeEdPickers').dataset.ready) {
    document.getElementById('storeEdPickers').dataset.ready = '1';
    storeEdLoadServerTheme().then(renderStoreEditor);
  }
  return out;
};


/* ══ block 18 (origin 895075-913530, 18438 B) ══ */
// ═══════════════════════════════════════════════════════════════
// Aug 2026: Store Editor — Website content tab (v9.6).
//
// A second draft shape (content, not style) drives the storefront's
// page copy: announcement bar, hero headline, stats marquee, trust
// tiles, the Vita Points micro-card line and the offer reminder.
//
// The storefront itself is NOT modified — edits are stored in
// store_contents via PUT /api/public/content, previewed by patching
// the live-preview iframe DOM (same-origin in production: the admin
// panel and ozylix.com live on the same GitHub Pages origin), and
// will drive the live site once the storefront's loader is updated.
// ═══════════════════════════════════════════════════════════════
const STORE_ED_CONTENT_KEY = 'ozylix_content_draft';
const STORE_ED_CONTENT_API = 'https://ascovitahealthcare-cell-github-io.onrender.com/api/public/content';
const STORE_ED_CONTENT_STORE = 'ozylix';

// ── Live defaults: the copy currently hard-coded in the storefront.
//    Editing against these is a diff from the real site. ────────────
function storeEdDefaultContent() {
  // v10.1: seed the editor defaults from the REAL live website copy
  // (extracted from www.ozylix.com on 2026-08-15) so the 'Reset to
  // original website' button can roll any section back to the true
  // default, not a hand-typed approximation.
  return {
    announcement: [
      { text: '🔥 Mix More, Save More', icon: '' },
      { text: '🚚 Free Delivery Every Order', icon: '' },
      { text: '🌿 FSSAI Approved & Lab Tested', icon: '' },
      { text: '🇮🇳 Made in India · Anand, Gujarat', icon: '' },
      { text: '📞 +91 9898 582 650', icon: '' }
    ],
    hero: {
      badge: 'FSSAI APPROVED · LAB TESTED',
      line1: 'EFFERVESCENT', line2: 'Wellness', line3: 'Made in India',
      sub: 'Fast-absorbing effervescent vitamins, spirulina and ayurvedic supplements — manufactured in our own FSSAI approved facility in Anand, Gujarat.',
      cta: 'Shop All Products'
    },
    stats: ["500+ Pin Codes Served", "24h Dispatch Time", "FSSAI Approved Facility \u2014 Anand, Gujarat", "Free Delivery on Every Order", "100% Organic Ingredients", "Secure Payments via GoKwik"],
    trust: {
      tiles: [{ icon: '🇮🇳', label: 'Made in India<br>Anand, Gujarat' }, { icon: '✅', label: 'FSSAI Approved<br>& Lab Tested' }, { icon: '🔬', label: 'In-House<br>Manufacturing' }, { icon: '🚚', label: 'Fast & Free<br>Delivery' }, { icon: '🚚', label: 'Ships within\n24 Hours' }, { icon: '🔒', label: 'Secure Payments\nvia GoKwik' }],
      items: ['🇮🇳 Made in India — Anand, Gujarat', '✅ FSSAI Approved — & Lab Tested', '🔬 In-House — Manufacturing', '🚚 Fast & Free — Delivery', '🚚 Ships within\n24 Hours', '🔒 Secure Payments\nvia GoKwik']
    },
    vitaMicro: { earnText: '1 point per ₹1', valueText: '150 points = ₹1 off' },
    offerReminder: { title: '', offerHtml: 'Free delivery on every order — plus bundle discounts on Mix & Match picks.', cta: 'Shop now' }
  };
}

function storeEdGetContent() {
  try { return JSON.parse(window.localStorage.getItem(STORE_ED_CONTENT_KEY) || 'null') || storeEdDefaultContent(); }
  catch(_) { return storeEdDefaultContent(); }
}
function storeEdSetContent(c) { window.localStorage.setItem(STORE_ED_CONTENT_KEY, JSON.stringify(c)); }

// ── Tab switch: Style vs Content. Both share the live preview
//    iframe; the Content tab patches the storefront DOM directly. ───
function storeEdSwitchTab(tab) {
  const stylePanel = document.getElementById('storeEdStylePanel');
  const contentPanel = document.getElementById('storeEdContentPanel');
  const saveContentBtn = document.getElementById('storeEdSaveContentBtn');
  if (tab === 'content') {
    stylePanel.style.display = 'none';
    contentPanel.style.display = 'grid';
    document.getElementById('storeEdTabContent').style.background = 'var(--green)';
    document.getElementById('storeEdTabContent').style.color = '#fff';
    document.getElementById('storeEdTabStyle').style.background = '';
    document.getElementById('storeEdTabStyle').style.color = '';
    saveContentBtn.style.display = '';
    const resetBtn = document.getElementById('storeEdResetContentBtn');
    if (resetBtn) resetBtn.style.display = '';
    renderContentTab();
    storeEdEnsurePreview();
    storeEdPatchContentPreview();
  } else {
    stylePanel.style.display = 'grid';
    contentPanel.style.display = 'none';
    document.getElementById('storeEdTabStyle').style.background = 'var(--gold)';
    document.getElementById('storeEdTabStyle').style.color = '#fff';
    document.getElementById('storeEdTabContent').style.background = '';
    document.getElementById('storeEdTabContent').style.color = '';
    saveContentBtn.style.display = 'none';
    const resetBtn2 = document.getElementById('storeEdResetContentBtn');
    if (resetBtn2) resetBtn2.style.display = 'none';
  }
}

// ── Content card rendering: one card per editable section. ────────
const STORE_ED_CONTENT_SECTIONS = [
  { key: 'announcement', title: '📢 Announcement bar (scrolling strip)',
    fields: [ { k: 'text', label: 'Item text', list: true }, { k: 'icon', label: 'Emoji icon', list: true, short: true } ] },
  { key: 'hero', title: '🎬 Hero headline & call-to-action',
    fields: [ { k: 'badge' }, { k: 'line1' }, { k: 'line2' }, { k: 'line3' }, { k: 'sub', area: true }, { k: 'cta', label: 'Button label' } ] },
  { key: 'stats', title: '📊 Stats marquee (dots row)',
    fields: [ { k: 'text', label: 'Stat text', list: true } ] },
  { key: 'trust', title: '✅ Trust section (tiles & items)',
    listKey: 'tiles',
    fields: [ { k: 'icon', label: 'Tile emoji', list: true, short: true }, { k: 'label', label: 'Tile label (2 lines with <br>)', list: true } ] },
  { key: 'vitaMicro', title: '✨ Vita Points promo line',
    fields: [ { k: 'earnText', label: 'Earn text (e.g. "1 point per ₹1")' }, { k: 'valueText', label: 'Value text (e.g. "150 points = ₹1 off")' } ] },
  { key: 'offerReminder', title: '🏷️ Offer reminder card',
    fields: [ { k: 'title' }, { k: 'offerHtml', label: 'Offer copy', area: true }, { k: 'cta', label: 'Button label' } ] }
];

function storeEdContentField(section, field, value, listIdx) {
  if (field.area) return `<textarea data-ce-key="${section.key}" data-ce-field="${field.k}" data-ce-idx="${listIdx}" rows="2" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:0.8rem;font-family:var(--font);">${storeEdEscapeAttr(String(value || ''))}</textarea>`;
  const cls = field.short ? 'width:80px;' : 'width:100%;'
  return `<input data-ce-key="${section.key}" data-ce-field="${field.k}" data-ce-idx="${listIdx}" value="${storeEdEscapeAttr(String(value || ''))}" style="${cls}background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:0.8rem;font-family:var(--font);">`;
}

function storeEdEscapeAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function renderContentTab() {
  const content = storeEdGetContent();
  const box = document.getElementById('storeEdContentCards');
  if (!box) return;
  box.innerHTML = STORE_ED_CONTENT_SECTIONS.map(sec => {
    const rows = [];
    if (sec.fields.some(f => f.list)) {
      const list = (content[sec.key] && (sec.listKey ? content[sec.key][sec.listKey] : content[sec.key])) || [];
      rows.push('<div style="display:grid;gap:7px;">' + list.map((item, i) => {
        const cells = sec.fields.filter(f => f.list).map(f =>
          `<div><div style="font-size:0.66rem;font-weight:700;color:var(--text3);margin-bottom:3px;">${f.label || f.k} ${i + 1}</div>${storeEdContentField(sec, f, item[f.k], i)}</div>`).join('');
        return `<div style="display:flex;gap:8px;align-items:start;"><div style="flex:1;display:grid;grid-template-columns:${sec.fields.filter(f => f.list).length > 1 ? '1fr 80px' : '1fr'};gap:8px;">${cells}</div><button class="btn btn-secondary btn-sm" onclick="storeEdContentRemove('${sec.key}', ${i})" style="padding:6px 8px;">✕</button></div>`;
      }).join('') + `<button class="btn btn-secondary btn-sm" onclick="storeEdContentAdd('${sec.key}')" style="justify-self:start;">＋ Add item</button></div>`);
    } else {
      rows.push('<div style="display:grid;gap:8px;">' + sec.fields.map(f =>
        `<div><div style="font-size:0.66rem;font-weight:700;color:var(--text3);margin-bottom:3px;">${f.label || f.k}</div>${storeEdContentField(sec, f, content[sec.key][f.k], '')}</div>`).join('') + '</div>');
    }
    return `<div class="card"><div class="card-hdr"><span class="card-title">${sec.title}</span></div><div style="padding:10px 14px 14px;">${rows.join('')}</div></div>`;
  }).join('');
  box.querySelectorAll('[data-ce-key]').forEach(el => {
    const evt = el.tagName === 'TEXTAREA' ? 'input' : 'input';
    el.addEventListener(evt, () => {
      const content = storeEdGetContent();
      const sec = el.dataset.ceKey, f = el.dataset.ceField, i = el.dataset.ceIdx;
      if (i === '') { content[sec][f] = el.value; }
      else { if (content[sec][i]) content[sec][i][f] = el.value; }
      storeEdSetContent(content);
      storeEdPatchContentPreview();
      const st = document.getElementById('storeEdContentStatus');
      if (st) st.textContent = 'Unsaved draft — hit Save content to publish.';
    });
  });
}

function storeEdContentAdd(sec) {
  const content = storeEdGetContent();
  const def = storeEdDefaultContent();
  if (sec === 'announcement') content[sec].push({ text: '', icon: '✨' });
  else if (sec === 'stats') content[sec].push(def.stats[0]);
  else if (sec === 'trust') content[sec].tiles.push({ icon: '✅', label: 'New<br>tile' });
  storeEdSetContent(content);
  renderContentTab();
  storeEdPatchContentPreview();
}
function storeEdContentRemove(sec, i) {
  const content = storeEdGetContent();
  const target = (sec === 'trust') ? content[sec].tiles : content[sec];
  target.splice(i, 1);
  storeEdSetContent(content);
  renderContentTab();
  storeEdPatchContentPreview();
}

// ── Preview patch: push the content draft into the live-preview
//    iframe DOM. Same-origin on production (ozylix.com/admin.html and
//    ozylix.com share an origin), so contentDocument is reachable. ───
// Content tab needs the same storefront iframe the Style tab uses —
// it already carries the live-theme loader draft, so one shared iframe
// keeps theme + content drafts visible at the same time.
function storeEdEnsurePreview() {
  const shared = document.getElementById('storeEdPreview');
  if (!shared) return;
  const contentFrame = document.getElementById('storeEdPreviewContent');
  if (contentFrame) { contentFrame.remove(); }
  // Move the shared iframe into the Content panel when that tab is open.
  const panel = document.getElementById('storeEdContentPanel');
  const target = (panel && panel.style.display === 'grid') ? panel : null;
  if (target) { const slot = target.querySelector('#storeEdContentPreviewSlot'); if (slot) { slot.appendChild(shared); slot.style.display = ''; slot.style.minHeight = ''; } }
  else {
    const stylePanel = document.getElementById('storeEdStylePanel');
    if (stylePanel) {
      const slot = stylePanel.querySelector('.card > div');
      if (slot) slot.appendChild(shared);
    }
    const slot2 = document.getElementById('storeEdContentPreviewSlot');
    if (slot2) slot2.style.display = 'none';
  }
  if (!shared.src || shared.src === 'about:blank') storeEdRefreshPreview();
}
function storeEdPatchContentPreview() {
  const iframe = document.getElementById('storeEdPreview');
  if (!iframe) return;
  let doc = null;
  try { doc = iframe.contentDocument; } catch(_) {}
  if (!doc || !doc.body || doc.body.children.length === 0) return; // iframe still loading
  const c = storeEdGetContent();
  try {
    // Announcement bar: rebuild the scrolling strip items.
    const annInner = doc.querySelector('.ann-inner');
    if (annInner && c.announcement && c.announcement.length) {
      annInner.innerHTML = c.announcement.map(a =>
        `<span><svg class="ann-svg" width="16" height="16"><use href="#ico-leaf"/></svg> ${storeEdEscapeAttr(a.icon ? a.icon + ' ' : '')}${storeEdEscapeAttr(a.text)}</span>`).join('');
    }
    // Hero.
    const badge = doc.querySelector('.shader-badge span:last-child');
    if (badge && c.hero.badge) badge.textContent = c.hero.badge;
    const h1 = doc.querySelector('.shader-headline');
    if (h1 && c.hero) {
      const lines = h1.querySelectorAll('.sh-line');
      if (lines[0] && c.hero.line1) lines[0].textContent = c.hero.line1;
      if (lines[1] && c.hero.line2) lines[1].textContent = c.hero.line2;
      if (lines[2] && c.hero.line3) lines[2].textContent = c.hero.line3;
    }
    const sub = doc.querySelector('.shader-sub');
    if (sub && c.hero.sub) sub.textContent = c.hero.sub;
    const cta = doc.querySelector('.shader-btn-primary');
    if (cta && c.hero.cta) cta.textContent = c.hero.cta;
    // Stats marquee dots.
    const smItems = doc.querySelectorAll('.sm-item');
    if (smItems.length && c.stats && c.stats.length) {
      smItems.forEach((el, i) => { if (c.stats[i % c.stats.length]) el.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = c.stats[i % c.stats.length]; }); });
    }
    // Trust tiles.
    const tiles = doc.querySelectorAll('.trust-tile');
    if (tiles.length && c.trust && c.trust.tiles) {
      tiles.forEach((t, i) => {
        if (c.trust.tiles[i % c.trust.tiles.length]) {
          const ico = t.querySelector('.tt-ico'), lbl = t.querySelector('.tt-lbl');
          if (ico) ico.textContent = c.trust.tiles[i % c.trust.tiles.length].icon;
          if (lbl) lbl.innerHTML = storeEdEscapeAttr(c.trust.tiles[i % c.trust.tiles.length].label).replace(/&lt;br&gt;/g, '<br>');
        }
      });
    }
    // Trust items (second list).
    const tItems = doc.querySelectorAll('.trust-item');
    if (tItems.length && c.trust && c.trust.items) {
      tItems.forEach((el, i) => { if (c.trust.items[i % c.trust.items.length]) el.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = c.trust.items[i % c.trust.items.length]; }); });
    }
    // Vita Points micro-card.
    const earn = doc.getElementById('vitaMicroEarn'), val = doc.getElementById('vitaMicroValue');
    if (earn && c.vitaMicro && c.vitaMicro.earnText) earn.textContent = c.vitaMicro.earnText;
    if (val && c.vitaMicro && c.vitaMicro.valueText) val.textContent = c.vitaMicro.valueText;
    // Offer reminder.
    const orTitle = doc.querySelector('.offer-reminder .or-title, .offer-reminder b'), orOffer = doc.querySelector('.offer-reminder .or-offer');
    if (orTitle && c.offerReminder && c.offerReminder.title) orTitle.textContent = c.offerReminder.title;
    if (orOffer && c.offerReminder && c.offerReminder.offerHtml) orOffer.textContent = c.offerReminder.offerHtml;
  } catch(_) {}
}

// ── Load published content on first paint of the Content tab. ─────
// ── Reset: roll every section back to the real live website copy. ──
// ── Reset confirmation: double-check before wiping edits. ───
function storeEdResetConfirm() {
  if (confirm('Reset ALL content sections back to the real live website copy and re-publish it? Your unsaved edits will be lost.')) {
    const st = document.getElementById('storeEdContentStatus');
    if (st) st.textContent = 'Restoring original website content…';
    storeEdResetContent();
  }
}
function storeEdResetContent() {
  const newContent = storeEdDefaultContent();
  // The default IS the live site now; publish it so the storefront reverts.
  storeEdSetContent(newContent);
  renderContentTab();
  storeEdPatchContentPreview();
  storeEdSaveContent();
}
async function storeEdLoadContent() {
  const st = document.getElementById('storeEdContentStatus');
  try {
    const res = await fetch(STORE_ED_CONTENT_API + '?key=' + STORE_ED_CONTENT_STORE);
    if (!res.ok) { if (st) st.textContent = ''; return; }
    const d = await res.json();
    if (d && d.ok && d.content && Object.keys(d.content).length) {
      const published = storeEdDefaultContent();
      for (const k of Object.keys(d.content)) if (k in published) published[k] = d.content[k];
      const saved = storeEdGetContent();
      // Merge: published only wins where the local draft is still default.
      const def = storeEdDefaultContent();
      for (const k of Object.keys(published)) {
        const isDefault = JSON.stringify(saved[k]) === JSON.stringify(def[k]);
        if (isDefault && JSON.stringify(published[k]) !== JSON.stringify(def[k])) saved[k] = published[k];
      }
      storeEdSetContent(saved);
      if (st) st.textContent = 'Published content loaded — editing builds on it.';
      setTimeout(() => { if (st) st.textContent = ''; }, 6000);
    }
  } catch(_) {}
}

// ── Save content: publish the draft. ──────────────────────────────
async function storeEdSaveContent() {
  const st = document.getElementById('storeEdContentStatus');
  const btn = document.getElementById('storeEdSaveContentBtn');
  btn.disabled = true;
  if (st) st.textContent = 'Publishing content…';
  try {
    const res = await apiFetch('/api/public/content', {
      method: 'PUT',
      body: JSON.stringify({ key: STORE_ED_CONTENT_STORE, content: storeEdGetContent() })
    });
    const d = await res.json();
    if (res.ok && d && d.ok) {
      if (st) st.textContent = 'Content published ✅ Visitors see it once the storefront picks up the update.';
    } else if (res.status === 401) {
      if (st) st.textContent = 'Session expired — sign in again, then hit Save content.';
    } else {
      if (st) st.textContent = 'Save failed: ' + ((d && d.error) || ('HTTP ' + res.status));
    }
  } catch(e) {
    if (st) st.textContent = 'Save failed — cannot reach the server.';
  }
  setTimeout(() => { btn.disabled = false; if (st) st.textContent = ''; }, 7000);
}

// ── Wire-up: patch the preview when it finishes loading. ──────────
(function () {
  // Auto-patch content drafts into the preview whenever the storefront finishes loading.
  const iv = setInterval(() => {
    const iframe = document.getElementById('storeEdPreview');
    if (!iframe) return;
    iframe.addEventListener('load', () => { try { storeEdPatchContentPreview(); } catch(_) {} });
    clearInterval(iv);
  }, 1000);
})();


/* ══ block 19 (origin 913604-950937, 37316 B) ══ */
// ═════════════ STORE EDITOR v10 — DESIGN SYSTEM ENGINE ═════════════
// Adds 7 design-system presets (Claymorphism, Aurora UI, Bento Grid,
// Neo-Brutalism, Skeuomorphism, Material/Flat, Default Crimson) plus a
// deep combinations section. Presets set full token DEFAULTS; the
// existing palette / custom pickers / layout controls still win when
// the admin tunes them manually. Appended at end per repo convention.
(() => {
  'use strict';
  // ── Computed helpers: palette colour ops ────────────────────────
  function storeEdMix(a, b, t) {
    const pa = [a,b].map(c => {
      const h = c.replace('#','');
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    });
    const r = pa[0].map((v,i) => Math.round(v + (pa[1][i]-v)*t));
    return '#' + r.map(v => Math.min(255,Math.max(0,v)).toString(16).padStart(2,'0')).join('').toUpperCase();
  }
  function storeEdLighten(hex, t) { return storeEdMix(hex, '#FFFFFF', Math.min(1, Math.max(0, t))); }
  function storeEdDarken(hex, t)  { return storeEdMix(hex, '#000000', Math.min(1, Math.max(0, t))); }

  // ── Style registry ──────────────────────────────────────────────
  // Each preset returns a token map of the storefront's root CSS
  // variables (and a few targeted rules) for the CURRENT draft palette.
  // Draft: { palette:{ paper,paperHi,... }, style, combos, ... }
  function storeEdStyleDefault(draft) {
    const p = draft.palette || {};
    const paper = p.paper || '#F5F3F4';
    const ink = p.ink || '#16121A';
    return {
      tokens: {},
      rules: ['--neo-1: 3px 3px 7px var(--sh-d), -3px -3px 7px var(--sh-l);',
              '--neo-in: inset 3px 3px 7px var(--sh-d), inset -3px -3px 7px var(--sh-l);',
              '--radius: var(--r-md);', '--shadow: var(--neo-1);']
    };
  }

  function storeEdStyleClay(draft) {
    // Soft inflatable clay: outer puff + inner highlight on every face.
    const p = draft.palette || {};
    const paper = p.paper || '#F2F0F4'; const hi = p.paperHi || '#FFFFFF';
    const ink = p.ink || '#2A2432';
    const shd = 'rgba(90,80,110,.16)', lit = 'rgba(255,255,255,.85)';
    return {
      tokens: {
        paper: storeEdLighten(paper, .04), paperHi: storeEdLighten(hi, .03),
        ink: ink,
      },
      rules: [
        `--sh-d: ${shd}; --sh-l: ${lit};`,
        `--neo-1: 6px 8px 14px ${shd}, -5px -6px 12px ${lit};`,
        `--neo-2: 10px 12px 22px ${shd}, -8px -10px 18px ${lit};`,
        `--neo-in: inset 6px 6px 12px ${shd}, inset -5px -5px 10px ${lit};`,
        `--neo-shadow: var(--neo-2); --neo-shadow-sm: var(--neo-1);`,
        `--shadow: var(--neo-1); --shadow-xs: var(--neo-1); --shadow-sm: var(--neo-1);`,
        `--radius: var(--r-lg);`,
        `.product-card:hover,.cat-card:hover,.btn-primary:hover,.shader-btn-primary:hover{transform:translateY(-3px) scale(1.015);transition:transform .25s ease, box-shadow .25s ease;}`,
        `.particle{opacity:.35 !important;}`
      ]
    };
  }

  function storeEdStyleAurora(draft) {
    // Northern-lights backdrop + glass surfaces.
    const p = draft.palette || {};
    const brand = p.brand || '#C0394A';
    const flav1 = p.flavour1 || '#4B7BE5', flav2 = p.flavour2 || '#9B5DE5';
    const flav3 = p.flavour3 || '#F15BB5', flav4 = p.flavour4 || '#4CC9F0';
    return {
      tokens: { paperHi: 'rgba(255,255,255,.62)', paperLo: 'rgba(245,243,244,.45)' },
      rules: [
        `body{background:radial-gradient(1200px 600px at 12% -5%, ${storeEdLighten(flav1,.68)}, transparent 55%), radial-gradient(900px 500px at 88% 8%, ${storeEdLighten(flav2,.62)}, transparent 52%), radial-gradient(1000px 700px at 50% 105%, ${storeEdLighten(flav3,.58)}, transparent 58%), linear-gradient(180deg, #F7F4FC, #EEF2FA);}`,
        `#liquidFoil{display:none !important;}`,
        `.navbar,.card,.product-card,.cat-card,.cat-card-sm{background:${'rgba(255,255,255,.62)'} !important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.65);box-shadow:0 8px 30px rgba(90,80,120,.12);}`,
        `--shadow: 0 8px 30px rgba(90,80,120,.12); --shadow-xs: 0 4px 14px rgba(90,80,120,.10); --shadow-sm: 0 6px 18px rgba(90,80,120,.11);`,
        `--radius: var(--r-lg);`,
        `.btn-primary,.shader-btn-primary{background:${brand};box-shadow:0 6px 20px ${storeEdDarken(brand,.25)}40;border:none;}`,
        `.particle{opacity:.3 !important;animation-duration:38s !important;}`
      ]
    };
  }

  function storeEdStyleBento(draft) {
    // Clean grid of rounded boxes; tint per zone, consistent radii.
    const p = draft.palette || {};
    const paper = p.paper || '#F4F4F5'; const ink = p.ink || '#18181B';
    const brand = p.brand || '#C0394A';
    return {
      tokens: { paper: paper, paperHi: '#FFFFFF', paperLo: '#EDEDF0' },
      rules: [
        `--sh-d: rgba(30,30,36,.07); --sh-l: #FFFFFF;`,
        `--neo-1: 0 0 0 1px rgba(30,30,36,.06), 0 2px 8px rgba(30,30,36,.06);`,
        `--neo-2: 0 0 0 1px rgba(30,30,36,.07), 0 6px 18px rgba(30,30,36,.08);`,
        `--shadow: var(--neo-1); --shadow-xs: var(--neo-1); --shadow-sm: var(--neo-1);`,
        `--radius: var(--r-md);`,
        `.products-grid,.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;}`,
        `.navbar{background:#FFFFFF;border-bottom:1px solid rgba(30,30,36,.07);box-shadow:none;}`,
        `.promo-strip,.announce{border-radius:18px;box-shadow:var(--neo-1);}`,
        `.btn-primary,.shader-btn-primary{box-shadow:0 2px 8px ${storeEdDarken(brand,.3)}26;border-radius:var(--r-md);}`
      ]
    };
  }

  function storeEdStyleBrutal(draft) {
    // Neo-brutalism: hard outlines, offset shadows, stark flat type.
    const p = draft.palette || {};
    const paper = p.paper || '#FFEFD8'; const brand = p.brand || '#C0394A';
    const flav1 = p.flavour1 || '#FFD23F', flav2 = p.flavour2 || '#06D6A0';
    const flav3 = p.flavour3 || '#EF476F', flav4 = p.flavour4 || '#118AB2';
    return {
      tokens: { paper: paper, paperHi: '#FFFFFF', ink: '#111111', tHi: '#111111' },
      rules: [
        `--sh-d: #111111; --sh-l: #FFFFFF;`,
        `--neo-1: 4px 4px 0 #111111; --neo-2: 7px 7px 0 #111111;`,
        `--neo-in: inset 4px 4px 0 rgba(0,0,0,.12);`,
        `--shadow: var(--neo-1); --shadow-xs: 3px 3px 0 #111111; --shadow-sm: 5px 5px 0 #111111;`,
        `--radius: var(--r-sm);`,
        `.card,.product-card,.cat-card,.cat-card-sm,.navbar,.hero-body{border:2.5px solid #111111 !important;}`,
        `.btn-primary,.shader-btn-primary{border:2.5px solid #111111;box-shadow:4px 4px 0 #111111;transition:transform .12s, box-shadow .12s;}`,
        `.btn-primary:active,.shader-btn-primary:active{transform:translate(3px,3px);box-shadow:1px 1px 0 #111111;}`,
        `h1,h2,h3,.page-title{text-transform:uppercase;letter-spacing:.06em;}`,
        `.products-grid .product-card:nth-child(5n+1){background:${flav1};}.products-grid .product-card:nth-child(5n+2){background:${flav2};color:#0B3D2C;}`,
        `.products-grid .product-card:nth-child(5n+3){background:${flav3};color:#FFF;}.products-grid .product-card:nth-child(5n+4){background:${flav4};color:#FFF;}`,
        `.particle{display:none !important;}#liquidFoil{display:none;}`
      ]
    };
  }

  function storeEdStyleSkeuo(draft) {
    // Real-world materials: gradients, bevels, physical buttons.
    const p = draft.palette || {};
    const paper = p.paper || '#EAE2D6'; const ink = p.ink || '#3B2F24';
    const brand = p.brand || '#C0394A';
    return {
      tokens: { paper: paper, paperHi: '#F6EFE3', paperLo: '#DDD2C2' },
      rules: [
        `body{background:linear-gradient(180deg, #EDE4D4, #E4D8C4);}`,
        `--sh-d: rgba(60,45,30,.28); --sh-l: rgba(255,250,238,.75);`,
        `--neo-1: 2px 3px 5px rgba(60,45,30,.3), inset 0 1px 0 rgba(255,250,238,.9);`,
        `--neo-2: 4px 6px 10px rgba(60,45,30,.28), inset 0 1px 0 rgba(255,250,238,.8);`,
        `--neo-in: inset 2px 3px 6px rgba(60,45,30,.3), inset 0 1px 0 rgba(255,250,238,.5);`,
        `--shadow: var(--neo-1); --shadow-xs: var(--neo-1); --shadow-sm: var(--neo-1);`,
        `--radius: var(--r-sm);`,
        `.card,.product-card,.cat-card{background:linear-gradient(180deg,#F8F1E4,#EDE2D0);border:1px solid #CBBBA2;}`,
        `.btn-primary,.shader-btn-primary{background:linear-gradient(180deg,${storeEdLighten(brand,.15)},${storeEdDarken(brand,.1)});border:1px solid ${storeEdDarken(brand,.3)};box-shadow:0 2px 4px rgba(40,25,15,.35), inset 0 1px 0 rgba(255,255,255,.35);}`,
        `.navbar{background:linear-gradient(180deg,#EFE6D5,#E2D4BE);border-bottom:1px solid #CBBBA2;}`,
        `.particle{display:none !important;}#liquidFoil{display:none;}`
      ]
    };
  }

  function storeEdStyleMaterial(draft) {
    // Flat Material: crisp surfaces, subtle elevation, calm.
    const p = draft.palette || {};
    const paper = p.paper || '#FAFAF9'; const brand = p.brand || '#C0394A';
    return {
      tokens: { paper: paper, paperHi: '#FFFFFF', paperLo: '#F3F3F2' },
      rules: [
        `--sh-d: rgba(30,30,32,.09); --sh-l: #FFFFFF;`,
        `--neo-1: 0 1px 2px rgba(30,30,32,.06), 0 2px 6px rgba(30,30,32,.05);`,
        `--neo-2: 0 3px 8px rgba(30,30,32,.08), 0 8px 20px rgba(30,30,32,.07);`,
        `--neo-in: none;`,
        `--shadow: var(--neo-1); --shadow-xs: var(--neo-1); --shadow-sm: 0 2px 7px rgba(30,30,32,.07);`,
        `--radius: var(--r-md);`,
        `.card,.product-card,.cat-card{border:1px solid rgba(30,30,32,.06);}`,
        `.btn-primary,.shader-btn-primary{box-shadow:0 2px 6px ${storeEdDarken(brand,.3)}29;}`,
        `.navbar{border-bottom:1px solid rgba(30,30,32,.07);}`,
        `.particle{opacity:.2 !important;}`
      ]
    };
  }

  // ── v10.3 brand-new full templates ────────────────────────────
  function storeEdStyleMidnight(draft) {
    // Midnight Luxe: dark premium — ink surfaces, gold accents, serif display.
    const p = draft.palette || {};
    const gold = p.brand || '#C9A24B';
    return {
      tokens: { paper: '#101217', paperHi: '#171A21', paperLo: '#0A0C10',
                ink: '#F2EFE8', tHi: '#F2EFE8', tMid: '#A9A498', tLow: '#7C786E' },
      rules: [
        `--sh-d: rgba(0,0,0,.55); --sh-l: rgba(255,255,255,.05);`,
        `--neo-1: 0 8px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04);`,
        `--neo-2: 0 16px 48px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04);`,
        `--neo-in: inset 0 2px 8px rgba(0,0,0,.5);`,
        `--shadow: var(--neo-1); --shadow-xs: 0 4px 14px rgba(0,0,0,.45); --shadow-sm: 0 10px 34px rgba(0,0,0,.5);`,
        `--radius: var(--r-md); --font-display: 'Playfair Display', Georgia, serif;`,
        `body{background: linear-gradient(180deg, #0F1116, #0A0C10) !important; color: #F2EFE8;}`,
        `.navbar,.card,.product-card,.cat-card,.cat-card-sm,.trust-card{background:#171A21 !important;border:1px solid rgba(201,162,75,.22);box-shadow:var(--neo-1);}`,
        `.hero-body,.shader-stage{background:linear-gradient(180deg,#14161C 0%,#0C0E13 70%);}`,
        `.btn-primary,.shader-btn-primary{background:linear-gradient(180deg, ${storeEdLighten(gold,.12)}, ${gold});color:#141208;border:none;box-shadow:0 4px 18px ${gold}55;font-weight:600;letter-spacing:.06em;}`,
        `.shader-badge{background:${gold}22;border:1px solid ${gold}66;color:${storeEdLighten(gold,.35)};}`,
        `h1,h2,h3{color:#F2EFE8;font-family:'Playfair Display',Georgia,serif;font-weight:500;letter-spacing:.01em;}`,
        `.trust-tile{background:#171A21;border:1px solid rgba(201,162,75,.2);}`,
        `.footer-wrap{background:#0A0C10;border-top:1px solid rgba(201,162,75,.18);}`,
        `.particle{display:none !important;}#liquidFoil{display:none;}`
      ]
    };
  }
  function storeEdStyleFreshpharm(draft) {
    // Fresh Pharmacy: clinical clean — white/teal, strict grid, trust-forward.
    const p = draft.palette || {};
    const teal = p.brand || '#0E7C86';
    return {
      tokens: { paper: '#FFFFFF', paperHi: '#FFFFFF', paperLo: '#F2F6F7',
                ink: '#0B2529', tHi: '#0B2529', tMid: '#3A5559', tLow: '#5F7A7E' },
      rules: [
        `--sh-d: rgba(14,124,134,.14); --sh-l: #FFFFFF;`,
        `--neo-1: 0 0 0 1px rgba(14,124,134,.10), 0 1px 3px rgba(14,124,134,.06);`,
        `--neo-2: 0 0 0 1px rgba(14,124,134,.12), 0 4px 12px rgba(14,124,134,.08);`,
        `--neo-in: none;`,
        `--shadow: var(--neo-1); --shadow-xs: var(--neo-1); --shadow-sm: var(--neo-2);`,
        `--radius: 14px; --font-display: 'Jost', system-ui, sans-serif;`,
        `body{background:#F8FBFB !important;}`,
        `.navbar{background:#FFFFFF;border-bottom:2px solid ${teal} !important;box-shadow:none;}`,
        `.card,.product-card,.cat-card,.cat-card-sm{background:#FFFFFF !important;border:1px solid rgba(14,124,134,.16);box-shadow:0 1px 3px rgba(14,124,134,.05);border-radius:14px;}`,
        `.hero-body{background:linear-gradient(135deg,#F2F8F9,#E7F3F5) !important;}`,
        `.btn-primary,.shader-btn-primary{background:${teal};color:#FFFFFF;border:none;box-shadow:0 2px 8px rgba(14,124,134,.25);border-radius:12px;font-weight:600;}`,
        `.shader-badge{background:#E4F2F4;border:1px solid ${teal}55;color:${storeEdDarken(teal,.15)};font-weight:700;letter-spacing:.05em;}`,
        `.trust-tile{background:#FFFFFF;border:1px solid rgba(14,124,134,.14);}`,
        `h1,h2,h3{color:#0B2529;font-weight:700;letter-spacing:.005em;}`,
        `.sm-item{background:#FFFFFF;border:1px solid rgba(14,124,134,.12);}`,
        `.particle{display:none !important;}#liquidFoil{display:none;}`
      ]
    };
  }
  function storeEdStyleRetropop(draft) {
    // Retro Pop: warm 1970s — cream ground, burnt orange, groovy serif,
    // thick outlines and offset shadows, sticker badges.
    const p = draft.palette || {};
    const orange = p.brand || '#E85D26'; const brown = p.ink || '#3A2418';
    return {
      tokens: { paper: '#FAF1DE', paperHi: '#FFF7E7', paperLo: '#F0E3C6',
                ink: brown, tHi: brown, tMid: '#6B4F3C', tLow: '#8A6D55' },
      rules: [
        `--sh-d: rgba(58,36,24,.22); --sh-l: rgba(255,250,235,.85);`,
        `--neo-1: 3px 4px 0 rgba(58,36,24,.35);`,
        `--neo-2: 6px 7px 0 rgba(58,36,24,.3);`,
        `--neo-in: inset 2px 3px 0 rgba(58,36,24,.12);`,
        `--shadow: var(--neo-1); --shadow-xs: 2px 3px 0 rgba(58,36,24,.3); --shadow-sm: 4px 5px 0 rgba(58,36,24,.3);`,
        `--radius: 22px; --font-display: 'Fraunces', Georgia, serif;`,
        `body{background:#FAF1DE !important;}`,
        `.navbar{background:${orange};border-radius:0 0 24px 24px;box-shadow:0 4px 0 rgba(58,36,24,.25);}`,
        `.navbar a,.nav-link{color:#FFF7E7 !important;}`,
        `.card,.product-card,.cat-card,.cat-card-sm{background:#FFF7E7 !important;border:2.5px solid ${brown};box-shadow:var(--neo-1);border-radius:24px;}`,
        `.hero-body{background:radial-gradient(circle at 30% 20%, #FFD97A 0%, #FAF1DE 55%) !important;}`,
        `.btn-primary,.shader-btn-primary{background:${brown};color:#FAF1DE;border:2.5px solid ${brown};box-shadow:4px 4px 0 ${orange};border-radius:40px;font-weight:700;}`,
        `.shader-badge{background:${orange};color:#FFF7E7;border:2px solid ${brown};border-radius:40px;font-weight:700;}`,
        `.trust-tile{background:#FFD97A;border:2.5px solid ${brown};box-shadow:var(--neo-1);}`,
        `h1,h2,h3{font-family:'Fraunces',Georgia,serif;color:${brown};font-weight:600;}`,
        `.particle{display:none !important;}#liquidFoil{display:none;}`
      ]
    };
  }
  function storeEdStyleEditorial(draft) {
    // Editorial Botanical: magazine layout — oversized italic serif,
    // off-white/sage, hairline rules, zero chrome.
    const p = draft.palette || {};
    const sage = p.brand || '#4A5B35'; const ink = p.ink || '#1E2218';
    return {
      tokens: { paper: '#F6F4EC', paperHi: '#FBFAF5', paperLo: '#EAE7DA',
                ink: ink, tHi: ink, tMid: '#4E5343', tLow: '#6E7462' },
      rules: [
        `--sh-d: rgba(30,34,24,.12); --sh-l: #FBFAF5;`,
        `--neo-1: none; --neo-2: none; --neo-in: none;`,
        `--shadow: none; --shadow-xs: none; --shadow-sm: none;`,
        `--radius: 4px; --font-display: 'Playfair Display', Georgia, serif;`,
        `body{background:#F6F4EC !important;}`,
        `.navbar{background:#F6F4EC;border-bottom:1.5px solid ${ink} !important;box-shadow:none;}`,
        `.card,.product-card,.cat-card,.cat-card-sm{background:#FBFAF5 !important;border:none;border-top:1.5px solid ${ink};box-shadow:none;border-radius:0;}`,
        `.hero-body{background:#F6F4EC !important;border-bottom:1.5px solid ${ink};}`,
        `.btn-primary,.shader-btn-primary{background:${ink};color:#F6F4EC;border:none;border-radius:0;font-weight:500;letter-spacing:.08em;text-transform:uppercase;}`,
        `.shader-badge{background:none;border:1.5px solid ${ink};color:${ink};border-radius:0;font-weight:600;letter-spacing:.14em;text-transform:uppercase;}`,
        `h1,h2,h3{font-family:'Playfair Display',Georgia,serif;color:${ink};font-weight:500;font-style:italic;}`,
        `.trust-tile{background:none;border:none;border-top:1.5px solid ${ink};border-radius:0;}`,
        `.particle{display:none !important;}#liquidFoil{display:none;}`
      ]
    };
  }
  const STORE_ED_STYLES = [
    { key: 'default', name: 'Crimson Classic', icon: '🩸', fn: storeEdStyleDefault,
      swatch: ['linear-gradient(135deg,#F5F3F4 50%,#C0394A 50%)','#F5F3F4'],
      desc: 'The current live look — warm paper, crimson brand, soft neumorphic depth.' },
    { key: 'clay', name: 'Claymorphism', icon: '🫧', fn: storeEdStyleClay,
      swatch: ['linear-gradient(135deg,#F6F3FA,#E8E1F2)','#F6F3FA'],
      desc: 'Soft inflatable clay — puffy 3D faces with inner highlights and bouncy hover lift.' },
    { key: 'aurora', name: 'Aurora UI', icon: '🌌', fn: storeEdStyleAurora,
      swatch: ['linear-gradient(135deg,#C9B8F0,#B9D6F7,#F5C1DD)','#E3DCF9'],
      desc: 'Northern-lights gradients with frosted-glass surfaces floating over the glow.' },
    { key: 'bento', name: 'Bento Grid', icon: '🗃️', fn: storeEdStyleBento,
      swatch: ['linear-gradient(135deg,#FFFFFF 50%,#EDEDF0 50%)','#FFFFFF'],
      desc: 'Tidy rounded boxes in a clean grid — subtle outlines, calm elevation.' },
    { key: 'brutal', name: 'Neo-Brutalism', icon: '🧱', fn: storeEdStyleBrutal,
      swatch: ['linear-gradient(135deg,#FFEFD8 50%,#111 50%)','#FFEFD8'],
      desc: 'Bold outlines, hard offset shadows and stark uppercase type — confident contrast.' },
    { key: 'skeuo', name: 'Skeuomorphism', icon: '🪵', fn: storeEdStyleSkeuo,
      swatch: ['linear-gradient(135deg,#F6EFE3,#D9CBB3)','#F6EFE3'],
      desc: 'Real-world materials — leather-toned gradient panels and extruded buttons.' },
    { key: 'material', name: 'Material / Flat', icon: '🪄', fn: storeEdStyleMaterial,
      swatch: ['linear-gradient(135deg,#FFFFFF 50%,#FAFAF9 50%)','#FFFFFF'],
      desc: 'Minimal 2D flatness — crisp surfaces, gentle elevation, zero gloss.' },
    { key: 'midnight', name: 'Midnight Luxe', icon: '🌙', fn: storeEdStyleMidnight,
      swatch: ['linear-gradient(135deg,#101217 50%,#C9A24B 50%)','#101217'],
      desc: 'Dark premium — ink-black surfaces, gold accents, luxury serif — a high-end night-time beauty boutique.' },
    { key: 'freshpharm', name: 'Fresh Pharmacy', icon: '🩺', fn: storeEdStyleFreshpharm,
      swatch: ['linear-gradient(135deg,#FFFFFF 50%,#0E7C86 50%)','#FFFFFF'],
      desc: 'Clinical and trustworthy — crisp white, teal brand, strict grid — a modern digital pharmacy.' },
    { key: 'retropop', name: 'Retro Pop', icon: '🟠', fn: storeEdStyleRetropop,
      swatch: ['linear-gradient(135deg,#FAF1DE 50%,#E85D26 50%)','#FAF1DE'],
      desc: 'Warm 1970s nostalgia — cream ground, burnt orange, groovy serif and sticker badges.' },
    { key: 'editorial', name: 'Editorial Botanical', icon: '🌿', fn: storeEdStyleEditorial,
      swatch: ['linear-gradient(135deg,#F6F4EC 50%,#4A5B35 50%)','#F6F4EC'],
      desc: 'Wellness print-magazine — oversized italic serif, sage accents, hairline rules, zero chrome.' },
  ];

  // ── Combinations registry ───────────────────────────────────────
  const STORE_ED_COMBOS = {
    corners: { title: '📐 Corner radius', opt: 'radius', items: [
      { v: 'default', label: 'Pill (default)' }, { v: 'medium', label: 'Medium' },
      { v: 'sharp', label: 'Sharp' }, { v: 'extra', label: 'Extra round' } ] },
    shadows: { title: '🌑 Shadow system', opt: 'shadows', items: [
      { v: 'default', label: 'Neumorphic (default)' }, { v: 'soft', label: 'Soft flat' },
      { v: 'none', label: 'None' }, { v: 'clay', label: 'Clay puff' },
      { v: 'hard', label: 'Hard offset' }, { v: 'layered', label: 'Layered depth' } ] },
    buttons: { title: '🔘 Button style', opt: 'buttons', items: [
      { v: 'flat', label: 'Flat' }, { v: 'raised', label: 'Raised' },
      { v: 'extruded', label: 'Extruded clay' }, { v: 'outline', label: 'Bold outline' } ] },
    borders: { title: '⬛ Borders', opt: 'borders', items: [
      { v: 'none', label: 'None' }, { v: 'hairline', label: 'Hairline' },
      { v: 'bold', label: 'Bold outline' } ] },
    weight: { title: '🔤 Text weight', opt: 'weight', items: [
      { v: 'light', label: 'Light' }, { v: 'regular', label: 'Regular' },
      { v: 'bold', label: 'Bold headings' } ] },
    density: { title: '📏 Spacing density', opt: 'density', items: [
      { v: 'compact', label: 'Compact' }, { v: 'normal', label: 'Normal' },
      { v: 'airy', label: 'Airy' } ] },
    bgfx: { title: '🎆 Background FX', opt: 'bgfx', items: [
      { v: 'clean', label: 'Clean' }, { v: 'bubbles', label: 'Bubbles' },
      { v: 'aurora', label: 'Aurora glow' }, { v: 'noise', label: 'Paper noise' } ] },
    cardstyle: { title: '🃏 Card style', opt: 'cardstyle', items: [
      { v: 'neumorphic', label: 'Neumorphic' }, { v: 'flat', label: 'Flat' },
      { v: 'clay', label: 'Clay' }, { v: 'bento', label: 'Bento tile' } ] },
    banner: { title: '🖼️ Banner height', opt: 'banner', items: [
      { v: 'full', label: 'Full (640px)' }, { v: 'medium', label: 'Medium (460px)' },
      { v: 'compact', label: 'Compact (300px)' } ] },
    cards: { title: '📦 Card size', opt: 'cards', items: [
      { v: 's', label: 'Small' }, { v: 'm', label: 'Medium (default)' },
      { v: 'l', label: 'Large' } ] },
    cardborder: { title: '🔲 Card border', opt: 'cardborder', items: [
      { v: 'none', label: 'None' }, { v: 'thin', label: 'Thin' },
      { v: 'medium', label: 'Medium' }, { v: 'thick', label: 'Thick black' } ] },
    imgshape: { title: '🟦 Image shape', opt: 'imgshape', items: [
      { v: 'square', label: 'Square (default)' }, { v: 'rounded', label: 'Rounded' },
      { v: 'circle', label: 'Circle' } ] },
    imgfit: { title: '📐 Image fit', opt: 'imgfit', items: [
      { v: 'cover', label: 'Cover (default)' }, { v: 'contain', label: 'Contain' },
      { v: 'center', label: 'Center crop' } ] },
    imgpos: { title: '📌 Image placement', opt: 'imgpos', items: [
      { v: 'center', label: 'Center (default)' }, { v: 'top', label: 'Top' },
      { v: 'bottom', label: 'Bottom' } ] },
  };

  // ── Token assembly: defaults ← style ← combos ← palette ← pickers ─
  function storeEdBuildTokenMap(draft) {
    const p = draft.palette || {};
    const c = draft.combos || {};
    const st = STORE_ED_STYLES.find(x => x.key === (draft.style || 'default'));
    const map = {};
    const rules = [];

    // 1. Style preset defaults
    try {
      const s = (st && st.fn ? st.fn(draft) : storeEdStyleDefault(draft)) || {};
      Object.assign(map, s.tokens || {});
      if (s.rules) rules.push(...s.rules);
    } catch (_) {}

    // 2. Combo overrides (each maps to token strings)
    const brand = p.brand || '#C0394A', brandDeep = p.brandDeep || '#8E2333';
    switch (c.shadows) {
      case 'none':    rules.push('--neo-1:none;--neo-2:none;--neo-3:none;--neo-4:none;--neo-in:none;--shadow:none;--shadow-xs:none;--shadow-sm:none;'); break;
      case 'soft':    rules.push('--neo-1:0 1px 4px rgba(0,0,0,.08);--neo-2:0 3px 10px rgba(0,0,0,.09);--neo-in:none;--shadow-xs:0 1px 4px rgba(0,0,0,.08);--shadow-sm:0 3px 10px rgba(0,0,0,.09);'); break;
      case 'clay':    rules.push('--neo-1:8px 10px 16px rgba(90,80,110,.16), -6px -8px 14px rgba(255,255,255,.85);--neo-2:12px 14px 24px rgba(90,80,110,.18), -9px -11px 20px rgba(255,255,255,.8);--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-1);--radius:var(--r-lg);'); break;
      case 'hard':    rules.push('--neo-1:5px 5px 0 #111;--neo-2:8px 8px 0 #111;--neo-in:inset 4px 4px 0 rgba(0,0,0,.1);--shadow:var(--neo-1);--shadow-xs:3px 3px 0 #111;--shadow-sm:6px 6px 0 #111;--radius:var(--r-sm);'); break;
      case 'layered': rules.push('--neo-1:0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.06);--neo-2:0 4px 10px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.08);--shadow:var(--neo-1);--shadow-xs:var(--neo-1);--shadow-sm:var(--neo-1);'); break;
    }
    switch (c.buttons) {
      case 'flat':    rules.push(`.btn-primary,.shader-btn-primary{box-shadow:none;border:none;border-radius:var(--r-pill);}`); break;
      case 'extruded':rules.push(`.btn-primary,.shader-btn-primary{box-shadow:7px 8px 14px rgba(90,80,110,.18), -5px -6px 12px rgba(255,255,255,.85);}`); break;
      case 'outline': rules.push(`.btn-primary,.shader-btn-primary{border:2.5px solid #111;box-shadow:4px 4px 0 #111;box-shadow-offset:0;}`); break;
      default:        rules.push(`.btn-primary,.shader-btn-primary{box-shadow:0 2px 8px rgba(0,0,0,.15);}`); break;
    }
    switch (c.borders) {
      case 'none':  rules.push(`.card,.product-card,.cat-card,.cat-card-sm,.navbar{border:none !important;}`); break;
      case 'hairline': rules.push(`.card,.product-card,.cat-card,.cat-card-sm{border:1px solid rgba(0,0,0,.07) !important;}`); break;
      case 'bold':  rules.push(`.card,.product-card,.cat-card,.cat-card-sm,.navbar{border:2px solid #111 !important;}`); break;
    }
    switch (c.weight) {
      case 'light': rules.push('h1,h2,h3{font-weight:400;}'); break;
      case 'bold':  rules.push('h1,h2,h3{font-weight:800;}'); break;
    }
    switch (c.density) {
      case 'compact': rules.push('.card,.product-card,.cat-card{padding:12px 14px !important;}'); break;
      case 'airy':    rules.push('.card,.product-card,.cat-card{padding:26px 30px !important;}'); break;
    }
    switch (c.bgfx) {
      case 'bubbles': rules.push('.particle{display:none !important;}#liquidFoil{display:none;}'); break;
      case 'aurora':  rules.push(`body{background:radial-gradient(900px 500px at 12% -5%, rgba(75,123,229,.35), transparent 55%), radial-gradient(800px 500px at 88% 8%, rgba(155,93,229,.3), transparent 52%), linear-gradient(180deg, #F7F4FC, #EEF2FA);}#liquidFoil{display:none !important;}`); break;
      case 'noise':   rules.push(`body::before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}`); break;
      case 'clean':   rules.push('.particle{display:none !important;}#liquidFoil{display:none;}'); break;
    }
    switch (c.cardstyle) {
      case 'flat': rules.push('.product-card,.cat-card,.cat-card-sm{box-shadow:none;border:1px solid rgba(0,0,0,.07);}'); break;
      case 'clay': rules.push(`.product-card,.cat-card,.cat-card-sm{box-shadow:8px 10px 16px rgba(90,80,110,.16), -6px -8px 14px rgba(255,255,255,.85);border-radius:var(--r-lg);}`); break;
      case 'bento':rules.push(`.product-card,.cat-card,.cat-card-sm{box-shadow:0 0 0 1px rgba(30,30,36,.06), 0 2px 8px rgba(30,30,36,.06);border-radius:var(--r-md);}div.products-grid,div.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;}`); break;
      default:     rules.push(`.product-card,.cat-card,.cat-card-sm{box-shadow:var(--neo-1);}`); break;    // v10.4 — Design & Layout controls
    if (c.banner === 'full')        rules.push('.hero-banner,.hero-banner-slide img{min-height:640px;}.hero-banner-slide img{aspect-ratio:auto;height:640px;object-fit:cover !important;}#shopBannerSlot1 img,#shopBannerSlot2 img{height:460px !important;}');
    else if (c.banner === 'compact') rules.push('.hero-banner,.hero-banner-slide img{min-height:300px;}.hero-banner-slide img{aspect-ratio:auto;height:300px;object-fit:cover !important;}#shopBannerSlot1 img,#shopBannerSlot2 img{height:240px !important;}');
    else                            rules.push('.hero-banner,.hero-banner-slide img{min-height:460px;}.hero-banner-slide img{aspect-ratio:auto;height:460px;object-fit:cover !important;}#shopBannerSlot1 img,#shopBannerSlot2 img{height:360px !important;}');
    if (c.cards === 's')      rules.push('.products-grid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr)) !important;}.product-card .p-info{font-size:.82rem !important;}.product-card{padding:5px !important;}');
    else if (c.cards === 'l') rules.push('.products-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr)) !important;}.product-card .p-info{font-size:1rem !important;}.product-card{padding:11px !important;}');
    else                      rules.push('.products-grid{grid-template-columns:repeat(auto-fill,minmax(252px,1fr)) !important;}.product-card .p-info{font-size:.9rem !important;}.product-card{padding:7px !important;}');
    if (c.cardborder === 'none')   rules.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:none !important;box-shadow:none !important;}');
    else if (c.cardborder === 'thin')   rules.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:1px solid rgba(0,0,0,.09) !important;}');
    else if (c.cardborder === 'medium') rules.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:2.5px solid rgba(0,0,0,.16) !important;}');
    else if (c.cardborder === 'thick')  rules.push('.product-card,.cat-card,.cat-card-sm,.promo-card-media{border:4px solid #111 !important;}');
    if (c.imgshape === 'rounded') rules.push('.p-img-wrap,.p-img-wrap img,.promo-card-media,.promo-card-media img,.blog-img,.blog-img img{border-radius:18px !important;}');
    else if (c.imgshape === 'circle') rules.push('.p-img-wrap,.p-img-wrap img,.promo-card-media,.promo-card-media img,.blog-img,.blog-img img{border-radius:50% !important;}.p-img-wrap img{aspect-ratio:1/1 !important;object-fit:cover !important;}');
    if (c.imgfit === 'contain')  rules.push('.hero-banner-slide img,.p-img-wrap img,.shop-banner-slot img,.promo-card-media img,.blog-img img{object-fit:contain !important;}');
    else if (c.imgfit === 'center') rules.push('.hero-banner-slide img,.p-img-wrap img,.shop-banner-slot img,.promo-card-media img,.blog-img img{object-fit:cover !important;object-position:center !important;}');
    if (c.imgpos === 'top')    rules.push('.hero-banner-slide img,.shop-banner-slot img,.p-img-wrap img{object-position:top !important;}');
    else if (c.imgpos === 'bottom') rules.push('.hero-banner-slide img,.shop-banner-slot img,.p-img-wrap img{object-position:bottom !important;}');
    else if (c.imgpos === 'center') rules.push('.hero-banner-slide img,.shop-banner-slot img,.p-img-wrap img{object-position:center !important;}');

    }
    return { map, rules };
  }

  // ── UI: style strip + combos section ────────────────────────────
  function renderStyleStrip() {
    const box = document.getElementById('storeEdStyles');
    if (!box) return;
    box.innerHTML = STORE_ED_STYLES.map(s => {
      const active = (storeEdDraft.style || 'default') === s.key;
      return `<button class="store-ed-style-tile ${active ? 'active' : ''}" data-se-style="${s.key}" onclick="storeEdApplyStyle('${s.key}')" title="${storeEdEscapeAttr(s.desc)}">
        <div class="store-ed-style-swatch" style="background:${s.swatch[0]};border:1px solid ${active ? 'var(--gold)' : 'rgba(0,0,0,.12)'};border-radius:10px;"></div>
        <div class="store-ed-style-name">${s.icon} ${s.name}${active ? ' ✓' : ''}</div>
      </button>`;
    }).join('');
  }

  // ── v10.3 template presets: the tuned palette each template ships with ──
  const TEMPLATE_PALETTE = {
    midnight:   { name: 'Midnight Luxe', palette: {
        paper:'#101217', paperHi:'#171A21', paperLo:'#0A0C10', white:'#171A21',
        brand:'#C9A24B', brandDeep:'#967833', brandHi:'#E0BC6A',
        secondary:'#8F7A52', secondaryHi:'#2A2516',
        ink:'#F2EFE8', inkMid:'#A9A498', tHi:'#F2EFE8', tMid:'#A9A498', tLow:'#7C786E',
        flavour1:'#C9A24B', flavour2:'#5B5444', flavour3:'#A67C52', flavour4:'#3D4A5C' } },
    freshpharm: { name: 'Fresh Pharmacy', palette: {
        paper:'#FFFFFF', paperHi:'#FFFFFF', paperLo:'#F2F6F7', white:'#FFFFFF',
        brand:'#0E7C86', brandDeep:'#095A62', brandHi:'#2FA0AB',
        secondary:'#3E8E97', secondaryHi:'#DCEEF1',
        ink:'#0B2529', inkMid:'#3A5559', tHi:'#0B2529', tMid:'#3A5559', tLow:'#5F7A7E',
        flavour1:'#0E7C86', flavour2:'#3A5559', flavour3:'#2FA0AB', flavour4:'#5FB8BF' } },
    retropop:   { name: 'Retro Pop', palette: {
        paper:'#FAF1DE', paperHi:'#FFF7E7', paperLo:'#F0E3C6', white:'#FFF7E7',
        brand:'#E85D26', brandDeep:'#C44A18', brandHi:'#F28A5E',
        secondary:'#3A2418', secondaryHi:'#FFD97A',
        ink:'#3A2418', inkMid:'#6B4F3C', tHi:'#3A2418', tMid:'#6B4F3C', tLow:'#8A6D55',
        flavour1:'#E85D26', flavour2:'#FFD97A', flavour3:'#3A2418', flavour4:'#B5543A' } },
    editorial:  { name: 'Editorial Botanical', palette: {
        paper:'#F6F4EC', paperHi:'#FBFAF5', paperLo:'#EAE7DA', white:'#FBFAF5',
        brand:'#4A5B35', brandDeep:'#334122', brandHi:'#6A7C4E',
        secondary:'#6E7462', secondaryHi:'#E3E6D8',
        ink:'#1E2218', inkMid:'#4E5343', tHi:'#1E2218', tMid:'#4E5343', tLow:'#6E7462',
        flavour1:'#4A5B35', flavour2:'#6E7462', flavour3:'#8C8C5C', flavour4:'#3E4630' } }
  };
  function storeEdApplyStyle(key) {
    storeEdDraft.style = key;
    // v10.3: templates carry their own tuned palette so one click
    // recolors the whole website (custom pickers still win afterward).
    var tpl = TEMPLATE_PALETTE[key];
    if (tpl && tpl.palette) {
      storeEdDraft.palette = Object.assign({}, tpl.palette);
    }
    storeEdSetDraft(storeEdDraft);
    renderStyleStrip();
    storeEdSchedulePreview();
  }

  function renderCombos() {
    const box = document.getElementById('storeEdCombos');
    if (!box) return;
    const isOpen = box.dataset.open === '1';
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:2px 4px;" onclick="storeEdToggleCombos()">
        <span class="card-title" style="font-size:0.92rem;font-weight:700;">🧩 Combinations — mix & match details</span>
        <span style="margin-left:auto;font-size:0.7rem;color:var(--text3);">${isOpen ? '▾ hide' : '▸ show ' + Object.keys(STORE_ED_COMBOS).length + ' controls'}</span>
      </div>
      ${isOpen ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;padding:14px 4px 4px;">` +
        Object.entries(STORE_ED_COMBOS).map(([k, g]) => {
          const val = storeEdDraft.combos && storeEdDraft.combos[k] ? storeEdDraft.combos[k] : g.items[0].v;
          return `<div>
            <div style="font-size:0.76rem;font-weight:700;color:var(--text);margin-bottom:6px;">${g.title}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">` +
            g.items.map(it => `<button class="btn btn-secondary btn-sm" data-combo="${k}" data-val="${it.v}" onclick="storeEdComboClick(this)" style="${(storeEdDraft.combos||{})[k] === it.v ? 'background:var(--gold);color:#fff;' : ''}">${it.label}</button>`).join('') +
            `</div></div>`;
        }).join('') + `</div>` : ''}`;
  }

  function storeEdToggleCombos() {
    const box = document.getElementById('storeEdCombos');
    if (!box) return;
    box.dataset.open = box.dataset.open === '1' ? '0' : '1';
    renderCombos();
  }

  function storeEdComboClick(btn) {
    const k = btn.dataset.combo, v = btn.dataset.val;
    if (!storeEdDraft.combos) storeEdDraft.combos = {};
    storeEdDraft.combos[k] = v;
    storeEdSetDraft(storeEdDraft);
    renderCombos();
    storeEdSchedulePreview();
  }

  // Patch the existing preview stylesheet to include style+combo rules.
  // The iframe loader in index.html reads draft.style/combos from the
  // same localStorage blob — so nothing extra is needed on the
  // storefront side once the loader is extended (v10 loader block).
  window.storeEdApplyStyle = storeEdApplyStyle;
  window.storeEdToggleCombos = storeEdToggleCombos;
  window.STORE_ED_STYLES = STORE_ED_STYLES;
  window.STORE_ED_COMBOS = STORE_ED_COMBOS;
  window.renderStyleStrip = renderStyleStrip;
  window.renderCombos = renderCombos;
  window.storeEdComboClick = storeEdComboClick;
  window.storeEdBuildTokenMap = storeEdBuildTokenMap;
})();
// Late pass: the v10 engine loads after renderStoreEditor already ran,
// so populate the style strip + combos now that the functions exist.
if (typeof renderStyleStrip === 'function') { try { renderStyleStrip(); } catch(_) {} }
if (typeof renderCombos === 'function' )   { try { renderCombos(); } catch(_) {} }

